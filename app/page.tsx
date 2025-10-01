"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Product, supabase } from "@/lib/supabase";
import { ROUTES } from "@/lib/routes";
import ProductCard from "@/components/ProductCard";
import MessageThread from "@/components/MessageThread";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Loader as Loader2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function HomePage() {
  const whatsappNumber = "221755227006";
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("products").select("*");

      if (search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      if (category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  // Sync recherche avec l’URL
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams, search]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("category")
          .not("category", "is", null);
        if (!error && data) {
          const uniqueCategories = Array.from(
            new Set(data.map((p) => p.category))
          );
          setCategories(["all", ...uniqueCategories]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Realtime products
  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    // cleanup SANS async
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  // Gérer les messages avec un marchand
  const handleMessage = useCallback(async (merchantId: string) => {
    try {
      const { data: merchantProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", merchantId)
        .single();
      if (error) throw error;
      setSelectedMerchant(merchantProfile);
    } catch (err) {
      console.error("Error loading merchant profile:", err);
    }
  }, []);

  // === MODE MESSAGERIE AVEC MARCHAND ===
  if (selectedMerchant) {
    return (
      <main className="min-h-screen font-sans bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedMerchant(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">DakarMarket</span>
              </Link>
            </div>
            {user && (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            )}
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <MessageThread
            otherUser={selectedMerchant}
            onClose={() => setSelectedMerchant(null)}
          />
        </div>
      </main>
    );
  }

  // === MODE CATALOGUE ===
  return (
    <main className="min-h-screen font-sans bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DakarMarket</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-primary">
              Accueil
            </Link>
            <Link
              href="/dashboard/products"
              className="text-sm font-medium hover:text-primary"
            >
              Produits
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary"
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:text-primary"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button>S&apos;inscrire</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative py-20 text-center px-6"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1664575602276-acd073f104c1?fm=jpg&q=60&w=3000')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-blue-400/30 dark:bg-blue-900/30"></div>
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
            Votre marché local à Dakar
          </h1>
          <p className="text-lg sm:text-xl text-white mb-8 max-w-2xl mx-auto">
            Découvrez les meilleurs produits artisanaux et locaux directement
            depuis votre quartier.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#catalogue"
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
            >
              Voir les produits
            </a>
            <Link
              href={`https://wa.me/${whatsappNumber}?text=Bonjour%20Monsieur`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Contacter sur WhatsApp
            </Link>
          </div>
        </div>
      </section>

      {/* RECHERCHE + FILTRES */}
      <section id="catalogue" className="py-16 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              const params = new URLSearchParams(searchParams.toString());
              e.target.value
                ? params.set("search", e.target.value)
                : params.delete("search");
              router.replace(`/?${params.toString()}`, { scroll: false });
            }}
            className="flex-1"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "Toutes les catégories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {profile?.role === "merchant" && (
            <Link href={ROUTES.addProduct}>
              <Button className="w-full md:w-auto">+ Ajouter un produit</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">
              Chargement des produits...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">
              {search || category !== "all"
                ? "Aucun produit trouvé correspondant à vos critères."
                : "Aucun produit disponible pour le moment."}
            </p>
            {profile?.role === "merchant" && !search && category === "all" && (
              <Link href={ROUTES.addProduct}>
                <Button>Commencez par ajouter votre premier produit !</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={fetchProducts}
                onMessage={handleMessage}
              />
            ))}
          </div>
        )}
      </section>

      {/* QUICK LINKS */}
      <section className="py-16 container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href={ROUTES.cart}
          className="p-4 border rounded-lg hover:shadow-md transition"
        >
          <h3 className="font-semibold text-lg">Panier</h3>
          <p className="text-sm text-muted-foreground">
            Voir les articles ajoutés
          </p>
        </Link>
        <Link
          href="/faq"
          className="p-4 border rounded-lg hover:shadow-md transition"
        >
          <h3 className="font-semibold text-lg">FAQ</h3>
          <p className="text-sm text-muted-foreground">Questions fréquentes</p>
        </Link>
        <Link
          href="/contact"
          className="p-4 border rounded-lg hover:shadow-md transition"
        >
          <h3 className="font-semibold text-lg">Contact</h3>
          <p className="text-sm text-muted-foreground">
            Nous envoyer un message
          </p>
        </Link>
        <Link
          href="/about"
          className="p-4 border rounded-lg hover:shadow-md transition"
        >
          <h3 className="font-semibold text-lg">À propos</h3>
          <p className="text-sm text-muted-foreground">
            En savoir plus sur DakarMarket
          </p>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">DakarMarket</h3>
            <p className="text-gray-400">
              Votre plateforme d&apos;e-commerce local à Dakar.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400">Email: diedhiouinssa16@gmail.com</p>
            <p className="text-gray-400">Tel: +221 77 104 76 29</p>
            <div className="flex space-x-3 mt-2">
              <Link href="#" className="text-gray-400 hover:text-white">
                Facebook
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                Twitter
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                Instagram
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8 text-sm">
          &copy; {new Date().getFullYear()} DakarMarket. Tous droits réservés.
        </div>
      </footer>
    </main>
  );
}
