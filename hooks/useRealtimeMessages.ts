'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface UseRealtimeMessagesProps {
  onMessageUpdate: () => void
}

export function useRealtimeMessages({ onMessageUpdate }: UseRealtimeMessagesProps) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    // Abonnement Realtime messages (INSERT/UPDATE)
    const channel = supabase
      .channel(`messages-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_user=eq.${user.id}`
        },
        (payload: any) => {
          // eslint-disable-next-line no-console
          console.log('Nouveau message re&ccedil;u&nbsp;:', payload)
          onMessageUpdate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `from_user=eq.${user.id}`
        },
        (payload: any) => {
          // eslint-disable-next-line no-console
          console.log('Message mis &agrave; jour&nbsp;:', payload)
          onMessageUpdate()
        }
      )
      .subscribe()
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, onMessageUpdate])
}