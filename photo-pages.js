const photoPreview=new URLSearchParams(location.search).get("preview")==="1";
const photoSource=photoPreview?"content/draft.json":"content/site.json";
const photoEsc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const photoUrl=value=>photoEsc(value||"");

if(photoPreview){
  const badge=document.getElementById("previewBadge");
  if(badge)badge.hidden=false;
  document.querySelectorAll("a.local").forEach(link=>{
    const url=new URL(link.href,location.href);
    url.searchParams.set("preview","1");
    link.href=url.href;
  });
}

fetch(photoSource+"?v="+Date.now(),{cache:"no-store"})
  .then(response=>response.ok?response.json():Promise.reject())
  .then(renderPhotoPage)
  .catch(()=>showPhotoError());

function renderPhotoPage(data){
  const categories=(data.photo_categories||[]).map((category,index)=>({
    id:String(index+1),
    name:category.name||`カテゴリ${index+1}`,
    cover:category.cover_image||""
  }));
  const photos=(data.photos||[]).map((photo,index)=>({
    title:photo.title||`写真 ${index+1}`,
    date:photo.date||"",
    category:String(photo.category||"1"),
    original:photo.original_image||photo.image||"",
    thumbnail:photo.thumbnail_image||photo.original_image||photo.image||"",
    featured:Boolean(photo.featured),
    order:index
  })).filter(photo=>photo.original);
  photos.sort((a,b)=>(b.date||"").localeCompare(a.date||"")||a.order-b.order);
  const page=document.body.dataset.page;
  if(page==="photography-home")renderPhotoHome(photos,categories);
  else if(page==="photo-archive")renderPhotoArchive(photos);
  else if(page==="photo-category")renderPhotoCategory(photos,categories);
  window.dispatchEvent(new CustomEvent("photos-rendered"));
}

function photoCard(photo,heading="h2"){
  return `<article><div class="photo-data-image" style="background-image:url('${photoUrl(photo.thumbnail)}')" data-full-image="${photoUrl(photo.original)}"></div><${heading}>${photoEsc(photo.title)}</${heading}></article>`;
}

function renderPhotoHome(photos,categories){
  const featured=photos.find(photo=>photo.featured)||photos[0];
  const latest=photos.filter(photo=>photo!==featured).slice(0,3);
  const featuredRoot=document.getElementById("featuredPhoto");
  if(featuredRoot&&featured)featuredRoot.innerHTML=`<div class="featured-image photo-data-image" style="background-image:url('${photoUrl(featured.thumbnail)}')" data-full-image="${photoUrl(featured.original)}"></div><h2>${photoEsc(featured.title)}</h2>`;
  const latestRoot=document.getElementById("latestPhotos");
  if(latestRoot)latestRoot.innerHTML=latest.map(photo=>photoCard(photo,"h3")).join("")||'<p class="empty">写真を追加するとここに表示されます。</p>';
  const categoryRoot=document.getElementById("photoCategories");
  if(categoryRoot)categoryRoot.innerHTML=categories.slice(0,5).map(category=>{
    const first=photos.find(photo=>photo.category===category.id);
    const cover=category.cover||first?.thumbnail||"";
    const href=`category.html?category=${encodeURIComponent(category.id)}${photoPreview?"&preview=1":""}`;
    return `<a href="${href}"><div style="background-image:url('${photoUrl(cover)}')"></div><span>${photoEsc(category.name)}</span></a>`;
  }).join("");
}

function renderPhotoArchive(photos){
  const root=document.getElementById("archivePhotos");
  if(root)root.innerHTML=photos.map(photo=>photoCard(photo)).join("")||'<p class="empty">まだ写真がありません。</p>';
}

function renderPhotoCategory(photos,categories){
  const id=new URLSearchParams(location.search).get("category")||"1";
  const category=categories.find(item=>item.id===id)||categories[0]||{id:"1",name:"カテゴリ1"};
  document.getElementById("categoryTitle").textContent=category.name;
  document.title=`${category.name}｜遠望の足跡`;
  const filtered=photos.filter(photo=>photo.category===category.id);
  const root=document.getElementById("archivePhotos");
  if(root)root.innerHTML=filtered.map(photo=>photoCard(photo)).join("")||'<p class="empty">このカテゴリにはまだ写真がありません。</p>';
}

function showPhotoError(){
  const root=document.getElementById("latestPhotos")||document.getElementById("archivePhotos");
  if(root)root.innerHTML='<p class="empty">写真データを読み込めませんでした。</p>';
}
