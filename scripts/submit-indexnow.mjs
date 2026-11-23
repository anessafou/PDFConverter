// Manual, production-verified IndexNow submissions. Not run on every build.
const HOST = 'www.pdfconverter.space';
const ORIGIN = 'https://' + HOST;
const KEY = '274ee456c0efb1d75a6e34bcde0b30cd';
const keyLocation = ORIGIN + '/' + KEY + '.txt';
const args = process.argv.slice(2);
const submit = args.includes('--submit');
const urls = [...new Set(args.filter(x => x !== '--submit'))];

if (!urls.length || urls.length > 100) {
  throw new Error('Supply 1–100 full URLs. Add --submit to send.');
}
for (const value of urls) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Invalid URL: ' + value); }
  if (url.origin !== ORIGIN || url.username || url.password || url.search || url.hash ||
      url.pathname.startsWith('/api/') || /\.(xml|txt|json|png|jpe?g|webp|ico|css|js|svg|pdf)$/i.test(url.pathname)) {
    throw new Error('Not an eligible page URL: ' + value);
  }
}
console.log('URLs selected:', urls.length);
if (!submit) {
  console.log('Dry-run only. Add --submit after the key file is publicly deployed.');
  process.exit(0);
}
const keyResponse = await fetch(keyLocation, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
if (!keyResponse.ok || (await keyResponse.text()).trim() !== KEY) {
  throw new Error('Key file unavailable on production: ' + keyLocation);
}
const eligible = [];
for (const value of urls) {
  const response = await fetch(value, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) {
    console.log('SKIP non-200/non-HTML:', value);
    continue;
  }
  const html = await response.text();
  const xRobots = response.headers.get('x-robots-tag') || '';
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]);
  const isNoindex = /\bnoindex\b/i.test(xRobots) ||
    meta.some(tag => /name\s*=\s*["'](?:robots|bingbot)["']/i.test(tag) && /\bnoindex\b/i.test(tag));
  const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => m[0])
    .find(tag => /rel\s*=\s*["']canonical["']/i.test(tag));
  const canonical = canonicalTag?.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
  if (isNoindex || !canonical || new URL(canonical, value).href !== value) {
    console.log('SKIP noindex or noncanonical:', value);
    continue;
  }
  eligible.push(value);
}
if (!eligible.length) throw new Error('No eligible canonical URLs found.');
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList: eligible }),
  signal: AbortSignal.timeout(20000),
});
console.log('IndexNow HTTP status:', response.status, 'URLs:', eligible.length);
if (![200, 202].includes(response.status)) {
  console.error((await response.text()).slice(0, 500));
  process.exitCode = 1;
}
