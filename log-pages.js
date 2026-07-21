const logParams=new URLSearchParams(location.search);
const logPreview=logParams.get("preview")==="1";
const logSource=logPreview?"content/draft.json":"content/site.json";
const logEsc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const logLines=value=>logEsc(value).replace(/\n/g,"<br>");

if(logPreview){
  const badge=document.getElementById("previewBadge");
  if(badge)badge.hidden=false;
  document.querySelectorAll("a.local").forEach(link=>{
    const url=new URL(link.href,location.href);
    url.searchParams.set("preview","1");
    link.href=url.href;
  });
}

fetch(logSource+"?v="+Date.now(),{cache:"no-store"})
  .then(response=>response.ok?response.json():Promise.reject())
  .then(renderLog)
  .catch(()=>{document.getElementById("logEntries").innerHTML='<p class="log-empty">記事データを読み込めませんでした。</p>'});

function renderLog(data){
  const categories=(data.log_categories||[]).map((category,index)=>({id:String(index+1),name:category.name||`カテゴリ${index+1}`}));
  const posts=(data.log_posts||[]).map((post,index)=>({
    title:post.title||`記録 ${index+1}`,
    date:post.date||"",
    category:String(post.category||"1"),
    body:post.body||"",
    image:post.image||"",
    order:index
  })).sort((a,b)=>(b.date||"").localeCompare(a.date||"")||a.order-b.order);
  const selectedCategory=logParams.get("category");
  const selectedMonth=logParams.get("month");
  const visible=posts.filter(post=>selectedCategory?post.category===selectedCategory:selectedMonth?post.date.startsWith(selectedMonth):true);
  const entries=document.getElementById("logEntries");
  entries.innerHTML=visible.map(post=>{
    const image=post.image?`<img class="log-post-image" src="${logEsc(post.image)}" alt="${logEsc(post.title)}">`:"";
    return `<article><time datetime="${logEsc(post.date)}">${formatDate(post.date)}</time><div class="log-post-content"><h2>${logEsc(post.title)}</h2>${image}<p>${logLines(post.body)}</p></div></article>`;
  }).join("")||'<p class="log-empty">この分類には、まだ記録がありません。</p>';
  renderLogSidebar(posts,categories,selectedCategory,selectedMonth);
}

function renderLogSidebar(posts,categories,selectedCategory,selectedMonth){
  const suffix=logPreview?"&preview=1":"";
  const allHref=logPreview?"log.html?preview=1":"log.html";
  const categoriesHtml=categories.map(category=>{
    const count=posts.filter(post=>post.category===category.id).length;
    const current=selectedCategory===category.id?' aria-current="page"':"";
    return `<a href="?category=${encodeURIComponent(category.id)}${suffix}"${current}>${logEsc(category.name)} <span>${count}</span></a>`;
  }).join("");
  const months=[...new Set(posts.map(post=>post.date.slice(0,7)).filter(Boolean))].sort().reverse();
  const monthsHtml=months.map(month=>{
    const count=posts.filter(post=>post.date.startsWith(month)).length;
    const current=selectedMonth===month?' aria-current="page"':"";
    return `<a href="?month=${encodeURIComponent(month)}${suffix}"${current}>${formatMonth(month)} <span>${count}</span></a>`;
  }).join("");
  document.getElementById("logSidebar").innerHTML=`<section><h2>CATEGORIES</h2><a href="${allHref}"${!selectedCategory&&!selectedMonth?' aria-current="page"':""}>すべての記録 <span>${posts.length}</span></a>${categoriesHtml}</section><section><h2>ARCHIVES</h2>${monthsHtml||'<p class="log-sidebar-empty">記事を追加すると表示されます。</p>'}</section>`;
}

function formatDate(date){
  const [year,month,day]=String(date).split("-");
  return year&&month&&day?`${year}.${month}.${day}`:logEsc(date);
}

function formatMonth(month){
  const [year,value]=String(month).split("-");
  return year&&value?`${year}年${Number(value)}月`:logEsc(month);
}
