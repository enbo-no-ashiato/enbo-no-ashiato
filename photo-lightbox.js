const setupPhotoLightbox=()=>{
  const targets=document.querySelectorAll(".featured-image,.latest-grid article>div,.archive-photo-grid article>div");
  if(!targets.length)return;
  if(document.querySelector(".photo-lightbox"))return;
  const overlay=document.createElement("div");
  overlay.className="photo-lightbox";
  overlay.hidden=true;
  overlay.innerHTML='<button class="photo-lightbox-close" type="button" aria-label="拡大表示を閉じる">×</button><img alt="拡大写真">';
  document.body.appendChild(overlay);
  const image=overlay.querySelector("img");
  const close=()=>{overlay.hidden=true;image.removeAttribute("src");document.body.classList.remove("lightbox-open")};
  const open=target=>{
    const match=getComputedStyle(target).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/);
    const source=target.dataset.fullImage||match?.[1];
    if(!source)return;
    image.src=source;
    image.alt=target.parentElement.querySelector("h2,h3")?.textContent||"写真";
    overlay.hidden=false;
    document.body.classList.add("lightbox-open");
    overlay.querySelector("button").focus();
  };
  targets.forEach(target=>{
    target.classList.add("zoomable-photo");
    target.tabIndex=0;
    target.setAttribute("role","button");
    target.setAttribute("aria-label","写真を拡大表示");
    target.addEventListener("click",()=>open(target));
    target.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();open(target)}});
  });
  overlay.addEventListener("click",event=>{if(event.target===overlay||event.target.closest(".photo-lightbox-close"))close()});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!overlay.hidden)close()});
};
document.addEventListener("DOMContentLoaded",setupPhotoLightbox);
window.addEventListener("photos-rendered",setupPhotoLightbox);
