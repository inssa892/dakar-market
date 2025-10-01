"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageCircle,
  Settings,
  Heart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Produits", href: "/dashboard/products", icon: Package },
  { name: "Favoris", href: "/dashboard/favorites", icon: Heart },
  { name: "Panier", href: "/dashboard/cart", icon: ShoppingCart },
  { name: "Commandes", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

const merchantNavigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mes Produits", href: "/dashboard/products", icon: Package },
  { name: "Ajouter Produit", href: "/dashboard/products/add", icon: Plus },
  { name: "Commandes", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
  { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState({
    products: 0,
    cart: 0,
    favorites: 0,
    orders: 0,
    messages: 0,
  });

  const navItems =
    profile?.role === "merchant" ? merchantNavigation : navigation;

  const loadProductsCount = React.useCallback(async () => {
    if (!user || profile?.role !== "merchant") return;
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setCounts((prev) => ({ ...prev, products: count || 0 }));
  }, [user, profile]);

  const loadCartCount = React.useCallback(async () => {
    if (!user || profile?.role !== "client") return;
    const { count } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.id);
    setCounts((prev) => ({ ...prev, cart: count || 0 }));
  }, [user, profile]);

  const loadFavoritesCount = React.useCallback(async () => {
    if (!user || profile?.role !== "client") return;
    const { count } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.id);
    setCounts((prev) => ({ ...prev, favorites: count || 0 }));
  }, [user, profile]);

  const loadOrdersCount = React.useCallback(async () => {
    if (!user || !profile) return;
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq(profile.role === "merchant" ? "merchant_id" : "client_id", user.id);
    setCounts((prev) => ({ ...prev, orders: count || 0 }));
  }, [user, profile]);

  const loadMessagesCount = React.useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("to_user", user.id)
      .eq("read", false);
    setCounts((prev) => ({ ...prev, messages: count || 0 }));
  }, [user]);

  const loadCounts = React.useCallback(async () => {
    if (!user || !profile) return;
    await Promise.all([
      profile.role === "merchant"
        ? loadProductsCount()
        : Promise.all([loadCartCount(), loadFavoritesCount()]),
      loadOrdersCount(),
      loadMessagesCount(),
    ]);
  }, [
    user,
    profile,
    loadProductsCount,
    loadCartCount,
    loadFavoritesCount,
    loadOrdersCount,
    loadMessagesCount,
  ]);

  useEffect(() => {
    if (user && profile) {
      loadCounts();
      // Real-time subscriptions for counts
      const subscriptions: any[] = [];

      if (profile.role === "merchant") {
        // Products count for merchants
        const productsChannel = supabase
          .channel(`products-count:${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "products",
              filter: `user_id=eq.${user.id}`,
            },
            () => loadProductsCount()
          )
          .subscribe();
        subscriptions.push(productsChannel);
      } else {
        // Cart and favorites for clients
        const cartChannel = supabase
          .channel(`cart-count:${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cart_items",
              filter: `client_id=eq.${user.id}`,
            },
            () => loadCartCount()
          )
          .subscribe();
        subscriptions.push(cartChannel);

        const favoritesChannel = supabase
          .channel(`favorites-count:${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "favorites",
              filter: `client_id=eq.${user.id}`,
            },
            () => loadFavoritesCount()
          )
          .subscribe();
        subscriptions.push(favoritesChannel);
      }

      // Orders and messages for both
      const ordersChannel = supabase
        .channel(`orders-count:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter:
              profile.role === "merchant"
                ? `merchant_id=eq.${user.id}`
                : `client_id=eq.${user.id}`,
          },
          () => loadOrdersCount()
        )
        .subscribe();
      subscriptions.push(ordersChannel);

      const messagesChannel = supabase
        .channel(`messages-count:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `to_user=eq.${user.id}`,
          },
          () => loadMessagesCount()
        )
        .subscribe();
      subscriptions.push(messagesChannel);

      return () => {
        subscriptions.forEach((sub) => supabase.removeChannel(sub));
      };
    }
  }, [
    user,
    profile,
    loadCounts,
    loadProductsCount,
    loadCartCount,
    loadFavoritesCount,
    loadOrdersCount,
    loadMessagesCount,
  ]);

  const getItemCount = (href: string) => {
    if (href.includes("/products")) {
      return profile?.role === "merchant" ? counts.products : 0;
    }
    if (href.includes("/cart")) return counts.cart;
    if (href.includes("/favorites")) return counts.favorites;
    if (href.includes("/orders")) return counts.orders;
    if (href.includes("/messages")) return counts.messages;
    return 0;
  };

  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-card border-r">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const count = getItemCount(item.href);

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {count > 99 ? "99+" : count}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
