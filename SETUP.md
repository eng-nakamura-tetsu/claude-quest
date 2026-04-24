# GitHub App + Vercel KV Setup

## 1. Vercel KV
1. In Vercel dashboard → Storage → Create KV database
2. Copy `KV_REST_API_URL` and `KV_REST_API_TOKEN` to Vercel env vars

## 2. GitHub App
1. Go to github.com/settings/apps/new
2. Name: "Claude Quest"
3. Webhook URL: `https://claude-quest.vercel.app/api/webhooks/github`
4. Webhook secret: generate a random string, save as `GITHUB_APP_WEBHOOK_SECRET` in Vercel
5. Permissions: Issues (Read), Pull requests (Read)
6. Events: Subscribe to "Issues" and "Pull requests"
7. Install the app on your org/repo

## 3. Test
Open a PR and merge it — EXP should be awarded.
Check: `https://claude-quest.vercel.app/api/exp/{org}/{login}`
