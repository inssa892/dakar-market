import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from '@/hooks/useOrders'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { format } from "date-fns";
import { fr } from 'date-fns/locale'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import MessageThread from './MessageThread'

interface OrderListProps {
  statusFilter?:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";
}

export default function OrderList({ statusFilter }: OrderListProps) {
  const { profile } = useAuth()
  const { orders, loading, updateOrderStatus, refreshOrders } = useOrders(statusFilter)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Temps réel
  useRealtimeOrders({
    onOrderUpdate: refreshOrders
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente"
      case "confirmed": return "Confirmée"
      case "shipped": return "Expédiée"
      case "delivered": return "Livrée"
      case "cancelled": return "Annulée"
      default: return status
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Chargement des commandes...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune commande trouvée</p>
      </div>
    )
  }

  if (selectedUser) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedUser(null)}
        >
          ← Retour aux commandes
        </Button>
        <MessageThread 
          otherUser={selectedUser} 
          onClose={() => setSelectedUser(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Commande #{order.id.slice(0, 8)}
              </CardTitle>
              <Badge className={`${getStatusColor(order.status)} text-white`}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.created_at), "PPP", { locale: fr })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Détails du produit</h4>
                <p className="text-sm">{order.product.title}</p>
                <p className="text-sm text-muted-foreground">
                  Quantité: {order.quantity} × {order.product.price.toLocaleString('fr-FR')} CFA
                </p>
                <p className="font-semibold">
                  Total: {order.total.toLocaleString('fr-FR')} CFA
                </p>
              </div>

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    {profile?.role === "merchant" ? (
                      <>
                        <h4 className="font-medium mb-2">Client</h4>
                        <p className="text-sm">{order.client.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.client.email}
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-medium mb-2">Marchand</h4>
                        <p className="text-sm">{order.merchant.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.merchant.email}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Bouton de discussion */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(
                      profile?.role === "merchant" ? order.client : order.merchant
                    )}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Discuter
                  </Button>
                </div>
              </div>
            </div>

            {profile?.role === "merchant" &&
              !["delivered", "cancelled"].includes(order.status) && (
                <div className="mt-4">
                  <label className="text-sm font-medium">Mettre à jour le statut</label>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      updateOrderStatus(order.id, value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmée</SelectItem>
                      <SelectItem value="shipped">Expédiée</SelectItem>
                      <SelectItem value="delivered">Livrée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}