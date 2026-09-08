import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Dokumente private (preventiva, oferta) të mbrojtura me kod.
 *
 * Skedarët HTML rrinë në src/offers/<slug>.html — jashtë public/, që të mos
 * shërbehen kurrë direkt. Hapen vetëm nga kjo rrugë, pasi verifikohet kodi.
 *
 * Kërkohen dy variabla mjedisi në Vercel (Settings → Environment Variables):
 *
 *   OFFER_SECRET  = një varg i gjatë i rastësishëm, p.sh. dalja e
 *                   `openssl rand -hex 32`. Përdoret për të nënshkruar cookie-n.
 *
 *   OFFER_CODES   = JSON që lidh slug-un me kodin e klientit, p.sh.
 *                   {"preventiv-ankand-9f2458d232f8":"Shkoder2026"}
 *
 * Për një dokument të ri: shto skedarin në src/offers/ dhe një çelës të ri
 * te OFFER_CODES. Asgjë tjetër nuk ndryshon.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OFFERS_DIR = path.join(process.cwd(), "src", "offers");
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,80}$/;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 ditë

type Ctx = { params: Promise<{ slug: string }> };

type Resolved =
  | { ok: true; code: string; signed: string }
  | { ok: false; response: Response };

/**
 * Lexohet me çelës të llogaritur, jo si `process.env.OFFER_SECRET`. Format e
 * drejtpërdrejta mund të zëvendësohen me vlerën e kohës së ndërtimit, dhe
 * variablat e ndjeshëm nuk ekzistojnë atëherë — do të ngurtësoheshin si
 * `undefined` përgjithmonë.
 */
function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value === "" ? undefined : value;
}

/**
 * Ndan gabimin e konfigurimit nga dokumenti që nuk ekziston. Një slug i
 * panjohur mbetet 404, që të mos zbulohet se cilat dokumente ka; mungesa e
 * variablave kthen 503, që problemi të kuptohet pa hyrë në logje.
 */
function resolve(slug: string): Resolved {
  const secret = readEnv("OFFER_SECRET");
  if (!secret || secret.length < 16) {
    return { ok: false, response: misconfigured("OFFER_SECRET") };
  }

  const raw = readEnv("OFFER_CODES");
  if (!raw) {
    return { ok: false, response: misconfigured("OFFER_CODES") };
  }

  let map: Record<string, unknown>;
  try {
    map = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {
      ok: false,
      response: misconfigured("OFFER_CODES &mdash; nuk lexohet si JSON"),
    };
  }

  const code = map[slug];
  if (typeof code !== "string" || code.length === 0) {
    return { ok: false, response: notFound() };
  }

  return {
    ok: true,
    code,
    signed: createHmac("sha256", secret).update(slug).digest("hex"),
  };
}

function equals(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function cookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return null;
}

function privateHtml(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
      "x-robots-tag": "noindex, nofollow, noarchive",
      "referrer-policy": "no-referrer",
    },
  });
}

function notFound(): Response {
  return privateHtml(
    "<!doctype html><meta charset=utf-8><title>404</title><p>Faqja nuk u gjet.</p>",
    404,
  );
}

/**
 * Emri i variablit mjafton për ta gjetur shkakun; gjatësitë dhe commit-i i
 * deploy-it hiqen, se nuk kanë pse të rrinë të dukshme publikisht.
 */
function misconfigured(what: string): Response {
  return privateHtml(
    "<!doctype html><meta charset=utf-8><title>503</title>" +
      `<p>Konfigurim i paplotë: <b>${what}</b> mungon ose nuk lexohet dot.</p>` +
      "<p>Shtoje te Environment Variables n&euml; mjedisin Production dhe b&euml;j Redeploy.</p>",
    503,
  );
}

function gate(slug: string, wrong: boolean): string {
  return `<!doctype html>
<html lang="sq">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Dokument i mbrojtur</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
  *{box-sizing:border-box}
  html{color-scheme:light}
  body{
    margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem 1.5rem;
    background:#F6F7F4;color:#12211B;
    font-family:"IBM Plex Sans","Segoe UI",Helvetica,Arial,sans-serif;
    font-size:16px;line-height:1.6;
  }
  .box{width:100%;max-width:24rem}
  .eyebrow{
    font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;
    color:#1E4B3A;font-weight:600;margin-bottom:.9rem;
  }
  h1{
    font-family:"Bodoni Moda",Georgia,serif;font-weight:400;
    font-size:2rem;line-height:1.15;margin:0 0 .7rem;
  }
  p{color:#4A5550;margin:0 0 1.6rem;font-size:.95rem}
  label{
    display:block;font-size:.72rem;letter-spacing:.09em;text-transform:uppercase;
    color:#6B7570;font-weight:600;margin-bottom:.45rem;
  }
  input{
    width:100%;font:inherit;padding:.7rem .8rem;
    border:1px solid #B7BEB4;background:#fff;color:inherit;border-radius:0;
  }
  input:focus-visible{outline:2px solid #8A6A1E;outline-offset:1px;border-color:#1E4B3A}
  button{
    margin-top:.9rem;width:100%;font:inherit;font-weight:600;
    font-size:.8rem;letter-spacing:.09em;text-transform:uppercase;
    padding:.75rem 1rem;border:1px solid #1E4B3A;background:#1E4B3A;color:#F6F7F4;
    cursor:pointer;
  }
  button:hover{background:#12211B;border-color:#12211B}
  .err{
    margin:0 0 1.2rem;padding:.6rem .8rem;font-size:.88rem;
    background:#F6E9E4;border-left:2px solid #9B3B1E;color:#6B2914;
  }
  .foot{margin:1.8rem 0 0;font-size:.8rem;color:#6B7570}
</style>
</head>
<body>
  <div class="box">
    <div class="eyebrow">Dokument i mbrojtur</div>
    <h1>Ky dokument kërkon kod</h1>
    <p>Vendosni kodin që keni marrë bashkë me lidhjen për ta hapur dokumentin.</p>
    ${wrong ? '<p class="err">Kodi nuk është i saktë. Provoni përsëri.</p>' : ""}
    <form method="post" action="/p/${slug}">
      <label for="code">Kodi i hyrjes</label>
      <input id="code" name="code" type="password" autocomplete="off" autofocus required>
      <button type="submit">Hap dokumentin</button>
    </form>
    <p class="foot">Nëse nuk e keni kodin, kërkojeni nga personi që ju dërgoi lidhjen.</p>
  </div>
</body>
</html>`;
}

export async function GET(request: Request, ctx: Ctx): Promise<Response> {
  const { slug } = await ctx.params;
  if (!SLUG_PATTERN.test(slug)) return notFound();

  const conf = resolve(slug);
  if (!conf.ok) return conf.response;

  const presented = cookieValue(request.headers.get("cookie"), `offer_${slug}`);
  if (!presented || !equals(presented, conf.signed)) {
    return privateHtml(gate(slug, false), 401);
  }

  const file = await readFile(path.join(OFFERS_DIR, `${slug}.html`), "utf8").catch(
    () => null,
  );
  if (file === null) return notFound();

  return privateHtml(file, 200);
}

export async function POST(request: Request, ctx: Ctx): Promise<Response> {
  const { slug } = await ctx.params;
  if (!SLUG_PATTERN.test(slug)) return notFound();

  const conf = resolve(slug);
  if (!conf.ok) return conf.response;

  const form = await request.formData().catch(() => null);
  const submitted = form ? String(form.get("code") ?? "") : "";

  if (!equals(submitted, conf.code)) {
    return privateHtml(gate(slug, true), 401);
  }

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(null, {
    status: 303,
    headers: {
      location: `/p/${slug}`,
      "set-cookie": `offer_${slug}=${conf.signed}; Path=/p/${slug}; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`,
      "cache-control": "private, no-store, max-age=0",
    },
  });
}
