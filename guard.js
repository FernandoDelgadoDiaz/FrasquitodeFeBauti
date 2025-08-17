// guard.js — PERSONALIZACIÓN SIN TOKENS + intro completa + oculta "Versión Bauti"
(function () {
  const TAGLINE = "Léeme cuando te sientas ansioso, triste, desanimado o agradecido ✨";

  const qs = new URLSearchParams(location.search);
  let nombre = (qs.get("u") || localStorage.getItem("buyer_name") || "").trim();

  // Utilidad para setear ?u= en la URL
  const setParam = (url, key, value) => {
    try { const u = new URL(url); u.searchParams.set(key, value); return u.toString(); }
    catch { return url; }
  };

  // Quitar "Versión Bauti" (y variantes de espacio/caso)
  function ocultarVersionBauti() {
    const nodes = document.querySelectorAll("small,.subtitle,h2,p,div,span");
    for (const el of nodes) {
      const t = (el.textContent || "").trim();
      if (/\bversi[oó]n\b/i.test(t) && /bauti/i.test(t)) {
        el.remove(); // esconder totalmente
        break;
      }
    }
  }

  function setIntroCompleta(n) {
    // Guardar para próximos ingresos
    localStorage.setItem("buyer_name", n);

    // 1) Si hay contenedor con "Hola ..." lo reemplazo por intro completa
    let colocado = false;
    for (const el of document.querySelectorAll("h1,h2,h3,p,div,span")) {
      const txt = (el.textContent || "").trim();
      if (/^hola\s+/i.test(txt)) {
        el.innerHTML = `<b>Hola ${n}!</b> ${TAGLINE}`;
        colocado = true;
        break;
      }
    }

    // 2) Si tenés un span dedicado al nombre, lo actualizo y busco la línea de intro para poner TAGLINE
    ["[data-username]", "#username", "#usuario", "#usuarioSpan", ".usuario"].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) { el.textContent = n; colocado = true; }
    });

    if (!colocado) {
      // 3) Si no encontré nada, muestro cinta (y al tocar se puede editar)
      if (!document.getElementById("guard-ribbon-lite")) {
        const ribbon = document.createElement("div");
        ribbon.id = "guard-ribbon-lite";
        ribbon.innerHTML = `<style>
          #guard-ribbon-lite{position:fixed;top:10px;right:10px;background:#121737;color:#eaf1ff;
            border:1px solid #2d315b;border-radius:999px;padding:8px 12px;font-size:.9rem;z-index:2147483646}
          #guard-ribbon-lite small{opacity:.7;margin-left:6px}
        </style><span>Para: <b>${n}</b></span><small>(tocar para editar)</small>`;
        ribbon.addEventListener("click", () => {
          const nuevo = prompt("¿Cómo te llamás?", n) || n;
          const v = (nuevo || "").trim() || n;
          localStorage.setItem("buyer_name", v);
          try { history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(v))); } catch {}
          setIntroCompleta(v);
        });
        document.documentElement.appendChild(ribbon);
      }
    }

    // 4) Intento poner el TAGLINE también en un bloque de intro si existe (por si el nombre está en otro nodo)
    const posiblesIntro = [...document.querySelectorAll(".intro,[data-intro]")];
    for (const el of posiblesIntro) {
      if (!/Léeme cuando te sientas/i.test(el.textContent || "")) {
        el.appendChild(document.createTextNode(" " + TAGLINE));
      }
    }
  }

  // ---- Flujo principal
  ocultarVersionBauti();

  if (nombre) {
    setIntroCompleta(nombre);
    try { history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(nombre))); } catch {}
    return;
  }

  // Si no vino nombre, pedirlo una única vez
  const ov = document.createElement("div");
  ov.id = "name-overlay-lite";
  ov.innerHTML = `
    <style>
      #name-overlay-lite{position:fixed;inset:0;background:rgba(10,11,20,.96);color:#eaf1ff;
        display:flex;align-items:center;justify-content:center;z-index:2147483647;
        font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif}
      #name-overlay-lite .card{background:linear-gradient(180deg,#151735,#10122e);border:1px solid #2d315b;
        border-radius:16px;padding:18px 16px;box-shadow:0 10px 40px rgba(0,0,0,.35);max-width:92vw;text-align:center}
      #name-overlay-lite input{padding:10px;border-radius:8px;border:1px solid #2d315b;background:#0e1330;color:#eaf1ff;width:220px}
      #name-overlay-lite button{margin-left:6px;padding:10px 14px;border-radius:8px;background:#5ad1e6;color:#0a0f18;border:0;font-weight:700;cursor:pointer}
      #name-overlay-lite .muted{opacity:.8;font-size:.9rem;margin-top:6px}
    </style>
    <div class="card">
      <div style="font-weight:800;margin-bottom:8px">Personalizá tu copia</div>
      <div><input id="inpNombreLite" placeholder="Tu nombre" autocomplete="name" autofocus>
      <button id="btnOkLite">Continuar</button></div>
      <div class="muted">Se guardará en tu dispositivo. Podrás cambiarlo tocando “Para: …”.</div>
    </div>`;
  document.documentElement.appendChild(ov);

  setTimeout(() => {
    const inp = ov.querySelector("#inpNombreLite");
    const btn = ov.querySelector("#btnOkLite");
    const go = () => {
      const v = (inp.value || "Usuario").trim();
      try { history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(v))); } catch {}
      ov.remove();
      ocultarVersionBauti();
      setIntroCompleta(v);
    };
    btn.addEventListener("click", go);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  }, 0);
})();