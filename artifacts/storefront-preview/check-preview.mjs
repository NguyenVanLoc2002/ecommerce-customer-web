import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
await page.goto(new URL('./index.html', import.meta.url).href);
await page.waitForSelector('.product-card');
console.log('Desktop product cards:', await page.locator('.product-card').count());
await page.getByRole('button', { name: /View piece/ }).first().click();
await page.getByRole('button', { name: 'Espresso' }).click();
await page.getByRole('button', { name: 'M', exact: true }).click();
await page.locator('#addButton').click();
console.log('Bag count after adding one variant:', await page.locator('#bagCount').innerText());
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('#menuToggle').click();
console.log('Mobile menu opened:', await page.locator('#mobileMenu').evaluate((el) => el.classList.contains('open')));
await browser.close();
