document.addEventListener("DOMContentLoaded",()=>{
  const params=new URLSearchParams(location.search);
  const category=params.get("category");
  const month=params.get("month");
  const entries=[...document.querySelectorAll("#logEntries article")];
  let visible=0;
  entries.forEach(entry=>{
    const show=category?entry.dataset.category===category:month?entry.dataset.month===month:true;
    entry.hidden=!show;
    if(show)visible++;
  });
  document.getElementById("logEmpty").hidden=visible!==0;
  document.querySelectorAll(".log-sidebar a").forEach(link=>{
    const active=(!category&&!month&&link.dataset.filter==="all")||(category&&link.dataset.filter==="category"&&link.dataset.value===category)||(month&&link.dataset.filter==="month"&&link.dataset.value===month);
    if(active)link.setAttribute("aria-current","page");
  });
});
