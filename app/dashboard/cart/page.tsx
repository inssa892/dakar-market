
'use client'
import React from 'react';

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { cartApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react'
import Image from 'next/image'

interface CartItemWithProduct {
  id: string
  quantity: number
  product: {
    id: string
    title: string
    price: number
    image_url?: string | string[]
    user_id: string
  }
}

export default function CartPage() {
  const { user, profile } = useAuth()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // Déclare la fonction avec useCallback pour la stabilité
  const loadCartItems = React.useCallback(async () => {
    if (!user) return;
    try {
      const data = await cartApi.getItems(user.id);
      setCartItems(data);
    } catch (error: any) {
      toast.error('Échec du chargement du panier');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (profile?.role !== 'client') return;
    if (user) {
      loadCartItems();
      // Real-time subscription for cart updates
      const channel = supabase
        .channel(`cart-realtime-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `client_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Cart update detected:', payload);
            loadCartItems();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, loadCartItems, profile]);

  // Redirect if not client
  if (profile?.role !== 'client') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Le panier n&apos;est disponible que pour les clients.</p>
      </div>
    );
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      await cartApi.updateQuantity(itemId, newQuantity)
      
      // Update local state immediately for better UX
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
    } catch (error: any) {
  toast.error('Échec de la mise à jour de la quantit&eacute;')
      // Reload on error to sync state
      loadCartItems()
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await cartApi.removeItem(itemId)
      
      // Update local state immediately
      setCartItems(prev => prev.filter(item => item.id !== itemId))
  toast.success('Article retir&eacute; du panier')
    } catch (error: any) {
  toast.error('Échec de la suppression de l&apos;article')
      // Reload on error to sync state
      loadCartItems()
    }
  }

  const checkout = async () => {
    if (!user || cartItems.length === 0) return

    setCheckoutLoading(true)
    try {
      // Create orders for each cart item
      const orders = cartItems.map(item => ({
        client_id: user.id,
        product_id: item.product.id,
        merchant_id: item.product.user_id,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
        status: 'pending' as const
      }))

      // Import ordersApi
      const { ordersApi } = await import('@/lib/api')
      await ordersApi.createMultipleOrders(orders)

      // Clear cart
      await cartApi.clearCart(user.id)

      setCartItems([])
  toast.success('Commande pass&eacute;e avec succ&egrave;s&nbsp;!')
    } catch (error: any) {
  toast.error('Échec de la commande&nbsp;: ' + error.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const getProductImage = (imageUrl?: string | string[]) => {
    if (!imageUrl) return null
    if (Array.isArray(imageUrl)) {
      return imageUrl[0] || null
    }
    return imageUrl
  }

  const totalAmount = cartItems.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
  <h2 className="text-2xl font-semibold mb-2">Votre panier est vide</h2>
        <p className="text-muted-foreground mb-6">
          Commencez vos achats pour ajouter des articles &agrave; votre panier
        </p>
        <Button onClick={() => window.location.href = '/dashboard/products'}>
          Parcourir les produits
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
  <h1 className="text-3xl font-bold">Panier d&apos;achat</h1>
        <p className="text-muted-foreground">
          {cartItems.length} article{cartItems.length !== 1 ? '&apos;s&apos;' : ''} dans votre panier
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {getProductImage(item.product.image_url) ? (
                      <Image
                        src={getProductImage(item.product.image_url)!}
                        alt={item.product.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">Pas d&apos;image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.product.title}</h3>
                    <p className="text-lg font-bold text-primary">
                      {item.product.price.toLocaleString('fr-FR')} CFA
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Total & Remove */}
                  <div className="flex flex-col items-end space-y-2">
                    <p className="font-semibold">
                      {(item.product.price * item.quantity).toLocaleString('fr-FR')} CFA
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{totalAmount.toLocaleString('fr-FR')} CFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{totalAmount.toLocaleString('fr-FR')} CFA</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={checkout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  'Traitement...'
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Commander
                  </>
                )}
              </Button>

              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  Paiement sécurisé par Supabase
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}