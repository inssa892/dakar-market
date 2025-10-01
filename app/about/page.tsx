import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Users, Heart, Shield, Truck, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos - DakarMarket",
  description:
  "Découvrez l&apos;histoire et la mission de DakarMarket, votre plateforme d&apos;e-commerce local à Dakar.",
};

export default function AboutPage() {
  const features = [
    {
      icon: ShoppingBag,
      title: "Produits Locaux",
      description:
        "Découvrez une large gamme de produits artisanaux et locaux de qualité.",
    },
    {
      icon: Users,
      title: "Communauté",
      description:
        "Connectez-vous directement avec les marchands de votre quartier.",
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description:
        "Transactions sécurisées et protection des données garantie.",
    },
    {
      icon: Truck,
      title: "Livraison Rapide",
      description:
        "Livraison rapide dans toute la région de Dakar !A venir bientôt.",
    },
  ];

  const stats = [
    { number: "500+", label: "Produits" },
    { number: "100+", label: "Marchands" },
    { number: "1000+", label: "Clients satisfaits" },
    { number: "50+", label: "Quartiers desservis" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DakarMarket</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Accueil
            </Link>
            <Link
              href="/dashboard/products"
              className="text-sm font-medium hover:text-primary"
            >
              Produits
            </Link>
            <Link href="/about" className="text-sm font-medium text-primary">
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
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            À propos de DakarMarket
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            DakarMarket est né de la volonté de connecter les marchands locaux
            avec les consommateurs de Dakar, créant un écosystème commercial
            digital qui valorise l&apos;artisanat et les produits locaux.
          </p>
          <Badge variant="secondary" className="text-lg px-6 py-2">
            Depuis 2024
          </Badge>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
              <p className="text-muted-foreground mb-4">
                Nous croyons en la richesse du patrimoine artisanal sénégalais
                et en la nécessité de le rendre accessible à tous. Notre
                plateforme permet aux marchands locaux de développer leur
                activité en ligne tout en offrant aux consommateurs un accès
                privilégié aux produits authentiques de leur région.
              </p>
              <p className="text-muted-foreground mb-6">
                DakarMarket n&apos;est pas seulement une marketplace, c&apos;est une
                  communaut&eacute; qui valorise le commerce local, soutient l&apos;&eacute;conomie
                  de proximit&eacute; et pr&eacute;serve les traditions artisanales du S&eacute;n&eacute;gal.
              </p>
              <Link href="/register">
                <Button size="lg">Rejoindre la communauté</Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir DakarMarket ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos Valeurs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident notre action quotidienne
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Authenticité</h3>
                <p className="text-muted-foreground">
                  Nous valorisons les produits authentiques et les savoir-faire
                  traditionnels du Sénégal, en garantissant la qualité et
                  l&apos;origine de chaque article.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Communauté</h3>
                <p className="text-muted-foreground">
                  Nous créons des liens durables entre marchands et clients,
                  favorisant les échanges et le développement de l&apos;économie
                  locale.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Star className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  Nous nous engageons à offrir une expérience utilisateur
                  exceptionnelle et un service client de qualité supérieure.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-muted rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à découvrir DakarMarket ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté de marchands et de clients passionnés par
            les produits locaux et l&apos;artisanat sénégalais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/products">
              <Button size="lg">Découvrir les produits</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Devenir marchand
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DakarMarket</span>
          </div>
          <p className="text-muted-foreground">
            © 2025 DakarMarket. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
