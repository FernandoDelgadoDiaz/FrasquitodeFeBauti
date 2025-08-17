// guard.js — sin tokens + intro completa + quita "Versión ..."
(function () {
  const TAGLINE = "Léeme cuando te sientas ansioso, triste, desanimado o agradecido ✨";
  const qs = new URLSearchParams(location.search);
  let nombre = (qs.get("u") || localStorage.getItem("buyer_name") || "").trim();

  // util: setea ?u= en la URL
  const setParam = (url, key, value) => {
    try { const u = new URL(url); u.searchParams.set(key, value); return u.toString(); }
    catch { return url; }
  };

  // pide nombre con overlay (no prompt del navegador)
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
          <div class="muted">Se guardará en tu dispositivo. Podrás cambiarlo luego.</div>
        </div>`;
      document.documentElement.appendChild(ov);
      const inp = ov.querySelector("#inpNombreLite");
      const btn = ov.querySelector("#btnOkLite");
      const go = () => { const v = (inp.value || "Usuario").trim(); ov.remove(); res(v); };
      btn.addEventListener("click", go);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      setTimeout(()=>inp.focus(),0);
    });
  }

  // quita cualquier línea "Versión ..." bajo el título
  function quitarLineaVersion() {
    for (const el of document.querySelectorAll("small,em,i,p,div,span")) {
      const t = (el.textContent || "").trim();
      if (/^versi[oó]n\b/i.test(t)) { el.remove(); }
    }
  }

  // pone "Hola NOMBRE! + TAGLINE" donde corresponda; si no hay lugar, crea un bloque
  function pintarIntro(n) {
    localStorage.setItem("buyer_name", n);
    // a) si existe un "Hola ..." lo reemplazo
    let target = null;
    for (const el of document.querySelectorAll("h1,h2,h3,p,div,span,strong")) {
      const t = (el.textContent || "").trim();
      if (/^hola\s+/i.test(t)) { target = el; break; }
    }
    if (target) {
      target.innerHTML = `<b>Hola ${n}!</b> ${TAGLINE}`;
    } else {
      // b) si no hay, agrego un bloque arriba de los botones
      const host = document.querySelector("main") || document.body;
      const bar = document.createElement("div");
      bar.style.cssText = "margin:16px auto 8px;max-width:720px;background:#ffffff14;border:1px solid #e6e7ee55;border-radius:18px;padding:14px 16px;text-align:center";
      bar.innerHTML = `<b>Hola ${n}!</b> ${TAGLINE}`;
      host.insertBefore(bar, host.children[2] || host.firstChild);
    }
  }

  // permite editar nombre desde una cinta
  function ponerCintaEditar(n) {
    if (document.getElementById("guard-ribbon-lite")) return;
    const ribbon = document.createElement("div");
    ribbon.id = "guard-ribbon-lite";
    ribbon.innerHTML = `<style>
      #guard-ribbon-lite{position:fixed;top:10px;right:10px;background:#121737;color:#eaf1ff;
        border:1px solid #2d315b;border-radius:999px;padding:8px 12px;font-size:.9rem;z-index:2147483646}
      #guard-ribbon-lite small{opacity:.7;margin-left:6px}
    </style><span>Para: <b>${n}</b></span><small>(tocar para editar)</small>`;
    ribbon.addEventListener("click", async () => {
      const nuevo = await pedirNombre(n);
      const v = (nuevo || n).trim();
      history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(v)));
      quitarLineaVersion();
      pintarIntro(v);
      ribbon.querySelector("b").textContent = v;
    });
    document.documentElement.appendChild(ribbon);
  }

  function run(n) {
    quitarLineaVersion();
    pintarIntro(n);
    ponerCintaEditar(n);
    try { history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(n))); } catch {}
  }

  // Esperar al DOM por si el script carga muy pronto
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