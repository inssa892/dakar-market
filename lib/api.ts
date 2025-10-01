import { supabase } from './supabase'
import { toast } from 'sonner'

// Cart utilities
export const cartApi = {
  async getItems(clientId: string) {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(id, title, price, image_url, user_id)
      `)
      .eq('client_id', clientId)

    if (error) throw error
    return data || []
  },

  async addItem(clientId: string, productId: string, quantity: number = 1) {
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('client_id', clientId)
      .eq('product_id', productId)
      .single()

    if (existingItem) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert([{ client_id: clientId, product_id: productId, quantity }])

      if (error) throw error
    }
  },

  async updateQuantity(itemId: string, quantity: number) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)

    if (error) throw error
  },

  async removeItem(itemId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  },

  async clearCart(clientId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('client_id', clientId)

    if (error) throw error
  }
}

// Favorites utilities
export const favoritesApi = {
  async getItems(clientId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        product:products(id, title, description, price, image_url, user_id)
      `)
      .eq('client_id', clientId)

    if (error) throw error
    return data || []
  },

  async addItem(clientId: string, productId: string) {
    const { error } = await supabase
      .from('favorites')
      .insert([{ client_id: clientId, product_id: productId }])

    if (error) throw error
  },

  async removeItem(clientId: string, productId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('client_id', clientId)
      .eq('product_id', productId)

    if (error) throw error
  },

  async checkIsFavorite(clientId: string, productId: string) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('client_id', clientId)
      .eq('product_id', productId)
      .single()

    return !!data
  }
}

// Orders utilities
export const ordersApi = {
  async createOrder(orderData: {
    client_id: string
    product_id: string
    merchant_id: string
    quantity: number
    total: number
  }) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createMultipleOrders(orders: Array<{
    client_id: string
    product_id: string
    merchant_id: string
    quantity: number
    total: number
  }>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orders)
      .select()

    if (error) throw error
    return data
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: status as any,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) throw error
  },

  async getOrdersByClient(clientId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(title, price, image_url),
        merchant:profiles!orders_merchant_id_fkey(display_name, email)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getOrdersByMerchant(merchantId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(title, price, image_url),
        client:profiles!orders_client_id_fkey(display_name, email)
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Messages utilities
export const messagesApi = {
  async sendMessage(fromUser: string, toUser: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        from_user: fromUser,
        to_user: toUser,
        content: content.trim()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getConversation(user1: string, user2: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_user.eq.${user1},to_user.eq.${user2}),and(from_user.eq.${user2},to_user.eq.${user1})`)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async markAsRead(messageIds: string[]) {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .in('id', messageIds)

    if (error) throw error
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  }
}

// Products utilities
export const productsApi = {
  async getAll(filters?: {
    search?: string
    category?: string
    userId?: string
    sortBy?: string
  }) {
    let query = supabase.from('products').select('*')

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters?.sortBy) {
      query = query.order(filters.sortBy, { 
        ascending: filters.sortBy === 'price' 
      })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(productData: {
    user_id: string
    title: string
    description?: string
    price: number
    category: string
    image_url?: string
  }) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<{
    title: string
    description: string
    price: number
    category: string
    image_url: string
  }>) {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Storage utilities
export const storageApi = {
  async uploadImage(bucket: 'products' | 'avatars', file: File, userId: string) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = bucket === 'products' ? `products/${fileName}` : fileName

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  async deleteImage(bucket: 'products' | 'avatars', filePath: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error
  }
}