export const runtime = "nodejs"; // need crypto

import { createHmac, timingSafeEqual } from "crypto";
import { addExp } from "@/lib/kv";

async function verifySignature(req: Request, body: string): Promise<boolean> {
  const sig = req.headers.get("x-hub-signature-256") ?? "";
  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET ?? "";
  if (!secret) return true; // skip verification in dev (no secret set)
  const expected =
    "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  if (!(await verifySignature(req, body))) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  const payload = JSON.parse(body) as Record<string, unknown>;

  // Extract org/repo from payload.repository
  const repository = payload.repository as
    | { owner?: { login?: string }; name?: string }
    | undefined;
  const org = repository?.owner?.login;
  const repo = repository?.name;

  if (!org || !repo) return Response.json({ ok: true });

  // PR merged
  if (
    event === "pull_request" &&
    payload.action === "closed" &&
    (payload.pull_request as { merged?: boolean } | undefined)?.merged === true
  ) {
    const pr = payload.pull_request as {
      user?: { login?: string };
      additions?: number;
    };
    const login = pr.user?.login;
    if (login) {
      const additions = pr.additions ?? 0;
      const exp = Math.min(500, Math.max(50, Math.floor(50 + additions * 0.5)));
      await addExp(org, login, exp);
      console.log(
        `[webhook] PR merged: ${org}/${repo} by ${login} +${exp} EXP`
      );
    }
  }

  // Issue closed
  if (event === "issues" && payload.action === "closed") {
    const issue = payload.issue as
      | {
          assignee?: { login?: string };
          user?: { login?: string };
          labels?: { name: string }[];
        }
      | undefined;
    const login =
      issue?.assignee?.login ?? issue?.user?.login;
    if (login) {
      const labels: string[] = (issue?.labels ?? []).map(
        (l: { name: string }) => l.name
      );
      const difficulty = labels.some((l) => l === "epic")
        ? 5
        : labels.some((l) => l === "breaking change")
        ? 4
        : labels.some((l) =>
            ["enhancement", "feature", "bug"].includes(l)
          )
        ? 3
        : labels.some((l) => l === "help wanted")
        ? 2
        : 2;
      const exp = difficulty * 50;
      await addExp(org, login, exp);
      console.log(
        `[webhook] Issue closed: ${org}/${repo} by ${login} +${exp} EXP`
      );
    }
  }

  return Response.json({ ok: true });
}
