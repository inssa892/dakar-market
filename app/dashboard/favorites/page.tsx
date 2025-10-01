
'use client'
import React from 'react';

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { favoritesApi, cartApi } from '@/lib/api'
import { toast } from 'sonner'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface FavoriteWithProduct {
  id: string
  product: {
    id: string
    title: string
    description?: string
    price: number
    image_url?: string | string[]
    user_id: string
  }
}

export default function FavoritesPage() {
  const { user, profile } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteWithProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Déclare la fonction avec useCallback pour la stabilité
  const loadFavorites = React.useCallback(async () => {
    if (!user) return;
    try {
      const data = await favoritesApi.getItems(user.id);
      setFavorites(data);
    } catch (error: any) {
      toast.error('Échec du chargement des favoris');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (profile?.role !== 'client') return;
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites, profile]);

  // Redirect if not client
  if (profile?.role !== 'client') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Les favoris ne sont disponibles que pour les clients.</p>
      </div>
    );
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      const favorite = favorites.find(f => f.id === favoriteId)
      if (favorite) {
        await favoritesApi.removeItem(user!.id, favorite.product.id)
      }

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId))
      toast.success('Retiré des favoris')
    } catch (error: any) {
      toast.error('Échec de la suppression des favoris')
    }
  }

  const addToCart = async (productId: string) => {
    if (!user) return

    try {
      await cartApi.addItem(user.id, productId, 1)
      toast.success('Ajouté au panier')
    } catch (error: any) {
      toast.error('Échec de l\'ajout au panier')
    }
  }

  const getProductImage = (imageUrl?: string | string[]) => {
    if (!imageUrl) return null
    if (Array.isArray(imageUrl)) {
      return imageUrl[0] || null
    }
    return imageUrl
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Aucun favori pour le moment</h2>
        <p className="text-muted-foreground mb-6">
          Commencez à parcourir les produits et ajoutez-les à vos favoris
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
        <h1 className="text-3xl font-bold">Mes favoris</h1>
        <p className="text-muted-foreground">
          {favorites.length} produit{favorites.length !== 1 ? 's' : ''} favori{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Favorites Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites.map((favorite) => (
          <Card key={favorite.id} className="group overflow-hidden transition-all hover:shadow-lg">
            <div className="aspect-square relative overflow-hidden">
              {getProductImage(favorite.product.image_url) ? (
                <Image
                  src={getProductImage(favorite.product.image_url)!}
                  alt={favorite.product.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Pas d&apos;image</span>
                </div>
              )}
              
              {/* Remove from favorites button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => removeFavorite(favorite.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 truncate">
                {favorite.product.title}
              </h3>
              {favorite.product.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {favorite.product.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  {favorite.product.price.toLocaleString('fr-FR')} CFA
                </span>
                <Button 
                  onClick={() => addToCart(favorite.product.id)} 
                  size="sm"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ajouter au panier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center pt-6">
        <Badge variant="outline">
          {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  )
}