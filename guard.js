// guard.js — sin tokens + intro completa + sin cinta (editar con long-press)
(function () {
  const TAGLINE = "Léeme cuando te sientas ansioso, triste, desanimado o agradecido ✨";
  const qs = new URLSearchParams(location.search);
  let nombre = (qs.get("u") || localStorage.getItem("buyer_name") || "").trim();

  const setParam = (url, key, value) => {
    try { const u = new URL(url); u.searchParams.set(key, value); return u.toString(); }
    catch { return url; }
  };

  function pedirNombre(def = "") {
    return new Promise(res => {
      const ov = document.createElement("div");
      ov.id = "name-overlay-lite";
      ov.innerHTML = `
        <style>
          #name-overlay-lite{position:fixed;inset:0;background:rgba(10,11,20,.96);color:#eaf1ff;
            display:flex;align-items:center;justify-content:center;z-index:2147483647;
            font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif}
          #name-overlay-lite .card{background:linear-gradient(180deg,#151735,#10122e);border:1px solid #2d315b;
            border-radius:16px;padding:18px 16px;box-shadow:0 10px 40px rgba(0,0,0,.35);max-width:92vw;text-align:center}
          #name-overlay-lite input{padding:10px;border-radius:8px;border:1px solid #2d315b;background:#0e1330;color:#eaf1ff;width:230px}
          #name-overlay-lite button{margin-left:6px;padding:10px 14px;border-radius:8px;background:#5ad1e6;color:#0a0f18;border:0;font-weight:700;cursor:pointer}
          #name-overlay-lite .muted{opacity:.8;font-size:.9rem;margin-top:6px}
        </style>
        <div class="card">
          <div style="font-weight:800;margin-bottom:8px">Personalizá tu copia</div>
          <div><input id="inpNombreLite" placeholder="Tu nombre" autocomplete="name" value="${def}">
          <button id="btnOkLite">Continuar</button></div>
          <div class="muted">Se guardará en tu dispositivo. Podrás cambiarlo manteniendo presionado el saludo.</div>
        </div>`;
      document.documentElement.appendChild(ov);
      const inp = ov.querySelector("#inpNombreLite");
      const btn = ov.querySelector("#btnOkLite");
      const go  = () => { const v = (inp.value || "Usuario").trim(); ov.remove(); res(v); };
      btn.addEventListener("click", go);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      setTimeout(()=>inp.focus(),0);
    });
  }

  // Quitar cualquier "Versión ...", ej. "Versión Bauti"
  function quitarLineaVersion() {
    for (const el of document.querySelectorAll("small,em,i,p,div,span")) {
      const t = (el.textContent || "").trim();
      if (/^versi[oó]n\b/i.test(t)) { el.remove(); }
    }
  }

  // Pinta “Hola N! + TAGLINE”. Devuelve el nodo donde lo escribió.
  function pintarIntro(n) {
    localStorage.setItem("buyer_name", n);

    // 1) Reemplazar si ya existe un “Hola …”
    for (const el of document.querySelectorAll("h1,h2,h3,p,div,span,strong")) {
      const t = (el.textContent || "").trim();
      if (/^hola\s+/i.test(t)) { el.innerHTML = `<b>Hola ${n}!</b> ${TAGLINE}`; return el; }
    }
    // 2) Si hay contenedor dedicado al nombre, solo actualizo y busco bloque de intro
    ["[data-username]", "#username", "#usuario", "#usuarioSpan", ".usuario"].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.textContent = n;
    });
    // 3) Si no había, creo un bloque limpio arriba de los botones
    const host = document.querySelector("main") || document.body;
    const bar = document.createElement("div");
    bar.style.cssText = "margin:16px auto 8px;max-width:720px;background:#ffffff14;border:1px solid #e6e7ee55;border-radius:18px;padding:14px 16px;text-align:center";
    bar.innerHTML = `<b>Hola ${n}!</b> ${TAGLINE}`;
    host.insertBefore(bar, host.children[2] || host.firstChild);
    return bar;
  }

  // Gesto invisible para editar: long-press sobre el saludo (y fallback en la imagen del frasco)
  function habilitarLongPressEditar(el, fallbackEl) {
    const bind = (target) => {
      if (!target) return;
      if (target.__lpBound) return; // evitar doble binding
      target.__lpBound = true;
      let timer = null;
      const start = () => { timer = setTimeout(async () => {
          const actual = localStorage.getItem("buyer_name") || "";
          const nuevo  = await pedirNombre(actual);
          const v = (nuevo || actual || "Usuario").trim();
          history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(v)));
          quitarLineaVersion();
          const nodo = pintarIntro(v);
          // re-bind por si el nodo cambió
          habilitarLongPressEditar(nodo);
        }, 650);
      };
      const end = () => { clearTimeout(timer); timer = null; };
      ["pointerdown","touchstart","mousedown"].forEach(ev=>target.addEventListener(ev,start));
      ["pointerup","pointercancel","touchend","mouseleave","mouseup"].forEach(ev=>target.addEventListener(ev,end));
    };
    bind(el);
    if (fallbackEl) bind(fallbackEl);
  }

  function run(n) {
    quitarLineaVersion();
    const nodoIntro = pintarIntro(n);
    // fallback: primer imagen del frasco si existe
    const jarImg = document.querySelector("img");
    habilitarLongPressEditar(nodoIntro, jarImg);
    try { history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(n))); } catch {}
  }

  const start = async () => {
    const n = nombre || await pedirNombre("");
    run(n);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();