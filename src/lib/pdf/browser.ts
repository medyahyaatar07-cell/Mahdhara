import type { Browser } from "puppeteer-core";

/**
 * Launches a headless Chromium instance suitable for both:
 * - local development (uses the Playwright-installed Chromium already
 *   present in this environment, or a system Chrome if available), and
 * - Vercel serverless functions (uses @sparticuz/chromium, a Chromium
 *   build packaged for AWS Lambda-style serverless runtimes).
 */
export async function launchBrowser(): Promise<Browser> {
  const puppeteer = await import("puppeteer-core");

  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
      defaultViewport: { width: 1240, height: 1754 },
    });
  }

  // Local dev: prefer an explicit override, then the Playwright Chromium
  // bundled in this sandbox, then fall back to letting puppeteer-core try
  // common system locations.
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ].filter(Boolean) as string[];

  const fs = await import("node:fs");
  const path = await import("node:path");

  function findPlaywrightChromium(): string | null {
    const base = "/opt/pw-browsers";
    try {
      if (!fs.existsSync(base)) return null;
      const dirs = fs.readdirSync(base).filter((d) => d.startsWith("chromium"));
      for (const dir of dirs) {
        const bin = path.join(base, dir, "chrome-linux", "chrome");
        if (fs.existsSync(bin)) return bin;
      }
    } catch {
      // ignore
    }
    return null;
  }

  const playwrightChromium = findPlaywrightChromium();
  const executablePath =
    candidates.find((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    }) ||
    playwrightChromium ||
    undefined;

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1240, height: 1754 },
  });
}
