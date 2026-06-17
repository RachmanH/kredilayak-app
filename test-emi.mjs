import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/home/mamen/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto("http://localhost:5174");
await page.waitForLoadState("networkidle");

// Test auto-calculation: salary=10000000, cicilan=3000000 → ratio should be 30%
await page.fill("#average_usable_salary", "10000000");
await page.fill("#average_eligible_emi", "3000000");
await page.waitForTimeout(300);

const ratio = await page.inputValue("#average_obligation_to_income_ratio");
console.log("Auto-calc ratio (gaji 10jt, cicilan 3jt):", ratio, "%");
console.log("Expected: 30.00%", ratio === "30.00" ? "✓" : "✗");

// Test another: salary=8000000, cicilan=5000000 → ratio should be 62.5%
await page.fill("#average_usable_salary", "8000000");
await page.fill("#average_eligible_emi", "5000000");
await page.waitForTimeout(300);

const ratio2 = await page.inputValue("#average_obligation_to_income_ratio");
console.log("\nAuto-calc ratio (gaji 8jt, cicilan 5jt):", ratio2, "%");
console.log("Expected: 62.50%", ratio2 === "62.50" ? "✓" : "✗");

// Check label text
const emiLabel = await page.locator('label[for="average_eligible_emi"]').textContent();
console.log("\nLabel average_eligible_emi:", emiLabel.trim());

const ratioLabel = await page.locator('label[for="average_obligation_to_income_ratio"]').textContent();
console.log("Label ratio:", ratioLabel.trim());

const emiHint = await page.locator("#average_eligible_emi").locator("..").locator(".form-field__hint").textContent();
console.log("Hint EMI:", emiHint.trim());

await page.screenshot({ path: "/tmp/spk-new-label.png", fullPage: false });

await browser.close();
console.log("\nDone!");
