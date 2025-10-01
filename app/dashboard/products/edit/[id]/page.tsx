
'use client'
import React from 'react';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { ArrowLeft, Upload, Loader as Loader2, X } from 'lucide-react'
import Image from 'next/image'

interface EditProductPageProps {
  params: { id: string }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [productLoading, setProductLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'general',
    images: [] as string[]
  })

  // Déclare la fonction avec useCallback pour la stabilité
  const loadProduct = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user?.id) // Ensure user owns the product
        .single();

      if (error) throw error;

      // Handle both images array and image_url
      const productImages: string[] = [];
      if (data.images && Array.isArray(data.images)) {
        productImages.push(...data.images.filter((img: string) => img && img.trim() !== ''));
      }
      if (data.image_url) {
        if (Array.isArray(data.image_url)) {
          productImages.push(...data.image_url.filter((img: string) => img && img.trim() !== ''));
        } else if (typeof data.image_url === 'string' && data.image_url.trim() !== '') {
          productImages.push(data.image_url);
        }
      }
      setFormData({
        title: data.title,
        description: data.description || '',
        price: data.price.toString(),
        category: data.category,
        images: Array.from(new Set(productImages)) // Remove duplicates
      });
    } catch (error: any) {
      toast.error('Échec du chargement du produit');
      router.push('/dashboard/products');
    } finally {
      setProductLoading(false);
    }
  }, [user, params.id, router]);

  // Redirect if not merchant
  useEffect(() => {
    if (profile?.role !== 'merchant') {
      router.push('/dashboard');
      return;
    }
    loadProduct();
  }, [params.id, profile, router, loadProduct]);

  const uploadImage = async (file: File) => {
    setImageUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, data.publicUrl] 
      }))
  toast.success('Image t&eacute;l&eacute;charg&eacute;e avec succ&egrave;s&nbsp;!')
    } catch (error: any) {
  toast.error('&Eacute;chec du t&eacute;l&eacute;chargement de l&apos;image&nbsp;: ' + error.message)
    } finally {
      setImageUploading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        uploadImage(file)
      })
    }
  }

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      const [movedImage] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedImage)
      return { ...prev, images: newImages }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.title.trim()) {
  toast.error('Le titre du produit est requis')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
  toast.error('Un prix valide est requis')
      return
    }

    setLoading(true)
    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category: formData.category,
        images: formData.images.length > 0 ? formData.images : null,
        image_url: formData.images.length > 0 ? formData.images : null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (error) throw error

  toast.success('Produit mis &agrave; jour avec succ&egrave;s&nbsp;!')
      router.push('/dashboard/products')
    } catch (error: any) {
  toast.error('&Eacute;chec de la mise &agrave; jour du produit&nbsp;: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (productLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement du produit...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier le produit</h1>
          <p className="text-muted-foreground">Mettez à jour les détails de votre produit</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Détails du produit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Images du produit</Label>
              
              {/* Image Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`Image produit ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Principal
                        </div>
                      )}
                      {/* Move buttons */}
                      {index > 0 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => moveImage(index, index - 1)}
                        >
                          ←
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center justify-center w-full">
                <label htmlFor="images-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF jusqu&apos;à 10MB</p>
                  </div>
                  <input
                    id="images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </label>
              </div>
              
              {imageUploading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Téléchargement des images...</span>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre du produit *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Entrez le titre du produit"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre produit..."
                rows={4}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Prix (CFA) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="electronics">Électronique</SelectItem>
                  <SelectItem value="clothing">Vêtements</SelectItem>
                  <SelectItem value="books">Livres</SelectItem>
                  <SelectItem value="home">Maison & Jardin</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                disabled={loading || imageUploading || !formData.title || !formData.price}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour le produit'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}