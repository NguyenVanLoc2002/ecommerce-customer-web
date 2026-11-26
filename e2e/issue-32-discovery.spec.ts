import { expect, test, type Page } from '@playwright/test';

const product = (index: number, name: string) => ({
  id: `product-${index}`,
  slug: `product-${index}`,
  name,
  brandName: 'Maison Aure',
  thumbnailUrl: '/artifacts/stitch-review/images/photo-4.jpg',
  minPrice: 1290000,
  maxPrice: 1290000,
});

const categories = [
  { id: 'w', slug: 'womenswear', name: 'Nữ', imageUrl: '/artifacts/stitch-review/images/photo-1.jpg' },
  { id: 'child', parentId: 'w', slug: 'shirts', name: 'Áo sơ mi' },
  { id: 'm', slug: 'menswear', name: 'Nam', imageUrl: '/artifacts/stitch-review/images/photo-2.jpg' },
  { id: 'a', slug: 'accessories', name: 'Phụ kiện', imageUrl: '/artifacts/stitch-review/images/photo-3.jpg' },
];
const ok = (data: unknown) => ({ success: true, code: 'SUCCESS', data });
const items = [product(1, 'Áo blazer'), product(2, 'Quần dáng suông')];

const prepareCatalog = async (page: Page, shouldFail?: () => boolean, delay = 0) => {
  const queries: URLSearchParams[] = [];
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/categories')) return route.fulfill({ json: ok(categories) });
    if (url.pathname.endsWith('/brands')) return route.fulfill({ json: ok([{ id: 'brand', slug: 'maison', name: 'Maison Aure' }]) });
    if (!url.pathname.endsWith('/products')) {
      return route.fulfill({ status: 401, json: { success: false, code: 'UNAUTHORIZED' } });
    }

    queries.push(url.searchParams);
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    if (shouldFail?.()) return route.fulfill({ status: 503, json: { success: false, code: 'UNAVAILABLE' } });
    const pageNumber = Number(url.searchParams.get('page') ?? 0);
    const results = url.searchParams.get('keyword') === 'không có' ? [] : items;
    return route.fulfill({ json: ok({
      items: results,
      page: pageNumber,
      size: 20,
      totalItems: results.length ? 41 : 0,
      totalPages: results.length ? 3 : 0,
      hasPrevious: pageNumber > 0,
      hasNext: pageNumber < 2 && results.length > 0,
    }) });
  });
  return queries;
};

test('Home keeps a full-bleed hero and renders root categories without a count request per category', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const queries = await prepareCatalog(page);
  await page.goto('/');
  const hero = page.locator('main section').first();
  await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
  await expect.poll(async () => (await hero.boundingBox())?.width).toBe(390);
  const women = page.getByRole('link', { name: 'Khám phá danh mục Nữ' });
  const men = page.getByRole('link', { name: 'Khám phá danh mục Nam' });
  await expect(women).toBeVisible();
  await expect(men).toBeVisible();
  await expect(page.getByRole('link', { name: 'Khám phá danh mục Áo sơ mi' })).toHaveCount(0);
  expect((await men.boundingBox())?.x).toBe((await women.boundingBox())?.x);
  await expect.poll(() => queries.length).toBe(2);
  expect(queries.every((query) => !query.has('categoryId') && query.get('size') === '4')).toBe(true);
  await women.click();
  await expect(page).toHaveURL(/category=womenswear/);
  await expect.poll(() => queries.at(-1)?.get('categoryId')).toBe('w');
});

test('desktop preserves backend search order and applies price, sort, and page via the catalog URL', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const queries = await prepareCatalog(page);
  await page.goto('/products?category=womenswear&page=1');
  const results = page.getByRole('region', { name: 'Kết quả sản phẩm' });
  await expect(results.getByRole('heading')).toHaveText(['Áo blazer', 'Quần dáng suông']);
  expect(queries).toHaveLength(1);
  expect(queries[0].get('categoryId')).toBe('w');
  const searchForm = page.getByRole('search');
  await expect(searchForm.getByRole('button')).toHaveCount(0);
  const filterPanel = page.getByRole('complementary', { name: 'Bộ lọc sản phẩm' }).locator(':scope > div');
  const firstImage = results.locator('article img').first();
  const [filterBounds, imageBounds] = await Promise.all([filterPanel.boundingBox(), firstImage.boundingBox()]);
  expect(filterBounds).not.toBeNull();
  expect(imageBounds?.y).toBe(filterBounds?.y);

  const search = searchForm.getByRole('searchbox');
  await search.fill('  Áo Lụa  ');
  await search.press('Enter');
  await expect.poll(() => queries.at(-1)?.get('keyword')).toBe('Áo Lụa');
  expect(queries.at(-1)?.has('searchText')).toBe(false);
  expect(new URL(page.url()).searchParams.has('page')).toBe(false);
  await expect(results.getByRole('heading')).toHaveText(['Áo blazer', 'Quần dáng suông']);
  await page.getByRole('banner').getByRole('link', { name: 'Nữ', exact: true }).click();
  await expect(page).toHaveURL(/products\?category=womenswear$/);
  await expect(search).toHaveValue('');
  await search.fill('Áo Lụa');
  await expect(page.getByRole('button', { name: /Xóa bộ lọc Từ khóa/ })).toBeVisible();
  await page.getByRole('button', { name: /Xóa bộ lọc Từ khóa/ }).click();
  await expect(search).toHaveValue('');
  await expect.poll(() => queries.at(-1)?.has('keyword')).toBe(false);

  const filters = page.getByRole('complementary', { name: 'Bộ lọc sản phẩm' });
  await filters.getByLabel('Tối thiểu').fill('500000');
  await filters.getByLabel('Tối đa').fill('3000000');
  expect(queries.at(-1)?.has('minPrice')).toBe(false);
  await filters.getByRole('button', { name: 'Áp dụng' }).click();
  await expect.poll(() => queries.at(-1)?.get('minPrice')).toBe('500000');
  expect(queries.at(-1)?.get('maxPrice')).toBe('3000000');
  const sort = page.getByRole('combobox', { name: 'Sắp xếp:' });
  await sort.selectOption({ label: 'Tên A–Z' });
  await expect.poll(() => queries.at(-1)?.get('sort')).toBe('name,asc');
  await page.getByRole('button', { name: 'Trang 2', exact: true }).click();
  await expect(page).toHaveURL(/page=1/);
  await expect(page.getByRole('button', { name: 'Trang 2', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('mobile opens a keyboard-accessible drawer and uses compact pagination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const queries = await prepareCatalog(page);
  await page.goto('/products?category=womenswear');
  const trigger = page.getByRole('button', { name: /^Bộ lọc/ });
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Bộ lọc sản phẩm' });
  await expect(drawer).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await drawer.getByRole('checkbox', { name: 'Maison Aure' }).check();
  await expect.poll(() => queries.at(-1)?.get('brandId')).toBe('brand');
  await drawer.getByLabel('Tối đa').fill('3000000');
  await drawer.getByRole('button', { name: 'Xem sản phẩm' }).click();
  await expect(drawer).toBeHidden();
  await expect.poll(() => queries.at(-1)?.get('maxPrice')).toBe('3000000');
  await expect(page.getByRole('button', { name: 'Trang 2', exact: true })).toBeHidden();
  const pagination = page.getByRole('navigation', { name: 'Phân trang sản phẩm' });
  await expect(pagination.getByRole('button', { name: 'Trang trước' })).toBeDisabled();
  await pagination.getByRole('button', { name: 'Trang tiếp theo' }).click();
  await expect(pagination.getByText('Trang 2 / 3')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('catalog renders loading, retryable failure and a clearable empty state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let fail = true;
  await prepareCatalog(page, () => fail, 400);
  await page.goto('/products?q=không+có');
  await expect(page.getByRole('status', { name: 'Đang tải sản phẩm' })).toBeVisible();
  await expect(page.getByRole('alert').getByText('Không thể tải danh sách sản phẩm lúc này')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Thử lại' }).click();
  const results = page.getByRole('region', { name: 'Kết quả sản phẩm' });
  await expect(results.getByRole('heading', { name: 'Không tìm thấy sản phẩm phù hợp' })).toBeVisible();
  await results.getByRole('button', { name: 'Xóa bộ lọc' }).click();
  await expect(results.getByRole('heading', { name: 'Áo blazer' })).toBeVisible();
  expect(new URL(page.url()).searchParams.has('q')).toBe(false);
});
