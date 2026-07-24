const preview=new URLSearchParams(location.search).get("preview")==="1";
const source=preview?"content/draft.json":"content/site.json";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const br=v=>esc(v).replace(/\n/g,"<br>");
const yt=v=>{try{const u=new URL(v);if(u.hostname.includes("youtu.be"))return u.pathname.slice(1).split("/")[0];if(u.hostname.includes("youtube.com"))return u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).pop()}catch(_){}return""};
const isMp4=v=>/\.mp4(?:$|[?#])/i.test(String(v??""));
const mediaMarkup=(value,className)=>isMp4(value)
  ?`<div class="${className} media-video" style="overflow:hidden"><video src="${esc(value)}" autoplay muted loop playsinline preload="metadata" aria-hidden="true" style="display:block;width:100%;height:100%;object-fit:cover"></video></div>`
  :`<div class="${className}" style="background-image:url('${esc(value)}')"></div>`;

function setHomeMedia(element,value){
  element.style.backgroundImage="";
  element.innerHTML="";
  if(isMp4(value)){element.style.overflow="hidden";element.innerHTML=`<video src="${esc(value)}" autoplay muted loop playsinline preload="metadata" aria-hidden="true" style="display:block;width:100%;height:100%;object-fit:cover"></video>`;}
  else element.style.backgroundImage=`url('${esc(value)}')`;
}

if(preview){
  document.getElementById("previewBadge").hidden=false;
  document.querySelectorAll("a.local").forEach(a=>a.href+=(a.href.includes("?")?"&":"?")+"preview=1");
}

fetch(source+"?v="+Date.now(),{cache:"no-store"})
  .then(r=>r.ok?r.json():Promise.reject())
  .then(data=>{
    document.querySelectorAll(".site-logo").forEach(i=>i.src=data.logo||"media/logo.png");
    const page=document.body.dataset.page;
    if(page==="home")renderHome(data);
    else if(page==="gallery"||page==="films")renderWorks(data,page);
    else if(page==="about")renderAbout(data);
  })
  .catch(()=>{const root=document.getElementById("items");if(root)root.innerHTML='<div class="empty">作品データを読み込めませんでした。</div>'});

function renderHome(d){
  document.title=`${d.title}｜旅、写真、記録。`;
  q("title").textContent=d.title;
  q("reading").textContent=d.reading;
  q("tagline").textContent="旅、写真、記録。";
  setHomeMedia(q("heroMain"),d.hero_image);
  setHomeMedia(q("heroSub"),d.hero_sub_image);
  q("feature").textContent=d.feature_caption;
  q("aboutTitle").innerHTML="まだ見ぬ遠くの風景を、<br>自分の目と心で見に行きたい。";
  q("aboutBody").innerHTML="「遠望の足跡」は日常と旅の記録。<br>自分の感性を静かに積み重ねていく個人サイトです。";
  const aboutSection=document.querySelector(".about");
  const aboutImage=d.about_image||d.hero_sub_image;
  aboutSection.insertAdjacentHTML("beforeend",`<div class="about-visual"><div class="about-photo" style="background-image:url('${esc(aboutImage)}')"></div><a class="about-link local" href="about.html${preview?"?preview=1":""}"><span>ABOUT</span><b>→</b></a></div>`);
  q("footerText").textContent=d.footer_tagline;
  const works=d.works||[];
  const photo=d.home_photography_image||works.find(w=>!String(w.type).toLowerCase().includes("film"))?.image||d.hero_image;
  const movie=d.home_movie_image||works.find(w=>String(w.type).toLowerCase().includes("film"))?.image||d.hero_sub_image;
  const log=d.home_log_image||d.hero_sub_image;
  q("cards").innerHTML=`
    <a class="card category-card local" href="gallery.html">${mediaMarkup(photo,"card-media")}<h3>PHOTOGRAPHY</h3><em>光と風景の記録</em><p>旅先や日常で出会った、一瞬の気配を切り取りました。</p></a>
    <a class="card category-card local" href="films.html">${mediaMarkup(movie,"card-media")}<h3>MOVIE</h3><em>時間と音の記録</em><p>過ぎゆく時間を、映像という形で残します。</p></a>
    <a class="card category-card local" href="log.html">${mediaMarkup(log,"card-media")}<h3>LOG</h3><em>言葉と記憶の記録</em><p>旅の途中で考えたことや、日々の小さな発見を書き留めます。</p></a>`;
}

function renderAbout(d){
  const image=d.about_image||d.hero_sub_image;
  const profile=document.querySelector(".profile-photo");
  if(profile)profile.style.backgroundImage=`url("${String(image).replace(/["\\\n\r]/g,"")}")`;
}

function renderWorks(d,page){
  let works=d.works||[];
  works=page==="gallery"?works.filter(w=>!String(w.type).toLowerCase().includes("film")):works.filter(w=>yt(w.youtube_url)||String(w.type).toLowerCase().includes("film"));
  const root=q("items");
  if(!works.length){root.innerHTML=`<div class="empty">まだ${page==="gallery"?"写真":"動画"}作品がありません。<br>編集画面から追加するとここへ表示されます。</div>`;return}
  root.innerHTML=works.map(w=>{const id=yt(w.youtube_url);const media=page==="films"&&id?`<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}" title="${esc(w.title)}" loading="lazy" allowfullscreen></iframe></div>`:`<div class="work-image" style="background-image:url('${esc(w.image)}')"></div>`;return`<article class="work">${media}<h2>${esc(w.title)}</h2><p>${esc(w.note)}</p></article>`}).join("");
}

function q(id){return document.getElementById(id)}
