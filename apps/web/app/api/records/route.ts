import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const serverUrl = "http://localhost:3000/api/records";

export async function GET() {
  const sid = (await cookies()).get("sid")?.value;
  const response = await fetch(serverUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `sid=${sid}`,
    },
  });

  const responseBody = await response.text();

  return new Response(responseBody, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  const sid = (await cookies()).get("sid")?.value;
  const body = await req.text();

  const response = await fetch(serverUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `sid=${sid}`,
    },
    body,
  });

  const responseBody = await response.text();

  return new Response(responseBody, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
