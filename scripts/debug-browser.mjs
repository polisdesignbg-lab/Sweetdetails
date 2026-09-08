import { chromium } from "playwright";

const urls = [
  "https://sweetdetails.ink/",
  "https://sweetdetails.ink/shop",
  "https://sweetdetails.sweetdetails-bg.workers.dev/",
];

const browser = await chromium.launch({ headless: true });
for (const url of urls) {
  const page = await browser.newPage();
  const logs = [];
  const fails = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => logs.push(`[pageerror] ${err.message}\n${err.stack || ""}`));
  page.on("requestfailed", (req) => fails.push(`${req.failure()?.errorText || "fail"} ${req.url()}`));
  try {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(2500);
    const title = await page.title();
    const bodyText = await page.locator("body").innerText().catch(() => "");
    const hasError = bodyText.includes("couldn't load") || bodyText.includes("couldn’t load");
    const hasApp = (await page.locator(".static-fallback").count()) > 0;
    console.log("====", url);
    console.log("status", res?.status(), "title", title);
    console.log("hasError", hasError, "hasApp", hasApp);
    console.log("bodySnippet", bodyText.slice(0, 300).replace(/\n/g, " | "));
    console.log("logs:");
    for (const l of logs.slice(0, 40)) console.log(l);
    console.log("fails:");
    for (const f of fails.slice(0, 20)) console.log(f);
  } catch (e) {
    console.log("====", url, "GOTO_FAIL", e.message);
    for (const l of logs.slice(0, 40)) console.log(l);
  }
  await page.close();
}
await browser.close();
