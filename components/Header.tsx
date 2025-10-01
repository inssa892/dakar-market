'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ShoppingCart, Heart, User, Sun, Moon, LogOut, Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useTheme } from 'next-themes'


export default function Header() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [cartCount, setCartCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Déclarer loadCounts AVANT le useEffect qui l'utilise
  const loadCartCount = React.useCallback(async () => {
    if (!user || profile?.role !== 'client') return
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
    setCartCount(count || 0)
  }, [user, profile])

  const loadFavoritesCount = React.useCallback(async () => {
    if (!user || profile?.role !== 'client') return
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', user.id)
    setFavoritesCount(count || 0)
  }, [user, profile])

  const loadUnreadMessages = React.useCallback(async () => {
    if (!user) return
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user', user.id)
      .eq('read', false)
    setUnreadMessages(count || 0)
  }, [user])

  const loadCounts = React.useCallback(async () => {
    if (!user) return
    await Promise.all([
      loadCartCount(),
      loadFavoritesCount(),
      loadUnreadMessages()
    ])
  }, [user, loadCartCount, loadFavoritesCount, loadUnreadMessages])

  useEffect(() => {
    setMounted(true)
    if (user && profile) {
      loadCounts()
      // Set up real-time subscriptions
      const cartSubscription = supabase
        .channel(`cart:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `client_id=eq.${user.id}`
          },
          () => loadCartCount()
        )
        .subscribe()

      const favoritesSubscription = supabase
        .channel(`favorites:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'favorites',
            filter: `client_id=eq.${user.id}`
          },
          () => loadFavoritesCount()
        )
        .subscribe()

      const messagesSubscription = supabase
        .channel(`messages:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `to_user=eq.${user.id}`
          },
          () => loadUnreadMessages()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(cartSubscription)
        supabase.removeChannel(favoritesSubscription)
        supabase.removeChannel(messagesSubscription)
      }
    }
  }, [user, profile, loadCounts, loadCartCount, loadFavoritesCount, loadUnreadMessages])


  // Suppression des doublons : les fonctions sont déjà déclarées plus haut

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/products?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/dashboard/products')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (!mounted) return null

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-4 mt-8">
          <Link href="/dashboard" className="text-lg font-medium">
            Tableau de bord
          </Link>
          <Link href="/dashboard/products" className="text-lg font-medium">
            Produits
          </Link>
          {profile?.role === 'client' && (
            <>
              <Link href="/dashboard/cart" className="text-lg font-medium flex items-center">
                Panier
                {cartCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {cartCount}
                  </Badge>
                )}
              </Link>
              <Link href="/dashboard/favorites" className="text-lg font-medium flex items-center">
                Favoris
                {favoritesCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {favoritesCount}
                  </Badge>
                )}
              </Link>
            </>
          )}
          <Link href="/dashboard/orders" className="text-lg font-medium">
            Commandes
          </Link>
          <Link href="/dashboard/messages" className="text-lg font-medium flex items-center">
            Messages
            {unreadMessages > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadMessages}
              </Badge>
            )}
          </Link>
          <Link href="/dashboard/settings" className="text-lg font-medium">
            Paramètres
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <MobileNav />
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">D</span>
              </div>
              <span className="hidden sm:block text-xl font-bold">DakarMarket</span>
            </Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 sm:mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:flex"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {user && (
              <>
                {/* Messages */}
                <Link href="/dashboard/messages">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadMessages > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Client-specific actions */}
                {profile?.role === 'client' && (
                  <>
                    {/* Favorites */}
                    <Link href="/dashboard/favorites" className="hidden sm:block">
                      <Button variant="ghost" size="icon" className="relative">
                        <Heart className="h-4 w-4" />
                        {favoritesCount > 0 && (
                          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {favoritesCount > 9 ? '9+' : favoritesCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>

                    {/* Cart */}
                    <Link href="/dashboard/cart">
                      <Button variant="ghost" size="icon" className="relative">
                        <ShoppingCart className="h-4 w-4" />
                        {cartCount > 0 && (
                          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {cartCount > 9 ? '9+' : cartCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile?.display_name || profile?.email}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {profile?.role === 'merchant' ? 'Marchand' : 'Client'}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">Paramètres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">S&apos;inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}