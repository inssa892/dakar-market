import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>()

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']

// Helper functions for real-time subscriptions
export const subscribeToOrders = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`orders:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `merchant_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToMessages = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_user=eq.${userId}`
      },
      callback
    )
    .subscribe()
}