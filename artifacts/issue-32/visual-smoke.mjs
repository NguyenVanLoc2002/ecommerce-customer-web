import { existsSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch({ headless: true });
const failures = [];
const errors = [];
const root = resolve('artifacts/issue-32');
const referenceFor = (route, viewport) => {
  if (route === '/') {
    return viewport.name === 'desktop'
      ? pathToFileURL(resolve('artifacts/stitch-review/stitch-home-original.html')).href
      : pathToFileURL(resolve(root, 'screenshots/stitch-home-mobile.html')).href;
  }

  return pathToFileURL(resolve(root, `screenshots/stitch-products-${viewport.name}.html`)).href;
};

const revealImages = async (page) => {
  await page.evaluate(async () => {
    const step = Math.max(400, window.innerHeight - 100);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
    document.querySelectorAll('img[loading="lazy"]').forEach((image) => image.setAttribute('loading', 'eager'));
    await Promise.all(Array.from(document.images, (image) => image.decode().catch(() => undefined)));
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
};

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900, deviceScaleFactor: 2 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2 },
]) {
  const page = await browser.newPage({
    deviceScaleFactor: viewport.deviceScaleFactor,
    viewport: { width: viewport.width, height: viewport.height },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  page.on('pageerror', (error) => errors.push(`${viewport.name}: ${error.message}`));

  for (const route of ['/', '/products']) {
    const referenceUrl = referenceFor(route, viewport);
    const referencePath = route === '/'
      ? viewport.name === 'desktop'
        ? resolve('artifacts/stitch-review/stitch-home-original.html')
        : resolve(root, 'screenshots/stitch-home-mobile.html')
      : resolve(root, `screenshots/stitch-products-${viewport.name}.html`);
    if (existsSync(referencePath)) {
      await page.goto(referenceUrl, { waitUntil: 'domcontentloaded' });
      await revealImages(page);
      await page.screenshot({
        path: `${root}/screenshots/design-${route === '/' ? 'home' : 'products'}-${viewport.name}.jpg`,
        type: 'jpeg',
        quality: 90,
        fullPage: true,
      });
    }

    const implementationUrl = route === '/'
      ? 'http://127.0.0.1:4176/'
      : 'http://127.0.0.1:4176/products?category=womenswear';
    await page.goto(implementationUrl, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { level: 1 }).waitFor();
    if (await page.getByRole('heading', { level: 1 }).count() !== 1) failures.push(`${viewport.name} ${route}: page must have one h1`);

    if (route === '/') {
      const heroBounds = await page.locator('main section').first().evaluate((section) => {
        const { left, width } = section.getBoundingClientRect();
        return { left, width };
      });
      if (heroBounds.left !== 0 || heroBounds.width !== viewport.width) {
        failures.push(`${viewport.name} Home hero must reach both viewport edges: ${JSON.stringify(heroBounds)}`);
      }

      const sectionPadding = await page.locator('main section').evaluateAll((sections) =>
        sections.slice(1, 5).map((section) => ({
          top: Number.parseFloat(getComputedStyle(section).paddingTop),
          bottom: Number.parseFloat(getComputedStyle(section).paddingBottom),
        })),
      );
      const maxPadding = viewport.width >= 768 ? 48 : 32;
      if (sectionPadding.some(({ top, bottom }) => top > maxPadding || bottom > maxPadding)) {
        failures.push(`${viewport.name} Home sections have excessive vertical padding: ${JSON.stringify(sectionPadding)}`);
      }
    }

    const overflow = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      elements: Array.from(document.querySelectorAll('body *')).filter((element) => element.getBoundingClientRect().right > innerWidth + 2)
        .slice(0, 5).map((element) => ({ tag: element.tagName, className: String(element.className) })),
    }));
    if (overflow.width > viewport.width + 2) failures.push(`${viewport.name} ${route}: horizontal overflow ${JSON.stringify(overflow)}`);

    if (route === '/') {
      await page.getByText('Góc nhìn sáng tạo').waitFor();
      await page.locator('img[alt^="Người mẫu phối áo khoác"]').waitFor();
      await page.locator('a[href^="/products/"]').first().waitFor();
    } else {
      await revealImages(page);
      await page.screenshot({
        path: `${root}/screenshots/products-${viewport.name}.jpg`,
        type: 'jpeg',
        quality: 90,
        fullPage: true,
      });
      const search = page.getByRole('searchbox').first();
      await search.fill('  blazer  ');
      await page.waitForURL(/q=blazer/);
      if (new URL(page.url()).searchParams.get('q') !== 'blazer') failures.push(`${viewport.name}: keyword was not trimmed into q`);
      if (new URL(page.url()).searchParams.has('searchText')) failures.push(`${viewport.name}: unsupported searchText parameter was added`);
      await search.fill('');
      await page.waitForFunction(() => !new URL(location.href).searchParams.has('q'));
      await page.waitForFunction(() => document.querySelectorAll('a[href^="/products/"]').length >= 1);
      await page.getByRole('searchbox').first().blur();
      if (viewport.name === 'mobile') {
        await page.getByRole('button', { name: /Bộ lọc/ }).click();
        await page.getByRole('dialog').waitFor();
        await page.screenshot({
          path: `${root}/screenshots/products-mobile-filter-open.jpg`,
          type: 'jpeg',
          quality: 90,
          fullPage: true,
        });
      }
    }

    if (route === '/') {
      await revealImages(page);
      await page.screenshot({
        path: `${root}/screenshots/home-${viewport.name}.jpg`,
        type: 'jpeg',
        quality: 90,
        fullPage: true,
      });

      if (viewport.name === 'desktop') {
        await page.setViewportSize({ width: 1600, height: 900 });
        await page.goto('http://127.0.0.1:4176/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('heading', { level: 1 }).waitFor();
        const heroBounds = await page.locator('main section').first().evaluate((section) => {
          const { left, width } = section.getBoundingClientRect();
          return { left, width };
        });
        if (heroBounds.left !== 0 || heroBounds.width !== 1600) {
          failures.push(`desktop-wide Home hero must reach both viewport edges: ${JSON.stringify(heroBounds)}`);
        }
        await revealImages(page);
        await page.screenshot({
          path: `${root}/screenshots/home-desktop-wide.jpg`,
          type: 'jpeg',
          quality: 90,
          fullPage: true,
        });
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('http://127.0.0.1:4176/', { waitUntil: 'domcontentloaded' });
        await page.getByRole('heading', { level: 1 }).waitFor();
      }
    }
  }

  await page.close();
}

await browser.close();
if (errors.length) failures.push(...errors);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Visual smoke passed: Home hero reaches the viewport edges at 1280/390/1600px, Home section spacing is compact at desktop/mobile widths, Home/PLP captures, editorial section, one h1, no overflow, q keyword behavior, and mobile filter drawer.');
}
