"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import AvatarUploader from "@/components/AvatarUploader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Settings,
  User,
  Palette,
  Shield,
  Loader as Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    display_name: "",
    phone: "",
    whatsapp_number: "",
    avatar_url: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);
    if (profile) {
      setProfileData({
        display_name: profile.display_name || "",
        phone: profile.phone || "",
        whatsapp_number: profile.whatsapp_number || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  // --- Update Profile ---
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profileData.display_name,
          phone: profileData.phone,
          whatsapp_number: profileData.whatsapp_number,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil mis à jour avec succès!");
      if (refreshProfile) refreshProfile();
    } catch (error: any) {
      toast.error("Échec de la mise à jour du profil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Update Password ---
  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordData({ newPassword: "", confirmPassword: "" });
      toast.success("Mot de passe mis à jour avec succès!");
    } catch (error: any) {
      toast.error("Échec de la mise à jour du mot de passe: " + error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- Handle Avatar Upload ---
  const handleAvatarUpload = (url: string) => {
    setProfileData((prev) => ({ ...prev, avatar_url: url }));
  };

  if (!mounted)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez votre compte et vos préférences
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informations du profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <AvatarUploader
                avatarUrl={profileData.avatar_url}
                onUpload={handleAvatarUpload}
              />
            </div>

            <Separator />

            {/* Profile Form */}
            <form onSubmit={updateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Type de compte</Label>
                <Badge
                  variant={
                    profile?.role === "merchant" ? "default" : "secondary"
                  }
                >
                  {profile?.role === "merchant" ? "Marchand" : "Client"}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Nom d&apos;affichage</Label>
                <Input
                  value={profileData.display_name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      display_name: e.target.value,
                    }))
                  }
                  placeholder="Votre nom d&apos;affichage"
                />
              </div>

              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <Input
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <div className="space-y-2">
                <Label>Numéro WhatsApp</Label>
                <Input
                  value={profileData.whatsapp_number}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      whatsapp_number: e.target.value,
                    }))
                  }
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour le profil"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security & Preferences */}
        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label>{theme === "dark" ? "Mode sombre" : "Mode clair"}</Label>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={updatePassword} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
                <Input
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
                <Button type="submit" disabled={passwordLoading} className="w-full">
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Mettre à jour le mot de passe"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Compte créé</span>
                <span>
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('fr-FR')
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dernière mise à jour</span>
                <span>
                  {profile?.updated_at
                    ? new Date(profile.updated_at).toLocaleDateString('fr-FR')
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}