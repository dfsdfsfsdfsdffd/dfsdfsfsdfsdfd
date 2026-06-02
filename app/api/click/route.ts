import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function safeExternalUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("u")?.trim().toLowerCase() || "";
  const linkId = url.searchParams.get("id") || "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!username || !linkId || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, links")
    .eq("username", username)
    .maybeSingle();

  const links = Array.isArray(profile?.links) ? profile.links : [];
  const target = links.find((link: any) => String(link.id) === linkId && link.enabled !== false);
  const targetUrl = safeExternalUrl(target?.url);

  if (!profile?.id || !targetUrl) {
    return NextResponse.redirect(new URL(`/${username}`, request.url));
  }

  const updatedLinks = links.map((link: any) =>
    String(link.id) === linkId
      ? { ...link, clicks: Number(link.clicks || 0) + 1 }
      : link
  );

  await supabaseAdmin
    .from("profiles")
    .update({ links: updatedLinks })
    .eq("id", profile.id);

  return NextResponse.redirect(targetUrl);
}
