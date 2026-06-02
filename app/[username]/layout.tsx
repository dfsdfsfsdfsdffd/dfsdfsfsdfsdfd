import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeImage(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const fallbackTitle = `${params.username} | softcard.cc`;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { title: fallbackTitle };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url")
    .eq("username", params.username)
    .maybeSingle();

  const displayName = text(profile?.display_name, params.username);
  const title = `${displayName} | softcard.cc`;
  const description = text(profile?.bio, `View ${displayName}'s Softcard profile.`).slice(0, 160);
  const image = safeImage(profile?.avatar_url);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function UsernameLayout({ children }: { children: ReactNode }) {
  return children;
}
