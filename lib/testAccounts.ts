import { supabase } from './supabase'
import { toast } from 'sonner'

export const testAccounts = {
  client: {
    email: 'client@test.com',
    password: 'testclient123',
    displayName: 'Test Client',
    role: 'client' as const
  },
  merchant: {
    email: 'merchant@test.com',
    password: 'testmerchant123',
    displayName: 'Test Merchant',
    role: 'merchant' as const
  }
}

export const createTestAccounts = async () => {
  try {
    // Create client account
    const { data: clientData, error: clientError } = await supabase.auth.signUp({
      email: testAccounts.client.email,
      password: testAccounts.client.password,
      options: {
        data: {
          display_name: testAccounts.client.displayName,
          role: testAccounts.client.role,
        }
      }
    })

    if (clientData.user && !clientError) {
      await supabase
        .from('profiles')
        .insert([
          {
            id: clientData.user.id,
            email: clientData.user.email!,
            display_name: testAccounts.client.displayName,
            role: testAccounts.client.role,
          }
        ])
    }

    // Create merchant account
    const { data: merchantData, error: merchantError } = await supabase.auth.signUp({
      email: testAccounts.merchant.email,
      password: testAccounts.merchant.password,
      options: {
        data: {
          display_name: testAccounts.merchant.displayName,
          role: testAccounts.merchant.role,
        }
      }
    })

    if (merchantData.user && !merchantError) {
      await supabase
        .from('profiles')
        .insert([
          {
            id: merchantData.user.id,
            email: merchantData.user.email!,
            display_name: testAccounts.merchant.displayName,
            role: testAccounts.merchant.role,
          }
        ])
    }

    return {
      client: { data: clientData, error: clientError },
      merchant: { data: merchantData, error: merchantError }
    }
  } catch (error) {
    console.error('Error creating test accounts:', error)
    throw error
  }
}

export const signInWithTestAccount = async (accountType: 'client' | 'merchant') => {
  const account = testAccounts[accountType]
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    })

    if (error) throw error
    
    toast.success(`Signed in as ${account.displayName}`)
    return { data, error: null }
  } catch (error: any) {
    toast.error(error.message)
    return { data: null, error }
  }
}