import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch({ headless: true });
const failures = [];
const errors = [];
const revealImages = async (page) => {
  await page.evaluate(async () => {
    const step = Math.max(400, window.innerHeight - 100);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 120));
    }
    document.querySelectorAll('img[loading="lazy"]').forEach((image) => image.setAttribute('loading', 'eager'));
    await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => undefined)));
    window.scrollTo(0, 0);
  });
};

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900, deviceScaleFactor: 2 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2 },
]) {
  const page = await browser.newPage({ deviceScaleFactor: viewport.deviceScaleFactor, viewport: { width: viewport.width, height: viewport.height } });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  page.on('pageerror', (error) => errors.push(`${viewport.name}: ${error.message}`));

  const prototypeUrl = pathToFileURL(resolve('artifacts/stitch-review/index.html')).href;
  await page.goto(prototypeUrl, { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: '.review-bar{display:none!important}' });
  await page.screenshot({ path: `artifacts/issue-32/screenshots/design-home-${viewport.name}.jpg`, type: 'jpeg', quality: 85, fullPage: true });
  await page.goto(`${prototypeUrl}#/products`, { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: '.review-bar{display:none!important}' });
  await page.screenshot({ path: `artifacts/issue-32/screenshots/design-products-${viewport.name}.jpg`, type: 'jpeg', quality: 85, fullPage: true });
  if (viewport.name === 'mobile') {
    await page.getByRole('button', { name: /Bộ lọc/ }).click();
    await page.screenshot({ path: 'artifacts/issue-32/screenshots/design-products-mobile-filter-open.jpg', type: 'jpeg', quality: 85, fullPage: true });
  }

  await page.goto('http://127.0.0.1:4176/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.locator('a[href^="/products/"]').first().waitFor();
  if (await page.getByRole('heading', { level: 1 }).count() !== 1) failures.push(`${viewport.name}: homepage must have one h1`);
  const overflow = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    elements: Array.from(document.querySelectorAll('body *')).filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > innerWidth + 2;
    }).slice(0, 6).map((element) => ({ tag: element.tagName, className: String(element.className), right: Math.round(element.getBoundingClientRect().right) })),
  }));
  if (overflow.width > viewport.width + 2) failures.push(`${viewport.name}: homepage horizontal overflow ${JSON.stringify(overflow)}`);
  await revealImages(page);
  await page.screenshot({ path: `artifacts/issue-32/screenshots/home-${viewport.name}.jpg`, type: 'jpeg', quality: 85, fullPage: true });

  await page.goto('http://127.0.0.1:4176/products', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.locator('a[href^="/products/"]').first().waitFor();
  if (await page.getByRole('heading', { level: 1 }).count() !== 1) failures.push(`${viewport.name}: product listing must have one h1`);

  const search = page.getByRole('searchbox').first();
  await search.fill('  blazer  ');
  await page.waitForURL(/q=blazer/);
  if (new URL(page.url()).searchParams.get('q') !== 'blazer') failures.push(`${viewport.name}: keyword was not trimmed into the URL`);
  if (new URL(page.url()).searchParams.has('searchText')) failures.push(`${viewport.name}: unsupported searchText parameter was added`);
  await search.fill('');
  await page.waitForFunction(() => !new URL(location.href).searchParams.has('q'));
  await page.waitForFunction(() => document.querySelectorAll('a[href^="/products/"]').length >= 6);
  await page.waitForTimeout(350);
  await search.blur();
  await revealImages(page);
  await page.screenshot({ path: `artifacts/issue-32/screenshots/products-${viewport.name}.jpg`, type: 'jpeg', quality: 85, fullPage: true });

  if (viewport.name === 'mobile') {
    await page.getByRole('button', { name: /Bộ lọc/ }).click();
    await page.getByRole('dialog').waitFor();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)) failures.push('mobile: filter drawer horizontal overflow');
    await page.screenshot({ path: 'artifacts/issue-32/screenshots/products-mobile-filter-open.jpg', type: 'jpeg', quality: 85, fullPage: true });
  }

  await page.close();
}

await browser.close();
if (errors.length) failures.push(...errors);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Playwright smoke passed: Home/Products visual captures, one h1 per page, no overflow at 1280/390 CSS px, keyword trims to q, mobile filter drawer opens.');
}
