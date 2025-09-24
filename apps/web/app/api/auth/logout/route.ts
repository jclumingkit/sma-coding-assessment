import { cookies } from "next/headers";

const serverUrl = "http://localhost:3000/api/logout";

export async function POST() {
  const cookieStore = await cookies();
  const sid = cookieStore.get("sid")?.value;

  const response = await fetch(serverUrl, {
    method: "POST",
    headers: {
      Cookie: `sid=${sid}`,
    },
  });

  if (response.ok) {
    cookieStore.delete("sid");
  }

  return new Response(await response.text(), { status: response.status });
}
