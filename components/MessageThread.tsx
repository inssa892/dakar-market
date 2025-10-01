"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile, supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Loader as Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MessageThreadProps {
  otherUser: Profile;
  onClose?: () => void;
}

export interface Message {
  id: string;
  from_user: string;
  to_user: string | null;
  content: string;
  created_at: string;
  read?: boolean;
  conversation_id?: string | null;
}

export default function MessageThread({
  otherUser,
  onClose,
}: MessageThreadProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages between current user and otherUser
  const fetchMessages = useCallback(async () => {
    if (!user || !otherUser?.id) return;
    setLoading(true);
    try {
      // Sans génériques pour éviter les erreurs de typage si les types DB ne sont pas injectés
      const resp = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(from_user.eq.${user.id},to_user.eq.${otherUser.id}),and(from_user.eq.${otherUser.id},to_user.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      // resp peut contenir { data, error } — on cast en any pour sécurité TS
      const data = (resp as any).data as Message[] | null;
      const error = (resp as any).error;
      if (error) {
        console.error("fetchMessages error:", error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error("fetchMessages exception:", err);
    } finally {
      setLoading(false);
    }
  }, [user, otherUser?.id]);

  // Realtime subscription: new messages
  useEffect(() => {
    if (!user || !otherUser?.id) return;

    // initial fetch
    fetchMessages();

    const channelName = `messages-thread-${user.id}-${otherUser.id}`;
    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload: any) => {
        const msg = payload.new as Message;
        // filtrer uniquement les messages du thread en cours
        if (
          (msg.from_user === user.id && msg.to_user === otherUser.id) ||
          (msg.from_user === otherUser.id && msg.to_user === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    );

    // lancer l'abonnement sans await (subscribe() renvoie une Promise dans supabase v2)
    void channel.subscribe();

    // cleanup synchronously (void pour ignorer la Promise retournée)
    return () => {
      void supabase.removeChannel(channel);
    };
    // fetchMessages est stable (useCallback) — on l'inclut pour l'ESLint
  }, [user, otherUser?.id, fetchMessages]);

  // Scroll to bottom on messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // petit délai pour s'assurer que le DOM est rendu
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 50);
    return () => clearTimeout(t);
  }, [messages]);

  // Send message
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !user || !otherUser?.id) return;

    setSending(true);
    try {
      // Insert via supabase client (sans génériques)
      const resp = await supabase.from("messages").insert([
        {
          from_user: user.id,
          to_user: otherUser.id,
          content: newMessage.trim(),
        },
      ]);

      const error = (resp as any).error;
      if (error) {
        console.error("sendMessage error:", error);
      } else {
        // Optimistic: on peut ajouter le message localement si on veut une UI instantanée,
        // mais la souscription realtime ajoutera aussi le message. Ici on vide le champ.
        setNewMessage("");
      }
    } catch (err) {
      console.error("sendMessage exception:", err);
    } finally {
      setSending(false);
    }
  };

  const getAvatar = (profile: Profile | undefined | null) =>
    profile?.avatar_url || "";
  const getDisplayName = (profile: Profile | undefined | null) =>
    profile?.display_name || profile?.email || "Utilisateur";
  const getInitials = (profile: Profile | undefined | null) =>
    profile?.display_name?.[0]?.toUpperCase() ||
    profile?.email?.[0]?.toUpperCase() ||
    "?";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement des messages...</span>
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getAvatar(otherUser)} />
              <AvatarFallback>{getInitials(otherUser)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{getDisplayName(otherUser)}</div>
              <div className="text-xs text-muted-foreground">
                {otherUser.role === "merchant" ? "Marchand" : "Client"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Badge
              variant={otherUser.role === "merchant" ? "default" : "secondary"}
            >
              {otherUser.role === "merchant" ? "Marchand" : "Client"}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {/* wrapper with ref for scrolling */}
          <div ref={scrollRef} className="space-y-4 h-full">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Aucun message pour le moment. Commencez la conversation&nbsp;!
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.from_user === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[80%] ${
                        isMe ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={getAvatar(isMe ? (user as any) : otherUser)}
                        />
                        <AvatarFallback>
                          {getInitials(isMe ? (user as any) : otherUser)}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`relative rounded-2xl px-4 py-2 shadow-md break-words ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted rounded-bl-sm"
                        }`}
                        style={{ minWidth: 60 }}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        <div className="text-xs opacity-60 mt-1 text-right">
                          {msg.created_at
                            ? format(new Date(msg.created_at), "HH:mm dd/MM", {
                                locale: fr,
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
