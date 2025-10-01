"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import MessageThread from "@/components/MessageThread";
import { Profile } from "@/lib/supabase";
import { useMessages } from "@/hooks/useMessages";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MessagesPage() {
  const { threads, loading, refreshThreads } = useMessages();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Écoute temps réel pour mettre à jour les threads
  useRealtimeMessages({ onMessageUpdate: refreshThreads });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto px-2 sm:px-4">
      {selectedUser ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedUser(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              Discussion avec {selectedUser.display_name || selectedUser.email}
            </h1>
          </div>
          <MessageThread
            otherUser={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-4">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Messagerie</h1>
              <p className="text-muted-foreground">
                Vos conversations avec les autres utilisateurs
              </p>
            </div>
          </div>

          {/* Threads */}
          {threads.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Aucun message pour le moment
                </h2>
                <p className="text-muted-foreground">
                  Commencez une conversation en contactant d&apos;autres
                  utilisateurs
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <Card
                  key={`${thread.otherUser.id}-${thread.lastMessage?.created_at}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedUser(thread.otherUser)}
                >
                  <CardContent className="p-4 flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={thread.otherUser.avatar_url || ""} />
                      <AvatarFallback>
                        {thread.otherUser.display_name?.[0] ||
                          thread.otherUser.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 truncate">
                          <h3 className="font-semibold truncate">
                            {thread.otherUser.display_name ||
                              thread.otherUser.email}
                          </h3>
                          <Badge
                            variant={
                              thread.otherUser.role === "merchant"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {thread.otherUser.role === "merchant"
                              ? "Marchand"
                              : "Client"}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                          {thread.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {thread.unreadCount}
                            </Badge>
                          )}
                          {thread.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(thread.lastMessage.created_at),
                                "dd MMM",
                                { locale: fr }
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {thread.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {thread.lastMessage.from_user === thread.otherUser.id
                            ? ""
                            : "Vous: "}
                          {thread.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
