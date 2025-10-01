export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          role: 'client' | 'merchant'
          phone: string | null
          whatsapp_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'client' | 'merchant'
          phone?: string | null
          whatsapp_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'client' | 'merchant'
          phone?: string | null
          whatsapp_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          price: number
          image_url: string | string[] | null
          images: string[] | null
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          price: number
          image_url?: string | string[] | null
          images?: string[] | null
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          price?: number
          image_url?: string | string[] | null
          images?: string[] | null
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          client_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          product_id?: string
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          client_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          product_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          product_id: string
          merchant_id: string
          quantity: number
          total: number
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          product_id: string
          merchant_id: string
          quantity: number
          total: number
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          product_id?: string
          merchant_id?: string
          quantity?: number
          total?: number
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          from_user: string
          to_user: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          from_user: string
          to_user: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          from_user?: string
          to_user?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}