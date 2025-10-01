'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OrderList from '@/components/OrderList'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { Package, ShoppingBag } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersPage() {
  const { profile } = useAuth()
  const { orderCounts, loading, refreshCounts } = useOrders()
  
  // Temps réel pour les mises à jour de commandes
  useRealtimeOrders({
    onOrderUpdate: refreshCounts
  })

  const getPageTitle = () => {
    return profile?.role === 'merchant' 
      ? 'Gestion des commandes' 
      : 'Mes commandes'
  }

  const getPageDescription = () => {
    return profile?.role === 'merchant'
      ? 'Gérez et suivez toutes les commandes clients'
      : 'Suivez l\'historique et le statut de vos commandes'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {profile?.role === 'merchant' ? (
          <Package className="h-8 w-8 text-primary" />
        ) : (
          <ShoppingBag className="h-8 w-8 text-primary" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCounts.all}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderCounts.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orderCounts.confirmed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expédiées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{orderCounts.shipped}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Livrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderCounts.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                Toutes ({orderCounts.all})
              </TabsTrigger>
              <TabsTrigger value="pending">
                En attente ({orderCounts.pending})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmées ({orderCounts.confirmed})
              </TabsTrigger>
              <TabsTrigger value="shipped">
                Expédiées ({orderCounts.shipped})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Livrées ({orderCounts.delivered})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <OrderList />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-6">
              <OrderList statusFilter="pending" />
            </TabsContent>
            
            <TabsContent value="confirmed" className="mt-6">
              <OrderList statusFilter="confirmed" />
            </TabsContent>
            
            <TabsContent value="shipped" className="mt-6">
              <OrderList statusFilter="shipped" />
            </TabsContent>
            
            <TabsContent value="delivered" className="mt-6">
              <OrderList statusFilter="delivered" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}