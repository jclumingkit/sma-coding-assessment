import { cookies } from "next/headers";

const serverUrl = "http://localhost:3000/api/session";

export async function GET() {
  const sid = (await cookies()).get("sid")?.value;

  const response = await fetch(serverUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `sid=${sid}`,
    },
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
