"use client";

import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = async () => {
    if (
      !("SpeechRecognition" in window) &&
      !("webkitSpeechRecognition" in window)
    ) {
      toast.error(
        "La reconnaissance vocale n'est pas supportée dans ce navigateur"
      );
      return;
    }

    // On force le type pour TypeScript
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "fr-FR";

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Écoute... Parlez maintenant!");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      toast.error("Erreur de reconnaissance vocale: " + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    if (
      lowerCommand.includes("produits") ||
      lowerCommand.includes("show products") ||
      lowerCommand.includes("view products")
    ) {
      window.location.href = "/dashboard/products";
      toast.success("Navigation vers les produits");
    } else if (
      lowerCommand.includes("commandes") ||
      lowerCommand.includes("show orders") ||
      lowerCommand.includes("view orders")
    ) {
      window.location.href = "/dashboard/orders";
      toast.success("Navigation vers les commandes");
    } else if (
      lowerCommand.includes("messages") ||
      lowerCommand.includes("show messages") ||
      lowerCommand.includes("view messages")
    ) {
      window.location.href = "/dashboard/messages";
      toast.success("Navigation vers les messages");
    } else if (
      lowerCommand.includes("panier") ||
      lowerCommand.includes("cart")
    ) {
      window.location.href = "/dashboard/cart";
      toast.success("Navigation vers le panier");
    } else if (
      lowerCommand.includes("favoris") ||
      lowerCommand.includes("favorites")
    ) {
      window.location.href = "/dashboard/favorites";
      toast.success("Navigation vers les favoris");
    } else if (
      lowerCommand.includes("dashboard") ||
      lowerCommand.includes("tableau de bord") ||
      lowerCommand.includes("accueil")
    ) {
      window.location.href = "/dashboard";
      toast.success("Navigation vers le tableau de bord");
    } else if (
      lowerCommand.includes("paramètres") ||
      lowerCommand.includes("settings") ||
      lowerCommand.includes("profile")
    ) {
      window.location.href = "/dashboard/settings";
      toast.success("Navigation vers les paramètres");
    } else if (
      lowerCommand.includes("recherche") ||
      lowerCommand.includes("search")
    ) {
      const searchInput = document.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        toast.success("Champ de recherche activé");
      } else {
        toast.info("Champ de recherche non disponible sur cette page");
      }
    } else {
      toast.info(
        `Commande vocale reçue: "${command}". Commandes disponibles: produits, commandes, messages, panier, favoris, dashboard, paramètres, recherche.`
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <Button
        onClick={isListening ? stopListening : startListening}
        size="icon"
        variant={isListening ? "destructive" : "default"}
        className="rounded-full w-12 h-12 shadow-lg"
      >
        {isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>

      {transcript && (
        <div className="absolute bottom-16 right-0 bg-background border rounded-lg p-2 shadow-md min-w-[200px]">
          <p className="text-sm">Dernière commande:</p>
          <p className="text-xs text-muted-foreground">{transcript}</p>
        </div>
      )}
    </div>
  );
}
