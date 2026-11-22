/* Independent review prototype. No API calls, auth tokens or application imports. */
(() => {
  const { details, list } = window.reviewFixtures;
  const main = document.querySelector('#main');
  const scenario = document.querySelector('#scenario');
  const session = document.querySelector('#signed-in');
  const cart = [];
  let color = 'Xám đá', size = 'M', quantity = 1, pending = false, currentSlug = '', addMessage = '', messageKind = '';
  let toastTimer;
  const money = n => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(n);
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const route = () => { const [path, query] = (location.hash.slice(1) || '/').split('?'); return { path, params:new URLSearchParams(query) }; };
  const img = (src, alt, cls = '') => `<img src="${src}" alt="${escape(alt)}" width="896" height="1200" class="${cls}">`;
  const notify = message => { clearTimeout(toastTimer); document.querySelector('#feedback').textContent = message; toastTimer = setTimeout(() => { document.querySelector('#feedback').textContent = ''; }, 5000); };
  const card = p => `<article class="product-card"><a href="#/products/${p.slug}">${img(p.thumbnailUrl,p.name)}<p class="brand">${p.brandName}</p><h3>${p.name}</h3><p class="price">${p.minPrice === p.maxPrice ? '' : 'Từ '}${money(p.minPrice)}</p></a></article>`;
  const grid = products => `<div class="product-grid">${products.map(card).join('')}</div>`;
  const crumb = title => `<nav class="crumb" aria-label="Đường dẫn"><a href="#/">Trang chủ</a><span>/</span><a href="#/products">Sản phẩm</a>${title ? `<span>/</span><span>${escape(title)}</span>` : ''}</nav>`;
  const skeleton = () => `<div class="product-grid" aria-label="Đang tải sản phẩm" aria-busy="true">${[1,2,3,4].map(() => '<div><div class="skeleton photo"></div><div class="skeleton line"></div><div class="skeleton line"></div></div>').join('')}</div>`;
  function stateView(kind, detail = false) {
    if (kind === 'loading') return skeleton();
    if (kind === 'error') return '<div class="empty" role="alert"><h2>Chưa tải được sản phẩm</h2><p>Vui lòng thử lại sau một chút.</p><button class="btn" data-retry>Thử lại</button></div>';
    return `<div class="empty"><h2>${detail ? 'Không tìm thấy sản phẩm' : 'Chưa tìm thấy sản phẩm phù hợp'}</h2><p>${detail ? 'Sản phẩm này hiện không có trong danh mục.' : 'Thử thay đổi từ khóa hoặc bỏ bớt bộ lọc.'}</p><a class="btn" href="#/products" data-reset>Xem tất cả sản phẩm</a></div>`;
  }
  function home() {
    return `<section class="hero">${img('images/photo-0.jpg','Người mẫu mặc áo khoác trung tính, ảnh lookbook minh họa','hero-photo')}<div class="hero-copy"><p class="eyebrow">Tủ đồ mỗi ngày</p><h1>Ít hơn,<br>nhưng đúng hơn.</h1><p>Những phom dáng giản dị, dễ kết hợp. Tìm một món đồ để bạn luôn muốn mặc lại.</p><a class="btn" href="#/products">Khám phá sản phẩm <span aria-hidden="true">↗</span></a></div></section>
    <div class="wrap">${['loading','error','empty'].includes(scenario.value) ? `<section class="section">${stateView(scenario.value)}</section>` : `<section class="section"><div class="section-top"><h2>Tìm theo phong cách của bạn</h2></div><div class="category-grid">${[['Nữ',1],['Nam',2],['Phụ kiện',3]].map(([name,photo]) => `<a href="#/products?category=${encodeURIComponent(name)}">${img(`images/photo-${photo}.jpg`,`${name}, ảnh danh mục minh họa`)}<span>${name}<span aria-hidden="true">↗</span></span></a>`).join('')}</div></section><section class="section"><div class="section-top"><h2>Những lựa chọn nổi bật</h2><a class="underlink" href="#/products">Xem tất cả ↗</a></div>${grid(list.slice(0,4))}</section>`}
    <section class="editorial">${img('images/photo-8.jpg','Phối đồ nhiều lớp, ảnh editorial minh họa')}<div><p class="eyebrow">Gợi ý phối đồ</p><h2>Những lớp mặc<br>nhẹ nhàng.</h2><p class="muted">Một chút tương phản, một chút mềm mại. Khám phá những cách kết hợp mới từ các món đồ quen thuộc.</p><a class="underlink" href="#/products?category=Nữ">Khám phá trang phục nữ ↗</a></div></section></div>`;
  }
  function filters(params) {
    const options = (key, values) => `<select name="${key}"><option value="">Tất cả</option>${values.map(v => `<option ${params.get(key)===v?'selected':''} value="${escape(v)}">${v}</option>`).join('')}</select>`;
    return `<form class="filters" id="filters" aria-label="Bộ lọc sản phẩm"><div class="dialog-top filter-mobile"><h2>Bộ lọc</h2><button type="button" class="icon" id="close-filter" aria-label="Đóng bộ lọc">×</button></div><fieldset><legend>Danh mục</legend><label>Chọn danh mục${options('category',['Nữ','Nam','Phụ kiện'])}</label></fieldset><fieldset><legend>Thương hiệu</legend><label>Chọn thương hiệu${options('brand',['Maison Aure','Atelier Selene','North Meridian'])}</label></fieldset><fieldset><legend>Khoảng giá (₫)</legend><label>Giá từ<input name="minPrice" inputmode="numeric" type="number" min="0" value="${escape(params.get('minPrice')||'')}" placeholder="0"></label><label>Đến<input name="maxPrice" inputmode="numeric" type="number" min="0" value="${escape(params.get('maxPrice')||'')}" placeholder="Không giới hạn"></label></fieldset><button class="btn wide">Áp dụng bộ lọc</button><button type="button" class="text-button" data-clear>Xóa bộ lọc</button></form>`;
  }
  function catalog(params) {
    let products = [...list];
    const q = params.get('q') || '';
    // Fixture-only filtering; real keyword ordering remains entirely backend-owned.
    if(q) products = products.filter(p => p.name.includes(q));
    if(params.get('category')) products = products.filter(p=>p.categoryNames.includes(params.get('category')));
    if(params.get('brand')) products = products.filter(p=>p.brandName === params.get('brand'));
    if(params.get('minPrice')) products = products.filter(p=>p.maxPrice >= Number(params.get('minPrice')));
    if(params.get('maxPrice')) products = products.filter(p=>p.minPrice <= Number(params.get('maxPrice')));
    if(!q) {
      if(params.get('sort')==='name') products.sort((a,b)=>a.name.localeCompare(b.name,'vi'));
      if(params.get('sort')==='createdAt') products.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
      if(params.get('sort')==='updatedAt') products.sort((a,b)=>details.find(p=>p.id===b.id).updatedAt.localeCompare(details.find(p=>p.id===a.id).updatedAt));
      if(!params.get('sort') || params.get('sort')==='featured') products.sort((a,b)=>Number(b.featured)-Number(a.featured));
    }
    const active = [...params].filter(([k])=>!['sort','page'].includes(k));
    const pageSize=3, pageCount=Math.max(1,Math.ceil(products.length/pageSize)), page=Math.min(Number(params.get('page')||0),pageCount-1);
    let content = products.length ? grid(products.slice(page*pageSize,(page+1)*pageSize)) : stateView('empty');
    if(['loading','error','empty'].includes(scenario.value)) content=stateView(scenario.value);
    return `<div class="wrap">${crumb()}<section class="page-heading"><p class="eyebrow">Danh mục sản phẩm</p><h1>Những món đồ bạn sẽ mặc mãi.</h1><form id="search-form" class="search-form"><label class="sr-only" for="keyword" hidden>Tìm sản phẩm</label><input id="keyword" name="q" aria-label="Tìm sản phẩm" value="${escape(q)}" placeholder="Tìm theo tên sản phẩm"><button class="btn" aria-label="Tìm kiếm">Tìm</button></form></section><div class="catalog">${filters(params)}<section aria-label="Kết quả sản phẩm"><div class="toolbar"><span class="count">${products.length} sản phẩm</span><button class="btn secondary filter-mobile" id="open-filter">Bộ lọc (${active.length})</button><label>Sắp xếp <select id="sort" ${q?'disabled':''}>${[['featured','Nổi bật'],['createdAt','Mới nhất'],['updatedAt','Vừa cập nhật'],['name','Tên A–Z']].map(([v,n])=>`<option value="${v}" ${params.get('sort')===v?'selected':''}>${n}</option>`).join('')}</select></label></div>${q?'<p class="small muted">Kết quả theo mức độ phù hợp của từ khóa. Bản mẫu chỉ tìm trong dữ liệu minh họa.</p>':''}<div class="chips">${active.map(([k,v])=>`<button class="chip" data-remove="${k}" aria-label="Bỏ lọc ${escape(v)}">${escape(v)} ×</button>`).join('')}${active.length?'<button class="text-button small" data-clear>Xóa tất cả</button>':''}</div>${content}${products.length && scenario.value==='normal'?`<nav class="pager" aria-label="Phân trang"><button data-page="${page-1}" ${page<=0?'disabled':''} aria-label="Trang trước">←</button><span>Trang ${page+1} / ${pageCount}</span><button data-page="${page+1}" ${page+1>=pageCount?'disabled':''} aria-label="Trang sau">→</button></nav>`:''}</section></div></div>`;
  }
  const attr = (v, code) => v.attributes.find(a=>a.attributeCode===code)?.displayValue;
  const selected = p => p.variants.find(v=>attr(v,'COLOR')===color && attr(v,'SIZE')===size && v.status==='ACTIVE');
  function product(slug) {
    const p=details.find(x=>x.slug===slug);
    if(!p || ['loading','error','empty'].includes(scenario.value)) return `<div class="wrap">${crumb()}<h1>Chi tiết sản phẩm</h1>${stateView(p?scenario.value:'empty',true)}</div>`;
    const variant=selected(p), price=variant ? variant.salePrice ?? variant.basePrice : p.variants[0].basePrice;
    const media=p.media.find(m=>m.mediaType==='IMAGE' && m.variantId===variant?.id) ?? p.media.find(m=>m.mediaType==='IMAGE' && !m.variantId);
    const label=pending?'Đang thêm…':!variant?'Chọn kích cỡ':session.checked?'Thêm vào giỏ hàng':'Đăng nhập để thêm vào giỏ';
    return `<div class="wrap">${crumb(p.name)}<div class="pdp"><section aria-label="Ảnh sản phẩm">${img(media.mediaUrl,p.name,'pdp-photo')}<div class="thumbs"><button class="selected" aria-label="Ảnh sản phẩm 1">${img(media.mediaUrl,p.name)}</button></div></section><section class="purchase"><p class="brand">${p.brand.name}</p><h1>${p.name}</h1><p class="amount">${variant?'':'Từ '}${money(price)}</p><p class="muted">${p.shortDescription}</p><fieldset><legend>Màu sắc: <b>${color}</b></legend><div class="choices">${['Xám đá','Be cát'].map(c=>`<button class="choice" data-color="${c}" aria-pressed="${color===c}">${c}</button>`).join('')}</div></fieldset><fieldset><legend>Kích cỡ${size?`: ${size}`:''}</legend><div class="choices">${['S','M','L','XL'].map(s=>{const v=p.variants.find(x=>attr(x,'COLOR')===color&&attr(x,'SIZE')===s);const disabled=!v||v.status!=='ACTIVE';return `<button class="choice" data-size="${s}" aria-pressed="${size===s}" ${disabled?'disabled':''} title="${!v?'Không có lựa chọn này':v.status!=='ACTIVE'?'Tạm ngừng bán':s}">${s}${disabled?' ×':''}</button>`;}).join('')}</div><p class="option-hint">${color==='Xám đá'?'L: tạm ngừng bán. XL: không có lựa chọn này.':'M, XL: không có lựa chọn này.'}</p>${!size?'<p class="option-hint">Vui lòng chọn kích cỡ cho màu vừa chọn.</p>':''}</fieldset><label for="quantity">Số lượng</label><div class="quantity"><button data-qty="-1" aria-label="Giảm số lượng" ${quantity===1||pending?'disabled':''}>−</button><output id="quantity">${quantity}</output><button data-qty="1" aria-label="Tăng số lượng" ${pending?'disabled':''}>+</button></div><button class="btn wide" data-add ${pending||!variant?'disabled':''}>${label}</button>${addMessage?`<p class="notice ${messageKind}" role="${messageKind==='error'?'alert':'status'}">${addMessage}</p>`:''}<details open><summary>Mô tả sản phẩm</summary><p>${p.description}</p></details><details><summary>Đánh giá sản phẩm</summary><p>${session.checked?'Đánh giá chưa được tải trong bản mẫu.':'Đăng nhập để xem đánh giá sản phẩm.'}</p></details></section></div><section class="section"><div class="section-top"><h2>Có thể bạn cũng thích</h2></div>${grid(list.filter(x=>x.id!==p.id).slice(0,4))}</section></div><div class="mobile-buy"><div><div class="sticky-price">${money(price)}</div><div class="small muted">${color} / ${size||'Chọn cỡ'}</div></div><button class="btn" data-add ${pending||!variant?'disabled':''}>${label}</button></div>`;
  }
  function designSystem() {
    const colors=[['Canvas','#FAF9F6'],['Surface','#FFFFFF'],['Ink','#22221F'],['Secondary','#625E57'],['Border','#E4E0D8'],['Olive','#4B563D']];
    return `<div class="wrap sheet"><p class="eyebrow">Fashion Shop / Bản duyệt 01</p><h1>Hệ thống thiết kế</h1><p class="muted">Một ngôn ngữ chung cho khám phá, chọn sản phẩm và những bước mua hàng tiếp theo.</p><section><h2>01 · Màu sắc</h2><div class="swatches">${colors.map(([n,c])=>`<div><div class="swatch" style="background:${c}"></div><b>${n}</b><div class="small">${c}</div></div>`).join('')}</div></section><section><h2>02 · Be Vietnam Pro</h2><p style="font-size:36px;line-height:1.25">Áo khoác dáng dài,<br>nhẹ nhàng mỗi ngày.</p><p>Áo blazer dáng suông với đường cắt tối giản, dành cho những ngày chuyển mùa.</p><p style="font-weight:400">400 Regular · Nội dung dễ đọc</p><p style="font-weight:500">500 Medium · 1.290.000 ₫</p><p style="font-weight:600">600 Semibold · Thêm vào giỏ hàng</p><p style="font-weight:700">700 Bold · Những lựa chọn nổi bật</p><p class="small muted">Desktop 64 / 40 / 28 / 16 / 14px. Mobile 36 / 28 / 16 / 14px. Giá cùng font, tên dài xuống dòng.</p></section><section><h2>03 · Khoảng cách và đường nét</h2><div class="spacing-demo">${[4,8,12,16,24,32,48,64,96].map(n=>`<div><i style="height:${n}px"></i><small>${n}</small></div>`).join('')}</div><p class="muted">Gutter 48px desktop, 20px mobile. Bo góc 2px control, 4px ảnh. Divider 1px. Không đổ bóng trang trí.</p></section><section><h2>04 · Nút và ô nhập</h2><div class="spec-buttons"><button class="btn">Thêm vào giỏ</button><button class="btn secondary">Xem sản phẩm</button><button class="btn focus-demo">Focus bàn phím</button><button class="btn" disabled>Chưa chọn kích cỡ</button><button class="btn" disabled>Đang thêm…</button></div><div class="spec-grid" style="margin-top:32px"><div><label for="ds-default">Tìm sản phẩm</label><input id="ds-default" placeholder="Áo khoác"><p class="spec-label">Mặc định</p></div><div><label for="ds-focus">Tìm sản phẩm</label><input id="ds-focus" class="focus-demo" value="Áo khoác"><p class="spec-label">Focus 2px olive, offset 3px</p></div><div><label for="ds-error">Giá từ</label><input id="ds-error" class="input-error" value="-100" aria-invalid="true" aria-describedby="ds-error-text"><p id="ds-error-text" class="error-copy">Nhập giá lớn hơn hoặc bằng 0.</p></div></div></section><section><h2>05 · Card, bộ lọc, biến thể</h2><div class="spec-grid"><div>${card(list[0])}<p class="spec-label">Ảnh 3:4; không suy biến thể hoặc stock từ list.</p></div><div><h3>Bộ lọc</h3><button class="chip">Nữ ×</button> <button class="text-button">Xóa tất cả</button><label for="ds-sort">Sắp xếp</label><select id="ds-sort"><option>Nổi bật</option><option>Mới nhất</option><option>Vừa cập nhật</option><option>Tên A–Z</option></select><p class="muted small">Danh mục · thương hiệu · khoảng giá · từ khóa. Mobile dùng drawer có đóng, áp dụng, xóa.</p></div><div><h3>Chọn kích cỡ</h3><div class="choices"><button class="choice">S</button><button class="choice" aria-pressed="true">M</button><button class="choice" disabled>L ×</button><button class="choice" disabled>XL ×</button></div><p class="small muted">S: mặc định. M: đã chọn. L: INACTIVE/tạm ngừng bán. XL: tổ hợp không tồn tại. Hai trạng thái sau không phải hết hàng.</p></div></div></section><section><h2>06 · Phản hồi và trạng thái</h2><div class="spec-grid"><div class="state-card"><h3>Đang tải</h3><div class="skeleton photo"></div><div class="skeleton line"></div></div><div class="state-card"><h3>Không có kết quả</h3><p>Thử từ khóa khác hoặc bỏ bớt bộ lọc.</p><a class="btn secondary" href="#/products">Xóa bộ lọc</a></div><div class="state-card"><h3>Chưa tải được sản phẩm</h3><p>Vui lòng thử lại sau một chút.</p><button class="btn" data-retry>Thử lại</button></div></div><div class="spec-grid" style="margin-top:32px"><p class="notice success">Đã thêm vào giỏ hàng.</p><p class="notice error">Không đủ hàng cho số lượng đã chọn. Giảm số lượng hoặc chọn biến thể khác.</p><div><button class="btn secondary">Đăng nhập để thêm vào giỏ</button><p class="small muted">Phiên khách, giữ đường dẫn quay lại PDP.</p></div></div><p class="small muted">Public PDP không có stock. Mẫu lỗi thiếu hàng chỉ áp dụng sau phản hồi server. Toolbar trên cùng giúp thử states của cả ba trang. Mọi dữ liệu hiện là giả lập.</p></section><section><h2>07 · Responsive và truy cập</h2><p>Header thu gọn trên mobile; bộ lọc chuyển drawer; grid 2 cột; ảnh → tên/giá → biến thể → CTA. Sticky CTA chừa khoảng trống bên dưới. Focus luôn thấy, target ≥44px, thông báo dùng live region, giảm chuyển động theo thiết bị.</p><a class="underlink" href="DESIGN-BRIEF-v2.md">Đọc brief và phụ thuộc dữ liệu</a></section></div>`;
  }
  function render() {
    const {path,params}=route();
    const isDetail=path.startsWith('/products/');
    document.body.classList.toggle('has-pdp',isDetail);
    if(isDetail && currentSlug!==path){currentSlug=path;color='Xám đá';size='M';quantity=1;addMessage='';}
    main.innerHTML=path==='/design-system'?designSystem():isDetail?product(path.split('/')[2]):path==='/products'?catalog(params):home();
    document.title=`${path==='/design-system'?'Design system':isDetail?'Chi tiết sản phẩm':path==='/products'?'Sản phẩm':'Trang chủ'} · Fashion Shop · Bản duyệt`;
    document.querySelector('#bag-count').textContent=`(${cart.reduce((sum,x)=>sum+x.quantity,0)})`;
    bind();
  }
  function queryUpdate(changes) {const {params}=route();Object.entries(changes).forEach(([k,v])=>v?params.set(k,v):params.delete(k));if(!('page' in changes))params.delete('page');location.hash='/products'+(params.size?'?'+params.toString():'');}
  function closeFilter(){const f=document.querySelector('#filters');if(f){f.classList.remove('drawer');f.removeAttribute('role');f.removeAttribute('aria-modal');}document.querySelector('#open-filter')?.focus();}
  function bind(){
    main.querySelectorAll('[data-retry]').forEach(b=>b.onclick=()=>{scenario.value='normal';render();});
    main.querySelectorAll('[data-reset],[data-clear]').forEach(b=>b.onclick=()=>{scenario.value='normal';location.hash='/products';render();});
    main.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>queryUpdate({[b.dataset.remove]:''}));
    main.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>queryUpdate({page:b.dataset.page}));
    const f=document.querySelector('#filters');if(f)f.onsubmit=e=>{e.preventDefault();queryUpdate(Object.fromEntries(new FormData(f)));closeFilter();};
    const search=document.querySelector('#search-form');if(search)search.onsubmit=e=>{e.preventDefault();queryUpdate({q:new FormData(search).get('q').trim()});};
    const sort=document.querySelector('#sort');if(sort)sort.onchange=()=>queryUpdate({sort:sort.value});
    const open=document.querySelector('#open-filter');if(open)open.onclick=()=>{f.classList.add('drawer');f.setAttribute('role','dialog');f.setAttribute('aria-modal','true');document.querySelector('#close-filter').focus();};
    const close=document.querySelector('#close-filter');if(close)close.onclick=closeFilter;
    main.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color;const p=details.find(x=>x.slug===route().path.split('/')[2]);if(!selected(p))size='';addMessage='';render();main.querySelector(`[data-color="${color}"]`).focus();});
    main.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{size=b.dataset.size;addMessage='';render();main.querySelector(`[data-size="${size}"]`).focus();});
    main.querySelectorAll('[data-qty]').forEach(b=>b.onclick=()=>{quantity=Math.max(1,quantity+Number(b.dataset.qty));addMessage='';render();});
    main.querySelectorAll('[data-add]').forEach(b=>b.onclick=add);
  }
  async function add(){
    if(pending)return;
    const p=details.find(x=>x.slug===route().path.split('/')[2]), variant=p&&selected(p);
    if(!variant)return;
    if(!session.checked){addMessage='Cần đăng nhập để thêm vào giỏ. Trong bản mẫu, bật “Đã đăng nhập” trên thanh duyệt để thử tiếp.';messageKind='';render();return;}
    const qty=quantity, simulatedFailure=scenario.value==='stock';
    pending=true;addMessage='';render();
    await new Promise(resolve=>setTimeout(resolve,650));
    pending=false;
    if(simulatedFailure){addMessage='Không đủ hàng cho số lượng đã chọn. Giảm số lượng hoặc chọn biến thể khác.';messageKind='error';}
    else {const row=cart.find(x=>x.variantId===variant.id);if(row)row.quantity+=qty;else cart.push({variantId:variant.id,quantity:qty,productId:p.id});addMessage='Đã thêm vào giỏ hàng.';messageKind='success';notify(`${p.name} · ${attr(variant,'COLOR')} / ${attr(variant,'SIZE')} · Đã thêm ${qty} sản phẩm.`);}
    render();
  }
  document.querySelector('#bag').onclick=()=>{document.querySelector('#bag-content').innerHTML=cart.length?cart.map(row=>{const p=details.find(x=>x.id===row.productId),v=p.variants.find(x=>x.id===row.variantId);return `<div class="bag-row">${img(p.media[0].mediaUrl,p.name)}<div><h3>${p.name}</h3><p class="small">${attr(v,'COLOR')} / ${attr(v,'SIZE')} · Số lượng ${row.quantity}</p><p>${money((v.salePrice??v.basePrice)*row.quantity)}</p></div></div>`;}).join(''):'<p>Giỏ hàng mẫu đang trống.</p>';document.querySelector('#bag-dialog').showModal();};
  document.querySelector('#close-bag').onclick=()=>document.querySelector('#bag-dialog').close();
  document.querySelector('#account').onclick=()=>notify('Chuyển trạng thái đăng nhập giả lập trên thanh duyệt. Màn tài khoản thuộc đợt sau.');
  document.querySelector('#menu-toggle').onclick=()=>{const menu=document.querySelector('#mobile-menu');menu.hidden=!menu.hidden;document.querySelector('#menu-toggle').setAttribute('aria-expanded',String(!menu.hidden));};
  document.addEventListener('keydown',e=>{const f=document.querySelector('.filters.drawer');if(!f)return;if(e.key==='Escape'){closeFilter();return;}if(e.key==='Tab'){const items=[...f.querySelectorAll('button,input,select')].filter(x=>!x.disabled);if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}}});
  scenario.onchange=()=>{addMessage='';render();};session.onchange=()=>{addMessage='';render();};
  window.addEventListener('hashchange',()=>{document.querySelector('#mobile-menu').hidden=true;document.querySelector('#menu-toggle').setAttribute('aria-expanded','false');render();window.scrollTo(0,0);});
  render();
})();
