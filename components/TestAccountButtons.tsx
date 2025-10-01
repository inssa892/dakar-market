'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Store } from 'lucide-react'
import { signInWithTestAccount, testAccounts } from '@/lib/testAccounts'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TestAccountButtons() {
  const router = useRouter()
  const [loading, setLoading] = useState<'client' | 'merchant' | null>(null)

  const handleTestLogin = async (accountType: 'client' | 'merchant') => {
    setLoading(accountType)
    const { data, error } = await signInWithTestAccount(accountType)
    
    if (data && !error) {
      router.push('/dashboard')
    }
    
    setLoading(null)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-center text-lg">Test Accounts</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Use these pre-configured accounts to test the application
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Client
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> {testAccounts.client.email}</p>
              <p><strong>Password:</strong> {testAccounts.client.password}</p>
            </div>
            <Button 
              onClick={() => handleTestLogin('client')}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
            >
              {loading === 'client' ? 'Signing in...' : 'Sign in as Client'}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="default" className="flex items-center gap-1">
                <Store className="h-3 w-3" />
                Merchant
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> {testAccounts.merchant.email}</p>
              <p><strong>Password:</strong> {testAccounts.merchant.password}</p>
            </div>
            <Button 
              onClick={() => handleTestLogin('merchant')}
              disabled={loading !== null}
              className="w-full"
            >
              {loading === 'merchant' ? 'Signing in...' : 'Sign in as Merchant'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}