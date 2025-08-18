// guard.js v11 — Solo NOMBRE, sin temas. No rompe layout.
(function () {
  // -------- utilidades --------
  const norm = s => (s || "")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ").trim();

  const escapeHTML = s => s.replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // lee nombre de URL o localStorage
  const qs = new URLSearchParams(location.search);
  let nombre = decodeURIComponent(qs.get("u") || localStorage.getItem("buyer_name") || "").trim();

  // quita “Versión …”
  function quitarVersion() {
    document.querySelectorAll("small, em, i, p, div, span").forEach(el => {
      const t = (el.textContent || "").trim();
      if (/^versi[oó]n\s/i.test(t)) el.remove();
    });
  }

  // localiza SOLO el renglón del saludo
  function encontrarSaludo() {
    const candidatos = document.querySelectorAll("p,div,span,h2,h3");
    for (const el of candidatos) {
      const txt = norm(el.innerText);
      // Debe contener "leeme cuando te sientas", ser corto y NO contener controles
      if (/leeme cuando te sientas/i.test(txt) &&
          txt.length > 20 && txt.length < 220 &&
          !el.querySelector("button,nav,main,header,footer,section")) {
        return el;
      }
    }
    return null;
  }

  // obtiene el final del texto (“Léeme cuando…”) preservando tu redacción
  function obtenerCola(el) {
    const raw = el.innerText || "";
    const sinHola = raw.replace(/^ *hola .*?(!|¡)\s*/i, "");
    return sinHola || "Léeme cuando te sientas ansioso, triste, desanimado o agradecido ✨";
  }

  function pintarNombre(el) {
    const n = escapeHTML(nombre || "Amigo");
    const cola = obtenerCola(el);
    el.innerHTML = `<b>Hola ${n}!</b> ${cola}`;
    // también llena spans opcionales
    document.querySelectorAll('[data-username], #username, #usuario, #usuarioSpan, .usuario')
      .forEach(e => e.textContent = nombre || "Amigo");
  }

  function persistir() {
    localStorage.setItem("buyer_name", nombre || "Amigo");
    try {
      const u = new URL(location.href);
      u.searchParams.set("u", encodeURIComponent(nombre || "Amigo"));
      history.replaceState(null, "", u);
    } catch {}
  }

  function pedirNombre() {
    const nuevo = prompt("¿Cómo te llamás?", nombre || "");
    if (nuevo === null) return;
    nombre = (nuevo.trim() || "Amigo");
    const saludo = encontrarSaludo();
    if (saludo) pintarNombre(saludo);
    persistir();
  }

  function bindEditar(saludo) {
    // click para editar
    saludo.addEventListener("click", pedirNombre);
    // long-press alternativo
    let t = null;
    const start = () => { t = setTimeout(pedirNombre, 650); };
    const end   = () => { clearTimeout(t); t = null; };
    ["touchstart","mousedown"].forEach(e => saludo.addEventListener(e, start, {passive:true}));
    ["touchend","touchcancel","mouseup","mouseleave"].forEach(e => saludo.addEventListener(e, end));
  }

  function init() {
    if (!nombre) nombre = "Amigo";
    quitarVersion();

    const saludo = encontrarSaludo();
    if (saludo) {
      pintarNombre(saludo);
      persistir();
      bindEditar(saludo);
    } else {
      // Si no lo encuentra, no toca nada más (para no romper la UI).
      persistir();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();