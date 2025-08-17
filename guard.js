// guard.js — PERSONALIZACIÓN SIN TOKENS (v4-lite)
(function () {
  const qs = new URLSearchParams(location.search);
  // 1) Tomar nombre de la URL o del dispositivo
  let nombre = (qs.get("u") || localStorage.getItem("buyer_name") || "").trim();

  // --- Utilidades ---
  const setParam = (url, key, value) => {
    try { const u = new URL(url); u.searchParams.set(key, value); return u.toString(); }
    catch { return url; }
  };

  function setNombre(n) {
    // Guardar para próximos ingresos
    localStorage.setItem("buyer_name", n);

    // a) Reemplazo directo en selectores comunes
    let placed = false;
    ["[data-username]", "#username", "#usuario", "#usuarioSpan", ".usuario"].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) { el.textContent = n; placed = true; }
    });

    // b) Si no hay selectores, buscar un "Hola ..." y reemplazarlo
    if (!placed) {
      for (const el of document.querySelectorAll("h1,h2,h3,p,div,span")) {
        const t = (el.textContent || "").trim();
        if (/^hola\s+.+/i.test(t) && !/versi[oó]n\s/i.test(t)) { el.textContent = `Hola ${n}!`; placed = true; break; }
      }
    }

    // c) Si todavía no hay dónde, mostrar cinta discreta (tap para editar)
    if (!placed && !document.getElementById("guard-ribbon-lite")) {
      const ribbon = document.createElement("div");
      ribbon.id = "guard-ribbon-lite";
      ribbon.innerHTML = `<style>
        #guard-ribbon-lite{position:fixed;top:10px;right:10px;background:#121737;color:#eaf1ff;
          border:1px solid #2d315b;border-radius:999px;padding:8px 12px;font-size:.9rem;z-index:2147483646}
        #guard-ribbon-lite small{opacity:.7;margin-left:6px}
      </style><span>Para: <b>${n}</b></span><small>(tocar para editar)</small>`;
      ribbon.addEventListener("click", () => {
        const nuevo = prompt("¿Cómo te llamás?", n) || n;
        const v = nuevo.trim() || n;
        localStorage.setItem("buyer_name", v);
        // Actualizar URL para persistir si comparte el enlace
        try { history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(v))); } catch {}
        // Refrescar texto en la UI
        setNombre(v);
      });
      document.documentElement.appendChild(ribbon);
    }
  }

  // --- Flujo principal ---
  if (nombre) {
    // Vino en URL o ya estaba guardado → usar y actualizar URL
    setNombre(nombre);
    try { history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(nombre))); } catch {}
    return;
  }

  // No hay nombre → pedirlo una vez con un overlay mínimo
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
      setNombre(v);
      // Actualizar URL con ?u= para futuros ingresos/compartidos
      try { history.replaceState(null, "", setParam(location.href, "u", encodeURIComponent(v))); } catch {}
      ov.remove();
    };
    btn.addEventListener("click", go);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  }, 0);
})();