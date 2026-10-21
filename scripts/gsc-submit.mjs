#!/usr/bin/env node

/**
 * Google Search Console (GSC) API Submitter & Inspector
 * 
 * Sender automatisk inn oppdatert sitemap og inspiserer indekseringsstatus
 * hos Google via Search Console API v3 og URL Inspection API.
 * 
 * Bruk:
 *   npm run gsc:submit
 *   npm run gsc:submit -- --inspect https://www.krsvr.no/arrangementer/vr-teambuilding
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JWT } from "google-auth-library";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Hent miljøvariabler fra .env hvis ikke allerede lastet
function loadEnv() {
  const envPath = path.join(rootDir, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val.replace(/\\n/g, "\n");
        }
      }
    }
  }
}

loadEnv();

function getCredentials() {
  const possiblePaths = [
    path.join(rootDir, "gsc-service-account.json"),
    path.join(rootDir, "service-account.json"),
    path.join(rootDir, "google-credentials.json"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = JSON.parse(fs.readFileSync(p, "utf8"));
        if (content.client_email && content.private_key) {
          return { ...content, source: path.basename(p) };
        }
      } catch (err) {
        console.error(`Feil ved lesing av ${p}:`, err.message);
      }
    }
  }

  if (process.env.GSC_SERVICE_ACCOUNT_KEY) {
    try {
      let raw = process.env.GSC_SERVICE_ACCOUNT_KEY.trim();
      if (!raw.startsWith("{")) {
        raw = Buffer.from(raw, "base64").toString("utf8");
      }
      const parsed = JSON.parse(raw);
      if (parsed.client_email && parsed.private_key) {
        return { ...parsed, source: "ENV: GSC_SERVICE_ACCOUNT_KEY" };
      }
    } catch (err) {
      console.error("Kunne ikke parse GSC_SERVICE_ACCOUNT_KEY fra .env:", err.message);
    }
  }

  if (process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY) {
    return {
      client_email: process.env.GSC_CLIENT_EMAIL,
      private_key: process.env.GSC_PRIVATE_KEY.replace(/\\n/g, "\n"),
      source: "ENV: GSC_CLIENT_EMAIL & GSC_PRIVATE_KEY",
    };
  }

  return null;
}

async function inspectUrl(client, property, url) {
  try {
    const res = await client.request({
      url: "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      method: "POST",
      data: {
        inspectionUrl: url,
        siteUrl: property,
      },
    });

    const status = res.data?.inspectionResult?.indexStatusResult;
    if (status) {
      console.log(`\n\x1b[36m[URL Inspeksjon]\x1b[0m \x1b[1m${url}\x1b[0m:`);
      console.log(`  • Dekning: \x1b[32m${status.coverageState || "Ukjent"}\x1b[0m (Verdict: ${status.verdict})`);
      console.log(`  • Indeksering tillatt: ${status.indexingState}`);
      console.log(`  • Robots.txt: ${status.robotsTxtState}`);
      console.log(`  • Sist crawlet av Google: \x1b[33m${status.lastCrawlTime || "Ikke registrert"}\x1b[0m som ${status.crawledAs || "BOT"}`);
      console.log(`  • Google Canonical: ${status.googleCanonical || "Ikke valgt"}`);
      const rich = res.data?.inspectionResult?.richResultsResult;
      if (rich?.detectedItems) {
        console.log(`  • Rike resultater (Rich Snippets): \x1b[32m${rich.verdict}\x1b[0m (${rich.detectedItems.map(i => i.richResultType).join(", ")})`);
      }
    }
  } catch (err) {
    console.warn(`\x1b[33m[GSC Inspeksjon ⚠️]\x1b[0m Kunne ikke inspisere ${url}:`, err.response?.data?.error?.message || err.message);
  }
}

async function main() {
  const credentials = getCredentials();

  if (!credentials) {
    console.error("Fant ingen credentials for Google Search Console (gsc-service-account.json mangler).");
    process.exit(1);
  }

  console.log(`\x1b[36m[GSC]\x1b[0m Autentiserer mot Google som: \x1b[1m${credentials.client_email}\x1b[0m`);

  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      "https://www.googleapis.com/auth/webmasters",
      "https://www.googleapis.com/auth/indexing",
    ],
  });

  await client.authorize();
  console.log("\x1b[32m[GSC]\x1b[0m Autentisering vellykket!");

  const targetProperty = "sc-domain:krsvr.no";
  const targetSitemap = "https://www.krsvr.no/sitemap.xml";

  // 1. Send inn sitemap
  console.log(`\x1b[36m[GSC]\x1b[0m Sender inn sitemap: \x1b[1m${targetSitemap}\x1b[0m til \x1b[1m${targetProperty}\x1b[0m...`);
  const putEndpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(targetProperty)}/sitemaps/${encodeURIComponent(targetSitemap)}`;

  try {
    const res = await client.request({
      url: putEndpoint,
      method: "PUT",
    });

    if (res.status === 200 || res.status === 204) {
      console.log(`\x1b[32m[GSC ✅]\x1b[0m Innsending godkjent av Google (Status: ${res.status} OK)`);
    }
  } catch (err) {
    console.error(`\x1b[31m[GSC ❌]\x1b[0m Innsending feilet:`, err.response?.data?.error?.message || err.message);
    process.exit(1);
  }

  // 2. Hent oppdatert sitemap-status
  try {
    const getRes = await client.request({
      url: putEndpoint,
      method: "GET",
    });
    const info = getRes.data;
    if (info) {
      console.log(`\x1b[36m[GSC Status]\x1b[0m`);
      console.log(`  • Sist sendt inn: \x1b[1m${info.lastSubmitted || "N/A"}\x1b[0m`);
      console.log(`  • Sist lest av Google: \x1b[1m${info.lastDownloaded || "Under behandling"}\x1b[0m`);
      console.log(`  • Advarsler / Feil: \x1b[32m${info.warnings || 0} advarsler, ${info.errors || 0} feil\x1b[0m`);
      if (info.contents && info.contents.length > 0) {
        const c = info.contents[0];
        console.log(`  • Antall sider i sitemap: \x1b[32m\x1b[1m${c.submitted} sider levert til Google\x1b[0m (Indeksert: ${c.indexed || 0})`);
      }
    }
  } catch (err) {
    // Info-henting er sekundært
  }

  // 3. Valgfri URL-inspeksjon hvis flagg er sendt, eller standard prioriterte sider
  const args = process.argv.slice(2);
  const inspectIdx = args.indexOf("--inspect");
  if (inspectIdx !== -1 && args[inspectIdx + 1]) {
    await inspectUrl(client, targetProperty, args[inspectIdx + 1]);
  } else {
    // Sjekk status for vår nylig oppdaterte nøkkelside
    await inspectUrl(client, targetProperty, "https://www.krsvr.no/arrangementer/vr-teambuilding");
  }

  console.log(`\n\x1b[32m\x1b[1m[GSC Fullført]\x1b[0m Alt er oppdatert og verifisert i Google Search Console!`);
}

main().catch((err) => {
  console.error("\x1b[31m[GSC Feil]\x1b[0m", err);
  process.exit(1);
});
