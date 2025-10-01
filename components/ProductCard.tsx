"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  MoveVertical as MoreVertical,
  CreditCard as Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Product, supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onDelete?: () => void;
  onEdit?: () => void;
  onMessage?: (merchantId: string) => void;
}

export default function ProductCard({
  product,
  onDelete,
  onEdit,
  onMessage,
}: ProductCardProps) {
  const { user, profile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [merchantProfile, setMerchantProfile] = useState<any>(null);

  const isOwner = profile?.id === product.user_id;
  const isClient = profile?.role === "client";
  const isMerchant = profile?.role === "merchant";

  // --- Transformation des images en array réel ---
  const getProductImages = useCallback(() => {
    let images: string[] = [];

    try {
      // Si product.images existe et est un array réel
      if (product.images && Array.isArray(product.images)) {
        images.push(...product.images.filter((img) => typeof img === "string"));
      } else if (typeof product.images === "string") {
        // Si product.images est JSON string
        images.push(...JSON.parse(product.images));
      }

      // Si product.image_url est présent
      if (product.image_url) {
        if (Array.isArray(product.image_url)) {
          images.push(...product.image_url.filter((img) => typeof img === "string"));
        } else if (typeof product.image_url === "string") {
          try {
            // gérer JSON string
            const parsed = JSON.parse(product.image_url);
            if (Array.isArray(parsed)) images.push(...parsed);
            else images.push(parsed);
          } catch {
            images.push(product.image_url);
          }
        }
      }
    } catch (err) {
      console.error("Erreur parsing images:", err);
    }

    // Supprimer doublons et garder seulement les URLs valides
    return Array.from(new Set(images)).filter(
      (img) => typeof img === "string" && img.startsWith("http")
    );
  }, [product.images, product.image_url]);

  const productImages = getProductImages();
  const hasMultipleImages = productImages.length > 1;

  // --- Charger profil du marchand ---
  const loadMerchantProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("whatsapp_number, phone, display_name, email, id")
        .eq("id", product.user_id)
        .single();
      if (!error && data) setMerchantProfile(data);
    } catch (err) {
      console.error("Erreur chargement marchand:", err);
    }
  }, [product.user_id]);

  // --- Vérifier favoris ---
  const checkIfFavorite = useCallback(async () => {
    if (!user || !isClient) return;
    try {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("client_id", user.id)
        .eq("product_id", product.id)
        .single();
      setIsFavorite(!!data);
    } catch {
      setIsFavorite(false);
    }
  }, [user, isClient, product.id]);

  useEffect(() => {
    if (user && isClient) checkIfFavorite();
    if (product.user_id) loadMerchantProfile();
  }, [user, isClient, product.id, product.user_id, checkIfFavorite, loadMerchantProfile]);

  // --- Favoris ---
  const toggleFavorite = async () => {
    if (!user || !isClient) return;
    setIsLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from("favorites")
          .delete()
          .eq("client_id", user.id)
          .eq("product_id", product.id);
        setIsFavorite(false);
        toast.success("Retiré des favoris");
      } else {
        await supabase
          .from("favorites")
          .insert([{ client_id: user.id, product_id: product.id }]);
        setIsFavorite(true);
        toast.success("Ajouté aux favoris");
      }
    } catch {
      toast.error("Échec de la mise à jour des favoris");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Panier ---
  const addToCart = async () => {
    if (!user || !isClient) return;
    setIsLoading(true);
    try {
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("client_id", user.id)
        .eq("product_id", product.id)
        .single();

      if (existingItem) {
        await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);
      } else {
        await supabase
          .from("cart_items")
          .insert([{ client_id: user.id, product_id: product.id, quantity: 1 }]);
      }
      toast.success("Ajouté au panier");
    } catch {
      toast.error("Échec de l'ajout au panier");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Message WhatsApp ---
  const sendWhatsAppMessage = () => {
    if (!merchantProfile) {
      toast.error("Informations de contact du marchand non disponibles");
      return;
    }

    const phoneNumber = merchantProfile.whatsapp_number || merchantProfile.phone;
    if (!phoneNumber) {
      toast.error("Numéro WhatsApp du marchand non disponible");
      return;
    }

    const message = `Bonjour! Je suis intéressé(e) par ce produit :\n\n📦 ${product.title}\n💰 Prix: ${product.price?.toLocaleString('fr-FR')} CFA\n📝 Description: ${product.description || 'Aucune description'}\n🏷️ Catégorie: ${product.category}`;

    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
    toast.success("Ouverture de WhatsApp...");
  };

  // --- Discussion interne ---
  const handleMessage = () => {
    if (onMessage && merchantProfile) onMessage(merchantProfile.id);
  };

  // --- Supprimer produit ---
  const handleDelete = async () => {
    if (!isOwner) return;
    try {
      await supabase.from("products").delete().eq("id", product.id);
      toast.success("Produit supprimé avec succès");
      onDelete?.();
    } catch {
      toast.error("Échec de la suppression du produit");
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square relative overflow-hidden">
        {productImages.length > 0 ? (
          <>
            <Image
              src={productImages[currentImageIndex]}
              alt={product.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {hasMultipleImages && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {productImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Pas d&apos;image</span>
          </div>
        )}

        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isClient && (
            <Button size="icon" variant="secondary" onClick={toggleFavorite} disabled={isLoading}>
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          )}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{product.title}</h3>
        {product.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary">{product.price?.toLocaleString("fr-FR")} CFA</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{product.category}</span>
        </div>

        {isClient && (
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button onClick={addToCart} disabled={isLoading} size="sm" className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" /> Panier
              </Button>
              <Button onClick={sendWhatsAppMessage} variant="outline" size="sm" className="flex-1">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
            </div>
            <Button onClick={handleMessage} variant="secondary" size="sm" className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" /> Discuter
            </Button>
          </div>
        )}

        {isMerchant && !isOwner && (
          <div className="text-center text-sm text-muted-foreground">Produit d&apos;un autre marchand</div>
        )}
      </CardContent>
    </Card>
  );
}
