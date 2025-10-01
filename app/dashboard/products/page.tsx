"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import MessageThread from "@/components/MessageThread";
import { supabase, Product } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Plus,
  Filter,
  Loader as Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "all"
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || "created_at"
  );
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);

  // --- Fonction pour charger les produits ---
  const loadProducts = useCallback(async () => {
    if (!profile) return;

    try {
      setRefreshing(true);
      let query = supabase.from("products").select("*");

      if (profile.role === "merchant") query = query.eq("user_id", user?.id);

      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim().toLowerCase();
        const { data: allProducts, error } = await query;
        if (error) throw error;

        const filteredProducts = (allProducts || []).filter((p: Product) => {
          const title = p.title.toLowerCase();
          for (let i = 0; i < searchTerm.length; i++) {
            if (!title[i] || title[i] !== searchTerm[i]) return false;
          }
          return true;
        });

        const finalProducts =
          categoryFilter !== "all"
            ? filteredProducts.filter((p) => p.category === categoryFilter)
            : filteredProducts;

        finalProducts.sort((a, b) => {
          if (sortBy === "price") return (a.price || 0) - (b.price || 0);
          if (sortBy === "title") return a.title.localeCompare(b.title);
          if (sortBy === "created_at")
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          return 0;
        });

        setProducts(finalProducts);
      } else {
        if (categoryFilter !== "all")
          query = query.eq("category", categoryFilter);
        const ascending = sortBy === "price" || sortBy === "title";
        query = query.order(sortBy, { ascending });
        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error("Error loading products:", error);
      toast.error("Échec du chargement des produits");
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, profile, searchQuery, categoryFilter, sortBy]);

  // --- Synchronisation URL ---
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (sortBy !== "created_at") params.set("sort", sortBy);
    const newURL = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/dashboard/products${newURL}`, { scroll: false });
  }, [searchQuery, categoryFilter, sortBy, router]);

  useEffect(() => {
    if (profile) {
      loadProducts();
      updateURL();
    }
  }, [loadProducts, updateURL, profile]);

  // --- Real-time subscription corrigée ---
  useEffect(() => {
    if (!user) return;

    const subscribe = async () => {
      const channel = supabase
        .channel("products-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "products" },
          () => {
            loadProducts();
          }
        )
        .subscribe();

      return channel;
    };

    let channelRef: any;
    subscribe().then((channel) => {
      channelRef = channel;
    });

    return () => {
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, [user, loadProducts]);

  const handleProductDeleted = useCallback(
    () => loadProducts(),
    [loadProducts]
  );
  const handleProductEdit = useCallback(
    (productId: string) => router.push(`/dashboard/products/edit/${productId}`),
    [router]
  );
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    []
  );

  // Debounce recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile) {
        loadProducts();
        updateURL();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, loadProducts, updateURL, profile]);

  const handleMessage = useCallback(async (merchantId: string) => {
    try {
      const { data: merchantProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", merchantId)
        .single();
      if (error) throw error;
      setSelectedMerchant(merchantProfile);
    } catch {
      toast.error("Impossible de charger le profil du marchand");
    }
  }, []);

  if (!profile)
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  if (selectedMerchant)
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedMerchant(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            Discussion avec {selectedMerchant.display_name}
          </h1>
        </div>
        <MessageThread
          otherUser={selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
        />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {profile.role === "merchant" ? "Mes Produits" : "Produits"}
          </h1>
          <p className="text-muted-foreground">
            {profile.role === "merchant"
              ? "Gérez votre catalogue de produits"
              : "Découvrez des produits incroyables"}
          </p>
        </div>
        {profile.role === "merchant" && (
          <Button
            onClick={() => router.push("/dashboard/products/add")}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" /> Filtres{" "}
            {refreshing && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="electronics">Électronique</SelectItem>
                <SelectItem value="clothing">Vêtements</SelectItem>
                <SelectItem value="books">Livres</SelectItem>
                <SelectItem value="home">Maison & Jardin</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="general">Général</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Plus récents</SelectItem>
                <SelectItem value="price">Prix: Croissant</SelectItem>
                <SelectItem value="title">Nom A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des produits...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            {searchQuery || categoryFilter !== "all"
              ? "Aucun produit trouvé correspondant à vos critères."
              : profile.role === "merchant"
              ? "Aucun produit trouvé. Commencez par ajouter votre premier produit !"
              : "Aucun produit disponible pour le moment."}
          </p>
          {profile.role === "merchant" &&
            !searchQuery &&
            categoryFilter === "all" && (
              <Button onClick={() => router.push("/dashboard/products/add")}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter votre premier produit
              </Button>
            )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleProductDeleted}
              onEdit={() => handleProductEdit(product.id)}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center pt-6">
        <Badge variant="outline">
          {products.length} produit{products.length !== 1 ? "s" : ""} trouvé
          {products.length !== 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  );
}
