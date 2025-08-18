// guard.js v10 — Solo nombre (sin temas) + quita "Versión …"
(function () {
  const qs = new URLSearchParams(location.search);
  let nombre = decodeURIComponent(qs.get("u") || localStorage.getItem("buyer_name") || "").trim();

  // Quita cualquier línea que empiece con "Versión ..."
  function quitarVersion() {
    document.querySelectorAll("small, em, i, p, div, span").forEach(el => {
      const t = (el.textContent || "").trim();
      if (/^versi[oó]n\s/i.test(t)) el.remove();
    });
  }

  // Encuentra el párrafo que contiene la frase "Léeme cuando te sientas ..."
  function nodoSaludo() {
    const nodes = document.querySelectorAll("h1,h2,h3,p,div,span,strong");
    for (const el of nodes) {
      const txt = (el.textContent || "")
        .normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (/leeme cuando te sientas/i.test(txt)) return el;
    }
    return null;
  }

  // Pinta "Hola N!" y deja la frase original igual
  function render() {
    const n = nombre || "Amigo";
    const el = nodoSaludo();
    if (el) {
      const tail = (el.textContent || "").replace(/^hola.*?\!\s*/i, ""); // conserva tu frase original
      el.innerHTML = `<b>Hola ${n}!</b> ${tail || "Léeme cuando te sientas ansioso, triste, desanimado o agradecido ✨"}`;
    }
    document.querySelectorAll('[data-username], #username, #usuario, #usuarioSpan, .usuario')
      .forEach(e => e.textContent = n);
  }

  function persistir() {
    localStorage.setItem("buyer_name", nombre);
    try {
      const u = new URL(location.href);
      u.searchParams.set("u", encodeURIComponent(nombre));
      history.replaceState(null, "", u);
    } catch {}
  }

  function pedirNombre() {
    const nuevo = prompt("¿Cómo te llamás?", nombre || "");
    if (nuevo === null) return;
    nombre = (nuevo.trim() || "Amigo");
    render();
    persistir();
  }

  function bindEditar() {
    const trg = nodoSaludo() || document.querySelector("h1") || document.body;
    // Tap para editar
    trg.addEventListener("click", pedirNombre);
    // Long-press alternativo
    let t = null;
    const start = () => { t = setTimeout(pedirNombre, 650); };
    const end = () => { clearTimeout(t); t = null; };
    ["touchstart","mousedown"].forEach(e => trg.addEventListener(e, start, {passive:true}));
    ["touchend","touchcancel","mouseup","mouseleave"].forEach(e => trg.addEventListener(e, end));
  }

  function init() {
    if (!nombre) nombre = "Amigo";
    quitarVersion();
    render();
    persistir();
    bindEditar();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();