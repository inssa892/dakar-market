'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface UseRealtimeOrdersProps {
  onOrderUpdate: () => void
}

export function useRealtimeOrders({ onOrderUpdate }: UseRealtimeOrdersProps) {
  const { user, profile } = useAuth()

  useEffect(() => {
    if (!user || !profile) return

    const channel = supabase
      .channel(`orders-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: profile.role === 'merchant' 
            ? `merchant_id=eq.${user.id}`
            : `client_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Mise à jour de commande en temps réel:', payload)
          onOrderUpdate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile, onOrderUpdate])
}