import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact - DakarMarket",
  description:
  "Contactez l&apos;équipe DakarMarket pour toute question ou assistance.",
};

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "diedhiouinssa16@gmail.com",
      link: "mailto:diedhiouinssa16@gmail.com",
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: "+221 77 104 76 29",
      link: "tel:+221771047629",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      content: "+221 75 522 70 06",
      link: "https://wa.me/221755227006",
    },
    {
      icon: MapPin,
      title: "Adresse",
      content: "Dakar, Sénégal",
      link: null,
    },
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
            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary"
            >
              À propos
            </Link>
            <Link href="/contact" className="text-sm font-medium text-primary">
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
            Contactez-nous
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Notre &eacute;quipe est l&agrave; pour vous aider. N&apos;h&eacute;sitez pas &agrave; nous contacter
            pour toute question ou assistance.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Envoyez-nous un message</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-6"
                action="https://formspree.io/f/mgvnoqkj" // Remplace TON_ID_FORM par ton ID Formspree
                method="POST"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+221 77 123 45 67"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Sujet de votre message"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Décrivez votre demande en détail..."
                    rows={6}
                    required
                  />
                </div>

                {/* Page de succès après soumission */}
                <input type="hidden" name="_next" value="/contact-success" />
                <input
                  type="hidden"
                  name="_subject"
                  value="Nouveau message depuis DakarMarket"
                />

                <Button type="submit" className="w-full">
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  const content = info.link ? (
                    <a
                      href={info.link}
                      className="text-primary hover:underline"
                      target={
                        info.link.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        info.link.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {info.content}
                    </a>
                  ) : (
                    <span>{info.content}</span>
                  );

                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{info.title}</h3>
                        <div className="text-muted-foreground">{content}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heures d&apos;ouverture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="text-muted-foreground">8h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="text-muted-foreground">9h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="text-muted-foreground">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Pour une assistance immédiate, contactez-nous via WhatsApp.
                </p>
                <a
                  href="https://wa.me/221755227006?text=Bonjour%2C%20j%27ai%20besoin%20d%27aide"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ouvrir WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">
                  Comment devenir marchand ?
                </h3>
                <p className="text-muted-foreground">
                  Inscrivez-vous en choisissant le type de compte &quot;Marchand&quot;
                  lors de votre inscription. Vous pourrez ensuite ajouter vos
                  produits et commencer à vendre.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">
                  Comment passer une commande ?
                </h3>
                <p className="text-muted-foreground">
                  Parcourez nos produits, ajoutez-les à votre panier, puis
                  procédez au checkout pour finaliser votre commande.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">
                  Quels sont les modes de paiement ?
                </h3>
                <p className="text-muted-foreground">
                  Nous acceptons les paiements par mobile money, carte bancaire
                  et paiement à la livraison selon les marchands.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">
                  Comment suivre ma commande ?
                </h3>
                <p className="text-muted-foreground">
                  Connectez-vous à votre compte et accédez à la section &quot;Mes
                  commandes&quot; pour suivre l&apos;état de vos commandes en temps réel.
                </p>
              </CardContent>
            </Card>
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
