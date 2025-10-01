export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          from_user: string;
          to_user: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user: string;
          to_user: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user?: string;
          to_user?: string;
          content?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: "client" | "merchant";
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "client" | "merchant";
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "client" | "merchant";
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
