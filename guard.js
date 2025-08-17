// Guard v3 — token 1 uso + nombre por enlace (bloqueo total hasta validar)
(function(){
  const qs = new URLSearchParams(location.search);
  const nombre = (qs.get("u") || "").trim();
  const token  = (qs.get("token") || "").trim();

  const ov = document.createElement("div");
  ov.id = "guard-blocker";
  ov.innerHTML = `
    <style>
      #guard-blocker{position:fixed;inset:0;background:rgba(10,11,20,.97);
        color:#eaf1ff;display:flex;flex-direction:column;align-items:center;justify-content:center;
        z-index:2147483647;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif;text-align:center;padding:22px}
      #guard-blocker .card{max-width:720px;border:1px solid #2d315b;background:linear-gradient(180deg,#151735,#10122e);
        border-radius:16px;padding:18px 16px;box-shadow:0 10px 40px rgba(0,0,0,.35)}
      .ok{color:#92ffd9}.warn{color:#ffd7df}.small{font-size:.9rem;opacity:.85}
    </style>
    <div class="card"><div style="font-weight:800;margin-bottom:6px">Validando acceso…</div><div id="guard-msg" class="small">Aguarde un instante.</div></div>`;
  document.documentElement.appendChild(ov);
  const setMsg = (h)=>{const el=document.getElementById('guard-msg'); if(el) el.innerHTML=h;};

  function setNombre(n){
    let ok=false;
    const SELS=["[data-username]","#username","#usuario","#usuarioSpan",".usuario"];
    for(const s of SELS){const el=document.querySelector(s); if(el){el.textContent=n; ok=true;}}
    if(!ok){
      const nodes=[...document.querySelectorAll('h1,h2,h3,p,div,span')];
      for(const el of nodes){
        const t=(el.textContent||'').trim();
        if(/^hola\s+.+/i.test(t) && !/versi[oó]n\s/i.test(t)){ el.textContent = `Hola ${n}!`; ok=true; break; }
      }
    }
    if(!ok){
      const ribbon=document.createElement('div');
      ribbon.innerHTML=`<style>#guard-ribbon{position:fixed;top:10px;right:10px;background:#121737;color:#eaf1ff;border:1px solid #2d315b;border-radius:999px;padding:8px 12px;font-size:.9rem;z-index:2147483646}</style><div id="guard-ribbon">Para: <b>${n}</b></div>`;
      document.documentElement.appendChild(ribbon);
    }
  }

  async function burn(tk){
    if(!tk || !nombre){ setMsg('Link inválido.<br><span class="warn small">Debe incluir <code>?u=Nombre&token=XYZ</code>.</span>'); return; }
    try{
      setMsg('Verificando token…');
      const r = await fetch('/.netlify/functions/burn',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:tk})});
      if(r.status===200){ setNombre(nombre); setMsg('Acceso concedido <span class="ok">✓</span>'); setTimeout(()=>ov.remove(),180); }
      else if(r.status===410){ setMsg('Este enlace ya fue utilizado.<br><span class="warn">Pedí un nuevo token.</span>'); }
      else { setMsg('No se pudo validar el token.<br><span class="warn small">Probá otra vez.</span>'); }
    }catch{ setMsg('Se requiere conexión para validar.<br><span class="warn small">Intentá con internet.</span>'); }
  }
  burn(token);
})();