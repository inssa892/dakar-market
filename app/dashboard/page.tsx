"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useMessages } from "@/hooks/useMessages";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { orderCounts } = useOrders();
  const { threads } = useMessages();

  const [stats, setStats] = useState({
    totalProducts: 0,
    cartItems: 0,
    favorites: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // --- Charger les stats en fonction du rôle ---
  const loadAdditionalStats = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      if (profile.role === "merchant") {
        const { count: productsCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id);

        const { data: revenueData } = await supabase
          .from("orders")
          .select("total")
          .eq("merchant_id", profile.id)
          .eq("status", "delivered");

        const revenue =
          revenueData?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

        setStats((prev) => ({
          ...prev,
          totalProducts: productsCount || 0,
          revenue,
        }));
      } else {
        const { count: cartCount } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("client_id", profile.id);

        const { count: favoritesCount } = await supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("client_id", profile.id);

        setStats((prev) => ({
          ...prev,
          cartItems: cartCount || 0,
          favorites: favoritesCount || 0,
        }));
      }
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // --- Charger au montage et updates temps réel ---
  useEffect(() => {
    loadAdditionalStats();
  }, [profile, loadAdditionalStats]);
  useRealtimeOrders({ onOrderUpdate: loadAdditionalStats });
  useRealtimeMessages({ onMessageUpdate: loadAdditionalStats });

  const unreadMessages = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  const getWelcomeMessage = () => {
    const name =
      profile?.display_name || profile?.email?.split("@")[0] || "Utilisateur";
    const role = profile?.role === "merchant" ? "Marchand" : "Client";
    return `Bienvenue ${name} ! Voici votre tableau de bord ${role.toLowerCase()}.`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto mb-2" />
          <Skeleton className="h-6 w-32 mx-auto" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  // --- StatCard générique ---
  const StatCard = ({ title, value, icon, link, linkText }: any) => (
    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2">
          {value}
          {title === "Messages" && unreadMessages > 0 && (
            <Badge variant="destructive">{unreadMessages}</Badge>
          )}
        </div>
        {link && (
          <Link href={link} className="text-xs text-blue-600 hover:underline">
            {linkText}
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          {profile?.role === "merchant"
            ? "Tableau de bord Marchand"
            : "Tableau de bord Client"}
        </h1>
        <p className="text-muted-foreground text-lg">{getWelcomeMessage()}</p>
        <Badge variant="outline" className="mt-2">
          {profile?.role === "merchant" ? "Compte Marchand" : "Compte Client"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {profile?.role === "merchant" ? (
          <>
            <StatCard
              title="Total Produits"
              value={stats.totalProducts}
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Total Commandes"
              value={orderCounts.all}
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Revenus"
              value={`${stats.revenue.toLocaleString("fr-FR")} CFA`}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Messages"
              value={unreadMessages}
              icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
              link={ROUTES.messages}
              linkText="Voir les messages"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Articles Panier"
              value={stats.cartItems}
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
              link={ROUTES.cart}
              linkText="Voir le panier"
            />
            <StatCard
              title="Favoris"
              value={stats.favorites}
              icon={<Heart className="h-4 w-4 text-muted-foreground" />}
              link={ROUTES.favorites}
              linkText="Voir les favoris"
            />
            <StatCard
              title="Commandes"
              value={orderCounts.all}
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
              link={ROUTES.orders}
              linkText="Suivre les commandes"
            />
            <StatCard
              title="Messages"
              value={unreadMessages}
              icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
              link={ROUTES.messages}
              linkText="Voir les messages"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile?.role === "merchant" ? (
              <>
                <Link
                  href={ROUTES.products}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-semibold mb-2">Gérer les produits</h3>
                  <p className="text-sm text-muted-foreground">
                    Voir, modifier ou supprimer vos produits
                  </p>
                </Link>
                <Link
                  href={ROUTES.addProduct}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-semibold mb-2">Ajouter un produit</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez un nouveau produit à vendre
                  </p>
                </Link>
                <Link
                  href={ROUTES.orders}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-semibold mb-2">Gérer les commandes</h3>
                  <p className="text-sm text-muted-foreground">
                    Mettez à jour le statut et suivez les livraisons
                  </p>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.products}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-semibold mb-2">Parcourir les produits</h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrez de nouveaux produits à acheter
                  </p>
                </Link>
                <Link
                  href={ROUTES.cart}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-semibold mb-2">Vérifier le panier</h3>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez les articles prêts à acheter
                  </p>
                </Link>
                <Link
                  href={ROUTES.orders}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors block"
                >
                  <h3 className="font-semibold mb-2">Suivre les commandes</h3>
                  <p className="text-sm text-muted-foreground">
                    Surveillez le statut de vos commandes
                  </p>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
