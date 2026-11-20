// Deploy upload-this-folder to Netlify (site: mfd-pos -> https://mfd-pos.netlify.app).
// Uses the Netlify login saved on this PC (sign in once with: npx netlify-cli login).
// Usage:  node tools/deploy-netlify.mjs
// The till and the desktop app pick the new version up by themselves
// ("A new version of MFD POS is ready" -> Update now).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SITE = 'mfd-pos';
const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'upload-this-folder');

const cfg = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA || '', 'netlify', 'Config', 'config.json'), 'utf8'));
const TOKEN = cfg.users[cfg.userId].auth.token;

async function api(p, opt = {}) {
  let r;
  for (let i = 1; ; i++) {
    try {
      r = await fetch('https://api.netlify.com/api/v1' + p, { ...opt, headers: { Authorization: 'Bearer ' + TOKEN, ...(opt.headers || {}) }, signal: AbortSignal.timeout(60000) });
      break;
    } catch (e) { if (i >= 8) throw e; await new Promise(res => setTimeout(res, 3000 * i)); }   // flaky connection: try again
  }
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t; }
  if (!r.ok) throw new Error(r.status + ' ' + (j.message || t));
  return j;
}

const site = (await api('/sites?per_page=100')).find(s => s.name === SITE);
if (!site) throw new Error(`Site "${SITE}" not found on this Netlify account`);

const files = {}, byHash = {};
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    const rel = '/' + path.relative(DIR, p).split(path.sep).join('/');
    const h = crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
    files[rel] = h; (byHash[h] ||= []).push(rel);
  }
})(DIR);

const version = fs.readFileSync(path.join(DIR, 'version.txt'), 'utf8').trim();
const dep = await api(`/sites/${site.id}/deploys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files, title: 'MFD POS ' + version }) });
console.log(`MFD POS ${version}: ${Object.keys(files).length} files, ${dep.required.length} changed`);
for (const h of dep.required) {
  const rel = byHash[h][0];
  await api(`/deploys/${dep.id}/files${rel.split('/').map(encodeURIComponent).join('/')}`, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: fs.readFileSync(path.join(DIR, rel)) });
}
let d;
for (let i = 0; i < 60; i++) { d = await api(`/deploys/${dep.id}`); if (['ready', 'error'].includes(d.state)) break; await new Promise(r => setTimeout(r, 2000)); }
console.log(d.state === 'ready' ? `Live: ${site.ssl_url}` : `Deploy ${d.state}: ${d.error_message || ''}`);
if (d.state !== 'ready') process.exit(1);
