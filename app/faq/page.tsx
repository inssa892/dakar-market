import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShoppingBag,
  CircleHelp as HelpCircle,
  MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ - DakarMarket",
  description:
    "Trouvez des r&eacute;ponses aux questions les plus fr&eacute;quentes sur DakarMarket.",
};

export default function FAQPage() {
  const faqCategories = [
    {
      title: "Compte et inscription",
      questions: [
        {
          question: "Comment cr&eacute;er un compte sur DakarMarket&nbsp;?",
          answer:
            'Cliquez sur "S&apos;inscrire" en haut de la page, choisissez votre type de compte (Client ou Marchand), remplissez le formulaire avec vos informations et validez votre inscription.',
        },
        {
          question:
            "Quelle est la diff&eacute;rence entre un compte Client et Marchand&nbsp;?",
          answer:
            "Un compte Client permet d&apos;acheter des produits, de g&eacute;rer son panier et ses commandes. Un compte Marchand permet de vendre des produits, de g&eacute;rer son inventaire et de traiter les commandes re&ccedil;ues.",
        },
        {
          question: "Comment modifier mes informations personnelles&nbsp;?",
          answer:
            'Connectez-vous &agrave; votre compte, allez dans "Param&egrave;tres" puis "Profil" pour modifier vos informations personnelles, votre photo de profil et vos coordonn&eacute;es.',
        },
        {
          question:
            "J&apos;ai oubli&eacute; mon mot de passe, que faire&nbsp;?",
          answer:
            'Sur la page de connexion, cliquez sur "Mot de passe oubli&eacute;", saisissez votre adresse email et suivez les instructions re&ccedil;ues par email pour r&eacute;initialiser votre mot de passe.',
        },
      ],
    },
    {
      title: "Achats et commandes",
      questions: [
        {
          question: "Comment passer une commande&nbsp;?",
          answer:
            'Parcourez les produits, ajoutez ceux qui vous int&eacute;ressent &agrave; votre panier, v&eacute;rifiez votre panier puis cliquez sur "Commander" pour finaliser votre achat.',
        },
        {
          question: "Comment suivre ma commande&nbsp;?",
          answer:
            'Dans votre espace client, section "Mes commandes", vous pouvez voir l&apos;&eacute;tat de toutes vos commandes&nbsp;: en attente, confirm&eacute;e, exp&eacute;di&eacute;e ou livr&eacute;e.',
        },
        {
          question: "Puis-je annuler ma commande&nbsp;?",
          answer:
            "Vous pouvez annuler une commande tant qu&apos;elle n&apos;a pas &eacute;t&eacute; confirm&eacute;e par le marchand. Contactez directement le marchand via la messagerie pour toute demande d&apos;annulation.",
        },
        {
          question: "Quels sont les modes de paiement accept&eacute;s&nbsp;?",
          answer:
            "Les modes de paiement varient selon les marchands&nbsp;: paiement mobile (Orange Money, Wave), paiement &agrave; la livraison, ou virement bancaire.",
        },
      ],
    },
    {
      title: "Vente et marchands",
      questions: [
        {
          question: "Comment devenir marchand sur DakarMarket&nbsp;?",
          answer:
            'Cr&eacute;ez un compte en s&eacute;lectionnant "Marchand" lors de l&apos;inscription. Une fois votre compte valid&eacute;, vous pourrez ajouter vos produits et commencer &agrave; vendre.',
        },
        {
          question: "Comment ajouter un produit&nbsp;?",
          answer:
            'Dans votre dashboard marchand, cliquez sur "Ajouter un produit", remplissez les informations (titre, description, prix, cat&eacute;gorie), ajoutez des photos et publiez votre produit.',
        },
        {
          question: "Comment g&eacute;rer mes commandes re&ccedil;ues&nbsp;?",
          answer:
            'Dans la section "Commandes" de votre dashboard, vous pouvez voir toutes les commandes re&ccedil;ues et mettre &agrave; jour leur statut (confirm&eacute;e, exp&eacute;di&eacute;e, livr&eacute;e).',
        },
        {
          question: "Y a-t-il des frais pour vendre sur DakarMarket&nbsp;?",
          answer:
            "L&apos;inscription et l&apos;ajout de produits sont gratuits. Des frais de transaction peuvent s&apos;appliquer selon le mode de paiement choisi.",
        },
      ],
    },
    {
      title: "Livraison et retours",
      questions: [
        {
          question: "Quels sont les d&eacute;lais de livraison&nbsp;?",
          answer:
            "Les d&eacute;lais de livraison d&eacute;pendent du marchand et de votre localisation. En g&eacute;n&eacute;ral, comptez 1 &agrave; 3 jours ouvr&eacute;s pour Dakar et sa banlieue.",
        },
        {
          question: "Quels sont les frais de livraison&nbsp;?",
          answer:
            "Les frais de livraison sont d&eacute;finis par chaque marchand et affich&eacute;s avant la finalisation de votre commande. Certains marchands offrent la livraison gratuite.",
        },
        {
          question: "Puis-je retourner un produit&nbsp;?",
          answer:
            "Les conditions de retour d&eacute;pendent de chaque marchand. Consultez les conditions de vente du marchand ou contactez-le directement pour conna&icirc;tre sa politique de retour.",
        },
        {
          question: "Que faire si mon produit arrive endommag&eacute;&nbsp;?",
          answer:
            "Contactez imm&eacute;diatement le marchand via la messagerie avec des photos du produit endommag&eacute;. Le marchand vous proposera une solution (&eacute;change, remboursement, etc.).",
        },
      ],
    },
    {
      title: "Technique et s&eacute;curit&eacute;",
      questions: [
        {
          question:
            "Mes donn&eacute;es personnelles sont-elles s&eacute;curis&eacute;es&nbsp;?",
          answer:
            "Oui, nous utilisons des protocoles de s&eacute;curit&eacute; avanc&eacute;s pour prot&eacute;ger vos donn&eacute;es. Vos informations personnelles ne sont jamais partag&eacute;es avec des tiers sans votre consentement.",
        },
        {
          question: "Comment contacter un marchand&nbsp;?",
          answer:
            'Utilisez la messagerie int&eacute;gr&eacute;e &agrave; la plateforme. Sur la page d&apos;un produit ou dans vos commandes, cliquez sur "Contacter le marchand" pour envoyer un message.',
        },
        {
          question: "L&apos;application mobile est-elle disponible&nbsp;?",
          answer:
            "DakarMarket est optimis&eacute; pour mobile et fonctionne parfaitement sur tous les navigateurs mobiles. Une application native est en cours de d&eacute;veloppement.",
        },
        {
          question:
            "Comment signaler un probl&egrave;me ou un contenu inappropri&eacute;&nbsp;?",
          answer:
            "Utilisez le formulaire de contact ou envoyez-nous un email &agrave; contact@dakarmarket.sn en d&eacute;crivant le probl&egrave;me rencontr&eacute;.",
        },
      ],
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
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Questions fréquentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement des réponses aux questions les plus courantes sur
            l&apos;utilisation de DakarMarket.
          </p>
        </section>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`item-${categoryIndex}-${faqIndex}`}
                    >
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <section className="mt-16 text-center bg-muted rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Notre équipe support est là pour vous aider. N&apos;hésitez pas à
            nous contacter pour toute question spécifique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">Nous contacter</Button>
            </Link>
            <a
              href="https://wa.me/221755227006?text=Bonjour%2C%20j%27ai%20une%20question"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </a>
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
