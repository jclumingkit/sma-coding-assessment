import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const serverUrl = "http://localhost:3000";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const { email, password } = await req.json();

  const response = await fetch(`${serverUrl}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({ data: null, error: await response.text() }),
      { status: response.status }
    );
  }

  const data = await response.json();

  const setCookieHeader = response.headers.get("set-cookie");

  if (setCookieHeader) {
    const match = setCookieHeader.match(/sid=([^;]+)/);
    if (match) {
      const sidValue = match[1];
      cookieStore.set("sid", sidValue, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 3600,
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  return new Response(JSON.stringify({ data, error: null }));
}
