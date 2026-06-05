import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const META_TYPE = "__softcard_meta";

function writeMeta(items: any[], patch: Record<string, unknown>) {
  const existing = items.filter((link) => link?.type !== META_TYPE);
  const current = items.find((link) => link?.type === META_TYPE);

  return [
    ...existing,
    {
      id: -1,
      type: META_TYPE,
      url: "https://softcard.cc",
      label: "",
      enabled: false,
      featured: false,
      ...(current || {}),
      meta: {
        ...(current?.meta || {}),
        ...patch,
      },
    },
  ];
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ error: "Discord is not configured." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("links")
    .eq("id", user.id)
    .single();

  const links = Array.isArray(profile?.links) ? profile.links : [];
  await supabaseAdmin
    .from("profiles")
    .update({
      links: writeMeta(links, {
        discordId: "",
        discordName: "",
        discordUsername: "",
        discordAvatar: "",
        discordUrl: "",
        discordConnected: false,
        discordConnectedAt: "",
        discordStatus: "last seen unknown",
      }),
    })
    .eq("id", user.id);

  return response;
}
