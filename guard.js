// guard.js v8.1 — nombre + tema (Bauti/Martina), long-press, sin cinta ni “Versión …”
(function () {
  const THEMES = {
    bauti:   { bg1:"#f3fff5", bg2:"#f3fbff", brand:"#ffb8ae", chip:"#ffe9e5", text:"#1e2330", card:"#ffffff14", border:"#e6e7ee55" },
    martina: { bg1:"#ffece0", bg2:"#fdeff8", brand:"#f6c7ff", chip:"#f7eaff", text:"#1e2330", card:"#ffffff14", border:"#e6e7ee55" }
  };
  const TAGLINE = {
    bauti:   "Léeme cuando te sientas ansioso, triste, desanimado o agradecido ✨",
    martina: "Léeme cuando te sientas ansiosa, triste, desanimada o agradecida ✨",
  };

  // --- Params (decodifica acentos/espacios) ---
  const qs = new URLSearchParams(location.search);
  const getDecoded = (k) => decodeURIComponent((qs.get(k) || "").replace(/\+/g," ")).trim();
  let nombre   = getDecoded("u") || (localStorage.getItem("buyer_name") || "").trim();
  let themeKey = (qs.get("t") || localStorage.getItem("ff_theme_key") || "bauti").toLowerCase();
  if (!THEMES[themeKey]) themeKey = "bauti";

  const setParam = (url, key, value) => { try { const u=new URL(url); u.searchParams.set(key,value); return u.toString(); } catch { return url; } };

  // --- Safety: limpia overlays viejos y muestra la app ---
  function unblock() {
    const old = document.getElementById("guard-blocker"); if (old) old.remove();
    const main = document.querySelector("main"); if (main) main.style.removeProperty("display");
    document.body.style.removeProperty("display");
  }

  function applyTheme(key) {
    const p = THEMES[key] || THEMES.bauti;
    localStorage.setItem("ff_theme_key", key);
    let tag = document.getElementById("dynamic-theme");
    if (!tag) { tag = document.createElement("style"); tag.id = "dynamic-theme"; document.documentElement.appendChild(tag); }
    tag.textContent = `
      :root{ --bg1:${p.bg1}; --bg2:${p.bg2}; --brand:${p.brand}; --chip:${p.chip};
             --text:${p.text}; --card:${p.card}; --border:${p.border}; }
      body{ background:linear-gradient(180deg,var(--bg1),var(--bg2)) !important; color:var(--text); }
      .card, .intro-block{ background:var(--card)!important; border:1px solid var(--border)!important; border-radius:18px; }
      .chip, .pill, button, .btn{ background:var(--chip)!important; border:1px solid var(--brand)!important; }
      a, .link{ color:var(--brand)!important; }
    `;
  }

  function quitarLineaVersion() {
    for (const el of document.querySelectorAll("small,em,i,p,div,span")) {
      const t = (el.textContent || "").trim();
      if (/versi[oó]n\s+/i.test(t)) el.remove();
    }
  }

  function pintarIntro(n, key) {
    const tagline = TAGLINE[key] || TAGLINE.bauti;
    localStorage.setItem("buyer_name", n);

    // Reemplaza si ya existe un “Hola …”
    for (const el of document.querySelectorAll("h1,h2,h3,p,div,span,strong")) {
      const txt = (el.textContent || "").trim();
      if (/^hola\s+/i.test(txt)) { el.innerHTML = `<b>Hola ${n}!</b> ${tagline}`; return el; }
    }
    // Spans de nombre sueltos
    ["[data-username]","#username","#usuario","#usuarioSpan",".usuario",".hola-nombre"]
      .forEach(sel => { const el=document.querySelector(sel); if(el) el.textContent=n; });

    // Si no hay, se crea bloque
    const host = document.querySelector("main") || document.body;
    const bar = document.createElement("div");
    bar.className = "intro-block";
    bar.style.cssText = "margin:16px auto 8px;max-width:720px;padding:14px 16px;text-align:center";
    bar.innerHTML = `<b>Hola ${n}!</b> ${tagline}`;
    host.insertBefore(bar, host.children[2] || host.firstChild);
    return bar;
  }

  function abrirEditor(defName, defTheme) {
    return new Promise(res => {
      const ov = document.createElement("div");
      ov.id = "cfg-overlay";
      ov.innerHTML = `
        <style>
          #cfg-overlay{position:fixed;inset:0;background:rgba(10,11,20,.96);color:#eaf1ff;display:flex;align-items:center;justify-content:center;z-index:2147483647;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif}
          #cfg-overlay .card{background:linear-gradient(180deg,#151735,#10122e);border:1px solid #2d315b;border-radius:16px;padding:18px 16px;box-shadow:0 10px 40px rgba(0,0,0,.35);max-width:92vw;text-align:center}
          #cfg-overlay input, #cfg-overlay label{color:#eaf1ff}
          #cfg-overlay input, #cfg-overlay select{padding:10px;border-radius:8px;border:1px solid #2d315b;background:#0e1330;color:#eaf1ff;width:240px}
          #cfg-overlay button{margin-left:6px;padding:10px 14px;border-radius:8px;background:#5ad1e6;color:#0a0f18;border:0;font-weight:700;cursor:pointer}
          #cfg-overlay .row{display:flex;gap:10px;align-items:center;justify-content:center;margin-top:10px;flex-wrap:wrap}
          #cfg-overlay .sw{display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:#0e1330;border:1px solid #2d315b}
          #cfg-overlay .box{width:18px;height:18px;border-radius:4px}
          @media(max-width:380px){ #cfg-overlay input{width:200px} }
        </style>
        <div class="card">
          <div style="font-weight:800;margin-bottom:8px">Personalizá tu copia</div>
          <div class="row"><input id="inpNombre" placeholder="Tu nombre" value="${defName || ""}" autocomplete="name"></div>
          <div class="row">
            <div class="sw"><div class="box" style="background:${THEMES.bauti.brand}"></div>
              <label><input type="radio" name="t" value="bauti" ${defTheme==="bauti"?"checked":""}> Bauti (verde)</label></div>
            <div class="sw"><div class="box" style="background:${THEMES.martina.brand}"></div>
              <label><input type="radio" name="t" value="martina" ${defTheme==="martina"?"checked":""}> Martina (lila)</label></div>
          </div>
          <div class="row"><button id="btnOk">Guardar</button></div>
          <div style="opacity:.85;font-size:.9rem;margin-top:6px">Se guarda en tu dispositivo y en el enlace.</div>
        </div>`;
      document.documentElement.appendChild(ov);
      const inp = ov.querySelector("#inpNombre");
      const btn = ov.querySelector("#btnOk");
      const getTheme = () => ov.querySelector('input[name="t"]:checked')?.value || "bauti";
      const go = () => { const n=(inp.value||"Usuario").trim(); const t=getTheme(); ov.remove(); res({n,t}); };
      btn.addEventListener("click", go);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      setTimeout(()=>inp.focus(),0);
    });
  }

  function bindLongPress(targets) {
    const bind = (el) => {
      if (!el || el.__lpBound) return;
      el.__lpBound = true;
      let timer=null;
      const start=()=>{ timer=setTimeout(async ()=>{
        const curName = localStorage.getItem("buyer_name") || nombre || "";
        const curTheme = localStorage.getItem("ff_theme_key") || themeKey;
        const { n, t } = await abrirEditor(curName, curTheme);
        nombre = n; themeKey = t;
        applyTheme(t); quitarLineaVersion();
        const intro = pintarIntro(n, t);
        try { history.replaceState(null,"", setParam(setParam(location.href,"u",encodeURIComponent(n)),"t",t)); } catch {}
        bindLongPress([intro, document.querySelector("img")]); // rebind
      },650); };
      const end = ()=>{ clearTimeout(timer); timer=null; };
      ["pointerdown","touchstart","mousedown"].forEach(e=>el.addEventListener(e,start));
      ["pointerup","pointercancel","touchend","mouseleave","mouseup"].forEach(e=>el.addEventListener(e,end));
    };
    targets.forEach(bind);
  }

  function run(n, tKey) {
    unblock();                          // <<— clave
    applyTheme(tKey);
    quitarLineaVersion();
    const intro = pintarIntro(n, tKey);
    try { history.replaceState(null,"", setParam(setParam(location.href,"u",encodeURIComponent(n)),"t",tKey)); } catch {}
    bindLongPress([intro, document.querySelector("img")]);
  }

  const start = async () => {
    unblock();                          // <<— por si el DOM llega con overlay
    if (!nombre) {
      const { n, t } = await abrirEditor("", themeKey);
      nombre = n; themeKey = t;
    }
    run(nombre, themeKey);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();