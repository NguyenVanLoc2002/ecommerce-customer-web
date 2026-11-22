import { chromium } from '@playwright/test';
const paths=['/cart','/checkout/address','/checkout/payment','/checkout/voucher','/checkout/review','/checkout/confirmation','/payment/result','/payment/momo/return','/payment/paypal/return','/payment/paypal/cancel','/orders','/orders/demo-order','/orders/demo-order/tracking','/orders/demo-order/review','/orders/demo-order/invoice','/profile','/profile/security','/profile/addresses','/profile/addresses/new','/profile/addresses/demo-address/edit','/profile/reviews','/notifications','/login','/register','/forgot-password','/verify-otp','/reset-password','/404'];
const browser=await chromium.launch({headless:true});let failed=0;
for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>{console.error(width,e.message);failed++});
 await page.goto(new URL('./journeys.html',import.meta.url).href);
 for(const path of paths){await page.evaluate(p=>location.hash=p,path);await page.locator('h1').waitFor();const result=await page.evaluate(()=>({title:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+2}));if(!result.title||result.overflow){console.error(width,path,result);failed++;}}
 await page.close();console.log(`${width}px: ${paths.length} route previews checked`);
}
await browser.close();if(failed)process.exitCode=1;
