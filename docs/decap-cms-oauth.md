# Decap CMS login: secure GitHub OAuth with Cloudflare Workers

The site is published from GitHub Pages, so it cannot keep a GitHub OAuth client secret. The CMS therefore uses a separate Cloudflare Worker as the OAuth exchange server. The secret stays in Cloudflare; it must never be committed to this repository or pasted into `admin/config.yml`.

## What you need to do

1. In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Application name: `Vishnu Portfolio CMS`
   - Homepage URL: `https://www.vishnumoguluri.com`
   - Authorization callback URL: `https://YOUR-WORKER.workers.dev/callback`
2. In Cloudflare, create a Worker (for example `vishnu-decap-oauth`) and paste the Worker code below. Deploy it to get its `https://…workers.dev` URL.
3. In the Worker’s **Settings → Variables and Secrets**, add these secrets (not plain-text variables):
   - `GITHUB_CLIENT_ID` — OAuth App client ID
   - `GITHUB_CLIENT_SECRET` — OAuth App client secret
   - `ALLOWED_ORIGIN` — `https://www.vishnumoguluri.com`
4. Replace `https://REPLACE-WITH-YOUR-WORKER.workers.dev` in `admin/config.yml` with the Worker URL and commit that non-secret change.
5. Open `https://www.vishnumoguluri.com/admin/` and sign in with a GitHub account that has write access to `vishnunotnice/Portfolio`.

The Worker checks an origin allow-list and a short-lived cryptographic state cookie before exchanging the authorization code. This prevents arbitrary sites from using the Worker as an OAuth relay.

## Worker code

```js
const encoder = new TextEncoder();
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const randomState = () => b64url(crypto.getRandomValues(new Uint8Array(32)));

function page(message, status = 200) {
  return new Response(`<!doctype html><title>CMS login</title><p>${message}</p>`, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN;
    if (!origin || !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return page('Worker configuration is incomplete.', 500);

    if (url.pathname === '/auth') {
      const state = randomState();
      const github = new URL('https://github.com/login/oauth/authorize');
      github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      github.searchParams.set('redirect_uri', `${url.origin}/callback`);
      github.searchParams.set('scope', 'repo');
      github.searchParams.set('state', state);
      return new Response(null, { status: 302, headers: {
        location: github.toString(),
        'set-cookie': `decap_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/callback; Max-Age=600`
      }});
    }

    if (url.pathname === '/callback') {
      const state = url.searchParams.get('state');
      const cookie = request.headers.get('cookie') || '';
      const savedState = cookie.match(/(?:^|;\\s*)decap_oauth_state=([^;]+)/)?.[1];
      const code = url.searchParams.get('code');
      if (!code || !state || !savedState || state !== savedState) return page('Login state did not match. Please close this window and try again.', 400);
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${url.origin}/callback` })
      });
      const token = await tokenResponse.json();
      if (!token.access_token) return page('GitHub did not return an access token.', 401);
      const payload = JSON.stringify(`authorization:github:success:${JSON.stringify(token)}`);
      const target = JSON.stringify(origin);
      return new Response(`<!doctype html><script>window.opener.postMessage(${payload}, ${target}); window.close();</script><p>Login complete. You can close this window.</p>`, {
        headers: { 'content-type': 'text/html; charset=utf-8', 'set-cookie': 'decap_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/callback; Max-Age=0' }
      });
    }
    return page('Decap CMS OAuth proxy is running.');
  }
};
```

## Operational notes

- Only GitHub accounts with write access to this repository can publish.
- The Worker asks GitHub for the `repo` scope because Decap writes post files and uploaded images to the repository. Keep the CMS URL private or protect it further with Cloudflare Access if more people should not see it.
- GitHub Pages automatically rebuilds Jekyll sites after a commit to `main`. If the Pages source is set to a `/docs` folder rather than the repository root, change it to **main / (root)**.
- Rotating the GitHub OAuth secret requires only updating the Cloudflare secret; it is never a repository change.
