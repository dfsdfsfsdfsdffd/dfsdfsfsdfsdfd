export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const META_TYPE = "__softcard_meta";

function text(value: unknown, max = 80) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function mediaUrl(value: unknown) {
  const raw = text(value, 500);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

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
  const secret = process.env.DISCORD_PRESENCE_SYNC_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = request.headers.get("authorization") || "";

  if (!secret || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Presence sync is not configured." }, { status: 500 });
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const discordId = text(body.discordId, 40);
  if (!discordId) {
    return NextResponse.json({ error: "discordId is required." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profiles, error: readError } = await supabase
    .from("profiles")
    .select("id, links")
    .limit(1000);

  if (readError) {
    return NextResponse.json({ error: "Could not read profiles.", detail: readError.message }, { status: 500 });
  }

  const profile = (profiles || []).find((item: any) =>
    Array.isArray(item.links) && item.links.some((link: any) => link?.type === META_TYPE && link?.meta?.discordId === discordId)
  );

  if (!profile) {
    return NextResponse.json({ error: "No connected Softcard profile found for that Discord user." }, { status: 404 });
  }

  const links = Array.isArray(profile.links) ? profile.links : [];
  const status = text(body.status, 40);
  const activity = body.activity && typeof body.activity === "object" ? body.activity : {};
  const server = body.server && typeof body.server === "object" ? body.server : {};
  const identityPatch: Record<string, string> = {};
  const discordName = text(body.discordName, 40);
  const discordUsername = text(body.discordUsername, 40);
  const discordAvatar = mediaUrl(body.discordAvatar);
  const discordUrl = mediaUrl(body.discordUrl);

  if (discordName) identityPatch.discordName = discordName;
  if (discordUsername) identityPatch.discordUsername = discordUsername;
  if (discordAvatar) identityPatch.discordAvatar = discordAvatar;
  if (discordUrl) identityPatch.discordUrl = discordUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      links: writeMeta(links, {
        ...identityPatch,
        discordStatus: status || "offline",
        discordActivityName: text(activity.name, 80),
        discordActivityDetails: text(activity.details, 100),
        discordActivityState: text(activity.state, 100),
        discordActivityType: text(activity.type, 30),
        discordActivityImage: mediaUrl(activity.image),
        discordServerName: text(server.name, 80),
        discordServerStatus: text(server.status, 100),
        discordServerIcon: mediaUrl(server.icon),
        discordPresenceSyncedAt: new Date().toISOString(),
      }),
    })
    .eq("id", profile.id);

  if (updateError) {
    return NextResponse.json({ error: "Could not update presence." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
