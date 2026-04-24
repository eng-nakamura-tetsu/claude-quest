import { getExp } from "@/lib/kv";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ org: string; login: string }> }
) {
  const { org, login } = await params;
  const exp = await getExp(org, login);
  return Response.json({ org, login, exp });
}
