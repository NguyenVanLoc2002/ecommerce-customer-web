import { chromium } from '@playwright/test';
const browser = await chromium.launch({headless:true});
const errors=[];
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});
 page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
 await page.goto(new URL('./index.html',import.meta.url).href);
 await page.getByRole('link',{name:/Khám phá sản phẩm/}).first().click();
 await page.getByRole('heading',{name:/Những món đồ bạn sẽ mặc mãi/}).waitFor();
 await page.locator('.product-card a').first().click();
 await page.getByRole('heading',{name:'Áo blazer dáng suông'}).waitFor();
 await page.locator('[data-color="Be cát"]').click();
 await page.locator('[data-size="L"]').click();
 await page.locator('[data-add]').first().click();
 await page.getByText('Đã thêm vào giỏ hàng.').waitFor();
 const bag=await page.locator('#bag-count').textContent();
 if(bag!=='(1)')errors.push(`${width}: bag ${bag}`);
 await page.locator('#scenario').selectOption('stock');
 await page.locator('[data-add]').first().click();
 await page.getByText(/Không đủ hàng cho số lượng/).first().waitFor();
 if(width===390){await page.goto(new URL('./index.html#/products',import.meta.url).href);await page.locator('#open-filter').click();if(!await page.locator('#filters.drawer').isVisible())errors.push('mobile filter drawer failed');}
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
 if(overflow)errors.push(`${width}: horizontal overflow`);
 console.log(`${width}px: navigation, variant, add, stock error${width===390?', drawer':''} checked`);
 await page.close();
}
await browser.close();
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
