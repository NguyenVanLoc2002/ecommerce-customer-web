/* Isolated review fixtures shaped like the public DTOs; never imported by src/. */
window.reviewFixtures = (() => {
  const names = ['Áo blazer dáng suông', 'Áo khoác trench dáng dài', 'Áo len cổ tròn', 'Quần dài xếp ly', 'Túi da tối giản', 'Bộ suit phom thoải mái'];
  const slugs = ['ao-blazer-dang-suong', 'ao-khoac-trench', 'ao-len-co-tron', 'quan-dai-xep-ly', 'tui-da-toi-gian', 'bo-suit'];
  const prices = [1290000, 2490000, 890000, 990000, 1590000, 2990000];
  const photos = [4, 5, 6, 7, 3, 2];
  const attribute = (code, value) => ({ attributeId: `attr-${code}`, attributeName: code === 'COLOR' ? 'Màu sắc' : 'Kích cỡ', attributeCode: code, valueId: `${code}-${value}`, value, displayValue: value });
  const details = names.map((name, i) => {
    const id = `product-${i + 1}`;
    const variants = [['Xám đá', 'S', 'ACTIVE'], ['Xám đá', 'M', 'ACTIVE'], ['Xám đá', 'L', 'INACTIVE'], ['Be cát', 'S', 'ACTIVE'], ['Be cát', 'L', 'ACTIVE']].map(([color, size, status], j) => ({
      id: `${id}-variant-${j}`, sku: `DEMO-${i + 1}-${j}`, variantName: `${color} / ${size}`, barcode: null,
      basePrice: prices[i], salePrice: null, compareAtPrice: null, weightGram: null, status,
      attributes: [attribute('COLOR', color), attribute('SIZE', size)],
    }));
    return { id, name, slug: slugs[i], shortDescription: 'Phom dáng thoải mái, dễ kết hợp cùng những món đồ yêu thích.', description: 'Thiết kế tối giản với đường nét gọn gàng, dành cho tủ đồ mỗi ngày. Nội dung và ảnh trong bản duyệt là minh họa; thông tin chất liệu và chăm sóc sẽ theo mô tả thực tế của sản phẩm.', status: 'ACTIVE', featured: i < 4,
      brand: { id: 'brand-maison', name: 'Maison Aure', slug: 'maison-aure' }, categories: [{id: i === 4 ? 'accessories' : i === 5 ? 'menswear' : 'womenswear', name: i === 4 ? 'Phụ kiện' : i === 5 ? 'Nam' : 'Nữ'}], variants,
      media: [{ id: `${id}-image`, mediaUrl: `images/photo-${photos[i]}.jpg`, mediaType: 'IMAGE', sortOrder: 0, primary: true, variantId: null }], createdAt: `2026-11-${10 + i}T00:00:00Z`, updatedAt: `2026-11-${20 - i}T00:00:00Z` };
  });
  const list = details.map(p => ({ id:p.id, name:p.name, slug:p.slug, shortDescription:p.shortDescription, thumbnailUrl:p.media[0].mediaUrl, minPrice:p.variants[0].basePrice, maxPrice:p.variants[0].basePrice, status:p.status, featured:p.featured, brandName:p.brand.name, categoryNames:p.categories.map(c=>c.name), createdAt:p.createdAt }));
  return { details, list };
})();
