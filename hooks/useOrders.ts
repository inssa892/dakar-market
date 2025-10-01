'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface OrderWithDetails {
  id: string
  quantity: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  product: {
    title: string
    price: number
    image_url?: string
  }
  client: {
    display_name: string
    email: string
  }
  merchant: {
    display_name: string
    email: string
  }
}

interface OrderCounts {
  all: number
  pending: number
  confirmed: number
  shipped: number
  delivered: number
}

export function useOrders(statusFilter?: string) {
  const { user, profile } = useAuth()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [orderCounts, setOrderCounts] = useState<OrderCounts>({
    all: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0
  })
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(async () => {
    if (!user || !profile) return
    
    setLoading(true)
    try {
      let query = supabase.from('orders').select(`
        *,
        product:products(title, price, image_url),
        client:profiles!orders_client_id_fkey(display_name, email),
        merchant:profiles!orders_merchant_id_fkey(display_name, email)
      `)

      // Filtrer selon le rôle
      if (profile.role === 'merchant') {
        query = query.eq('merchant_id', user.id)
      } else {
        query = query.eq('client_id', user.id)
      }

      // Appliquer le filtre de statut si fourni
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des commandes:', error)
      toast.error('Échec du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }, [user, profile, statusFilter])

  const loadOrderCounts = useCallback(async () => {
    if (!user || !profile) return

    try {
      let query = supabase.from('orders').select('status', { count: 'exact' })

      if (profile.role === 'merchant') {
        query = query.eq('merchant_id', user.id)
      } else {
        query = query.eq('client_id', user.id)
      }

      const { data, error, count } = await query

      if (error) throw error

      const counts = {
        all: count || 0,
        pending: data?.filter(o => o.status === 'pending').length || 0,
        confirmed: data?.filter(o => o.status === 'confirmed').length || 0,
        shipped: data?.filter(o => o.status === 'shipped').length || 0,
        delivered: data?.filter(o => o.status === 'delivered').length || 0
      }

      setOrderCounts(counts)
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }, [user, profile])

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) throw error

      toast.success('Statut de la commande mis à jour')
      
      // Mettre à jour localement
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any }
            : order
        )
      )
      
      // Recharger les compteurs
      loadOrderCounts()
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Échec de la mise à jour du statut')
    }
  }, [loadOrderCounts])

  useEffect(() => {
    if (user && profile) {
      loadOrders()
      loadOrderCounts()
    }
  }, [loadOrders, loadOrderCounts])

  return {
    orders,
    orderCounts,
    loading,
    updateOrderStatus,
    refreshOrders: loadOrders,
    refreshCounts: loadOrderCounts
  }
}