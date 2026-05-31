import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;

const allowedTypes = {
  image: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  video: new Set(["video/mp4", "video/webm", "video/quicktime"]),
  audio: new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"]),
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function webhookWithWait(url: string) {
  const webhookUrl = new URL(url);
  webhookUrl.searchParams.set("wait", "true");
  return webhookUrl.toString();
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 90) || "softcard-media";
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json({ error: "Invalid upload request." }, 403);
  }

  const webhookUrl = process.env.DISCORD_MEDIA_WEBHOOK_URL;
  if (!webhookUrl) {
    return json({ error: "Media uploads are not configured." }, 500);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Auth is not configured." }, 500);
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const response = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieHeader
          .split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith(`${name}=`))
          ?.split("=")[1];
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return json({ error: "You need to be signed in to upload media." }, 401);
  }

  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return json({ error: "Invalid upload request." }, 415);
  }

  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return json({ error: "Invalid upload request." }, 400);
  }

  const kind = String(body.get("kind") || "");
  const file = body.get("file");

  if (kind !== "image" && kind !== "video" && kind !== "audio") {
    return json({ error: "Invalid media type." }, 400);
  }

  if (!(file instanceof File)) {
    return json({ error: "Choose a file to upload." }, 400);
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return json({ error: `File is too large. Max ${Math.floor(MAX_UPLOAD_SIZE / 1024 / 1024)}MB.` }, 413);
  }

  if (!allowedTypes[kind].has(file.type)) {
    return json({ error: `Unsupported ${kind} file type.` }, 400);
  }

  const upload = new FormData();
  upload.append(
    "payload_json",
    JSON.stringify({
      content: `softcard upload: ${kind} by ${user.id}`,
      allowed_mentions: { parse: [] },
    })
  );
  upload.append("files[0]", file, safeFileName(file.name));

  const discordResponse = await fetch(webhookWithWait(webhookUrl), {
    method: "POST",
    body: upload,
  });

  if (!discordResponse.ok) {
    return json({ error: "Discord upload failed. Try a smaller file." }, 502);
  }

  const discordMessage = await discordResponse.json();
  const url = discordMessage?.attachments?.[0]?.url;

  if (typeof url !== "string" || !url.startsWith("https://")) {
    return json({ error: "Discord did not return a usable media URL." }, 502);
  }

  return json({ url, name: file.name, type: file.type, size: file.size });
}
