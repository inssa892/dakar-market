'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Upload, Loader as Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface AvatarUploaderProps {
  avatarUrl?: string
  onUpload: (url: string) => void
}

export default function AvatarUploader({ avatarUrl, onUpload }: AvatarUploaderProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image à télécharger.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onUpload(data.publicUrl)
      toast.success('Avatar téléchargé avec succès!')
    } catch (error: any) {
      toast.error('Erreur lors du téléchargement de l\'avatar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        <Button
          size="sm"
          variant="secondary"
          className="absolute -bottom-2 -right-2 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadAvatar}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />

      <p className="text-sm text-muted-foreground text-center">
        {uploading ? 'Téléchargement...' : 'Cliquez sur le bouton pour changer votre avatar'}
      </p>
    </div>
  )
}