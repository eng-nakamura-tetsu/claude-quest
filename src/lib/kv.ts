// Wraps @vercel/kv with safe fallbacks when KV is not configured
// KV keys:
//   exp:{org}:{login}    → number (total EXP)
//   streak:{org}:{login} → { count: number; lastDate: string }

function kvAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKv() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

export async function getExp(org: string, login: string): Promise<number> {
  if (!kvAvailable()) return 0;
  const kv = await getKv();
  const value = await kv.get<number>(`exp:${org}:${login}`);
  return value ?? 0;
}

export async function addExp(
  org: string,
  login: string,
  amount: number
): Promise<number> {
  if (!kvAvailable()) return 0;
  const kv = await getKv();
  const newTotal = await kv.incrby(`exp:${org}:${login}`, amount);
  return newTotal;
}

export async function getOrgLeaderboard(
  org: string,
  logins: string[]
): Promise<Record<string, number>> {
  if (!kvAvailable()) return {};
  const results = await Promise.all(
    logins.map(async (login) => {
      const exp = await getExp(org, login);
      return [login, exp] as [string, number];
    })
  );
  return Object.fromEntries(results);
}
