<!-- /guard.js v9 (lite) -->
<script>
(function(){
  const THEMES = {
    bauti:{ bg1:"#f3fff5", bg2:"#f3fbff", brand:"#ffb8ae", chip:"#ffe9e5", text:"#1e2330", card:"#ffffff14", border:"#e6e7ee55" },
    martina:{ bg1:"#ffece0", bg2:"#fdeff8", brand:"#f6c7ff", chip:"#f7eaff", text:"#1e2330", card:"#ffffff14", border:"#e6e7ee55" }
  };
  const TAG = {
    bauti:"Léeme cuando te sientas ansioso, triste, desanimado o agradecido ✨",
    martina:"Léeme cuando te sientas ansiosa, triste, desanimada o agradecida ✨"
  };

  const qs=new URLSearchParams(location.search);
  let nombre = decodeURIComponent(qs.get("u")||localStorage.getItem("buyer_name")||"").trim();
  let theme  = (qs.get("t")||localStorage.getItem("ff_theme_key")||"bauti").toLowerCase();
  if(!THEMES[theme]) theme="bauti";

  function applyTheme(){
    const p = THEMES[theme];
    let s = document.getElementById("ff-theme");
    if(!s){ s=document.createElement("style"); s.id="ff-theme"; document.head.appendChild(s); }
    s.textContent = `
      :root{--bg1:${p.bg1};--bg2:${p.bg2};--brand:${p.brand};--chip:${p.chip};--text:${p.text};--card:${p.card};--border:${p.border}}
      body{background:linear-gradient(180deg,var(--bg1),var(--bg2))!important;color:var(--text)}
      .chip,.pill,button,.btn{background:var(--chip)!important;border:1px solid var(--brand)!important}
      .card{background:var(--card)!important;border:1px solid var(--border)!important;border-radius:18px}
      a,.link{color:var(--brand)!important}
    `;
  }

  function quitarVersion(){
    document.querySelectorAll("small,em,i,p,div,span").forEach(el=>{
      const t=(el.textContent||"").trim();
      if(/^versi[oó]n\s/i.test(t)) el.remove();
    });
  }

  // Busca el párrafo del saludo original que contiene “Léeme cuando…”
  function nodoSaludo(){
    const all=document.querySelectorAll("h1,h2,h3,p,div,span,strong");
    for(const el of all){
      const txt=(el.textContent||"")
        .normalize("NFD").replace(/\p{Diacritic}/gu,"");
      if(/leeme cuando te sientas/i.test(txt)) return el;
    }
    return null;
  }

  function pintarSaludo(){
    const el = nodoSaludo();
    if(!el) return;
    const n = (nombre||"Amigo");
    el.innerHTML = `<b>Hola ${n}!</b> ${TAG[theme]}`;
  }

  function persistir(){
    localStorage.setItem("buyer_name", nombre);
    localStorage.setItem("ff_theme_key", theme);
    try{
      const u=new URL(location.href);
      u.searchParams.set("u", encodeURIComponent(nombre));
      u.searchParams.set("t", theme);
      history.replaceState(null,"",u);
    }catch{}
  }

  function bindLongPress(){
    const trg = nodoSaludo() || document.querySelector("img") || document.body;
    let timer=null;
    const start=()=>{ timer=setTimeout(()=>{
      const nuevo = prompt("¿Cómo te llamás?", nombre||"");
      if(nuevo===null) return;
      nombre = (nuevo||"").trim() || "Amigo";
      const usarMartina = confirm("¿Usar colores MARTINA?\nAceptar = Martina | Cancelar = Bauti");
      theme = usarMartina ? "martina" : "bauti";
      applyTheme(); pintarSaludo(); persistir();
    },650); };
    const end=()=>{ clearTimeout(timer); timer=null; };
    ["pointerdown","touchstart","mousedown"].forEach(e=>trg.addEventListener(e,start,{passive:true}));
    ["pointerup","pointercancel","touchend","mouseleave","mouseup"].forEach(e=>trg.addEventListener(e,end));
  }

  function init(){
    if(!nombre) nombre="Amigo";
    applyTheme();
    quitarVersion();
    pintarSaludo();
    bindLongPress();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
</script>