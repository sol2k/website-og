/* Solace: interactive globe with destination waitlist pinning
   Dotted earth silhouette, drag/swipe to rotate, tap to drop a pin. */
import * as THREE from "./three.module.min.js?v=4d8e72af";
import { LAND_POINTS } from "./land-data.js?v=299c7eb0";

const stage = document.querySelector("[data-globe]");
if (stage) init();

function init() {
  const readout = document.querySelector("[data-pin-readout]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scene ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 3.1;

  const globe = new THREE.Group();
  scene.add(globe);
  const R = 1;

  /* Sphere core: near-black, subtle */
  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.985, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x16130e, transparent: true, opacity: 0.92 })
  ));

  /* Dotted landmass silhouette */
  const dotGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(LAND_POINTS.length * 3);
  LAND_POINTS.forEach(([lat, lon], i) => {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    positions[i * 3]     = -R * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] =  R * Math.cos(phi);
    positions[i * 3 + 2] =  R * Math.sin(phi) * Math.sin(theta);
  });
  dotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  globe.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
    color: 0xd9bc85, size: 0.0115, sizeAttenuation: true,
    transparent: true, opacity: 0.85
  })));

  /* Graticule: fine latitude/longitude hairlines */
  const gratMat = new THREE.LineBasicMaterial({ color: 0xaf915f, transparent: true, opacity: 0.12 });
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    for (let lon = 0; lon <= 360; lon += 4) {
      pts.push(latLonToVec3(lat, lon, R * 1.001));
    }
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 4) {
      pts.push(latLonToVec3(lat, lon, R * 1.001));
    }
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
  }

  /* Atmosphere halo */
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.16, 48, 48),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false,
      vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vN; void main(){
        float i = pow(0.62 - dot(vN, vec3(0.,0.,1.)), 3.2);
        gl_FragColor = vec4(0.85, 0.74, 0.52, 1.0) * i; }`
    })
  );
  scene.add(halo);

  /* Pin marker */
  const pin = new THREE.Group();
  const pinHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xf7e7c3 })
  );
  const pinRing = new THREE.Mesh(
    new THREE.RingGeometry(0.045, 0.052, 40),
    new THREE.MeshBasicMaterial({ color: 0xd9bc85, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  pin.add(pinHead, pinRing);
  pin.visible = false;
  globe.add(pin);

  /* Curated destination markers */
  const DESTS = [
    { name: "Kyoto, Japan",             lat: 35.01,  lon: 135.76 },
    { name: "Santorini, Greece",        lat: 36.39,  lon: 25.46 },
    { name: "Patagonia, Chile",         lat: -50.94, lon: -73.40 },
    { name: "Marrakech, Morocco",       lat: 31.63,  lon: -7.99 },
    { name: "Baa Atoll, Maldives",      lat: 5.35,   lon: 72.99 },
    { name: "Zermatt, Switzerland",     lat: 46.02,  lon: 7.74 },
    { name: "Bali, Indonesia",          lat: -8.34,  lon: 115.09 },
    { name: "Reykjavík, Iceland",       lat: 64.14,  lon: -21.94 },
    { name: "Cape Town, South Africa",  lat: -33.92, lon: 18.42 },
    { name: "Tuscany, Italy",           lat: 43.77,  lon: 11.25 }
  ];
  const destGroup = new THREE.Group();
  const labelGroup = new THREE.Group();
  DESTS.forEach((d) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xaf915f })
    );
    m.position.copy(latLonToVec3(d.lat, d.lon, R * 1.004));
    m.userData.dest = d;
    destGroup.add(m);
  });
  globe.add(destGroup);
  globe.add(labelGroup);

  function buildLabels() {
    while (labelGroup.children.length) {
      const s = labelGroup.children.pop();
      s.material.map.dispose();
      s.material.dispose();
      labelGroup.remove(s);
    }
    DESTS.forEach((d) => {
      const label = makeLabel(d.name);
      const pos = latLonToVec3(d.lat, d.lon, R * 1.004);
      const n = pos.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
      label.position.copy(pos).addScaledVector(up, 0.06).addScaledVector(n, 0.012);
      labelGroup.add(label);
    });
  }
  buildLabels();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildLabels);

  function makeLabel(text) {
    const pad = 18, fs = 34;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    ctx.font = `${fs}px Jost, sans-serif`;
    const tw = Math.ceil(ctx.measureText(text).width);
    c.width = tw + pad * 2;
    c.height = fs + pad * 1.4;
    const g = c.getContext("2d");
    g.font = `${fs}px Jost, sans-serif`;
    g.fillStyle = "rgba(18, 16, 13, 0.55)";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#f0e3c8";
    g.textBaseline = "middle";
    g.fillText(text, pad, c.height / 2 + 2);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: 0.92, depthTest: true
    }));
    const h = 0.042;
    spr.scale.set(h * (c.width / c.height), h, 1);
    return spr;
  }

  /* ---------- Interaction ---------- */
  let rotX = 0.35, rotY = -1.1;          // current rotation
  let velX = 0, velY = 0;                 // inertia
  let dragging = false, moved = 0;
  let px = 0, py = 0;
  let autoSpin = !reduced;

  const ray = new THREE.Raycaster();
  ray.params.Points = { threshold: 0.02 };
  const mouse = new THREE.Vector2();

  function ptrPos(e) {
    const r = renderer.domElement.getBoundingClientRect();
    const cx = e.clientX ?? (e.touches && e.touches[0].clientX);
    const cy = e.clientY ?? (e.touches && e.touches[0].clientY);
    return [(cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1];
  }

  function onDown(e) {
    dragging = true; moved = 0; autoSpin = false;
    px = e.clientX ?? e.touches[0].clientX;
    py = e.clientY ?? e.touches[0].clientY;
  }
  function onMove(e) {
    if (!dragging) return;
    const cx = e.clientX ?? e.touches[0].clientX;
    const cy = e.clientY ?? e.touches[0].clientY;
    const dx = cx - px, dy = cy - py;
    moved += Math.abs(dx) + Math.abs(dy);
    rotY += dx * 0.0052;
    rotX += dy * 0.0052;
    rotX = Math.max(-1.15, Math.min(1.15, rotX));
    velY = dx * 0.0052; velX = dy * 0.0052;
    px = cx; py = cy;
    if (e.cancelable && e.type === "touchmove") e.preventDefault();
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    setTimeout(() => { autoSpin = !reduced; }, 3500);
    if (moved < 7) handleTap(e);
  }

  function handleTap(e) {
    const [nx, ny] = ptrPos(e.changedTouches ? e.changedTouches[0] : e);
    mouse.set(nx, ny);
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects([destGroup], true);
    if (hits.length) {
      placePin(hits[0].object.userData.dest, hits[0].object.position);
      return;
    }
    /* Approximate surface point → lat/lon */
    const sphere = new THREE.Sphere(new THREE.Vector3(), R);
    const hitPoint = new THREE.Vector3();
    if (ray.ray.intersectSphere(sphere, hitPoint)) {
      const local = globe.worldToLocal(hitPoint.clone());
      const lat = 90 - Math.acos(Math.max(-1, Math.min(1, local.y / R))) * 180 / Math.PI;
      let lon = Math.atan2(local.z, -local.x) * 180 / Math.PI - 180;
      lon = ((lon % 360) + 360) % 360 - 180;
      const d = nearestDest(lat, lon);
      placePin(d, latLonToVec3(d.lat, d.lon, R * 1.004));
    }
  }

  function nearestDest(lat, lon) {
    let best = DESTS[0], bd = 1e9;
    DESTS.forEach((d) => {
      const dist = Math.hypot(d.lat - lat, (d.lon - lon) * Math.cos(lat * Math.PI / 180));
      if (dist < bd) { bd = dist; best = d; }
    });
    return best;
  }

  let pinLoc = null;
  function placePin(dest, pos) {
    pin.position.copy(pos);
    pin.visible = true;
    pinLoc = dest;
    if (readout) {
      readout.innerHTML = pinIcon() + "<span>" + escapeHtml(dest.name) + "</span>";
    }
    openWaitlist(dest.name);
  }

  /* ---------- Waitlist modal ---------- */
  const backdrop = document.querySelector("#waitlist-modal");
  const destField = document.querySelector("#wl-destination");
  const successPanel = document.querySelector("#wl-success");
  const form = document.querySelector("#wl-form");

  function openWaitlist(destName) {
    if (!backdrop) return;
    if (destField) destField.value = destName;
    if (successPanel) successPanel.hidden = true;
    if (form) { form.hidden = false; form.reset(); if (destField) destField.value = destName; }
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const first = backdrop.querySelector("input");
    if (first) setTimeout(() => first.focus(), 120);
  }
  function closeWaitlist() {
    if (!backdrop) return;
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (backdrop) {
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeWaitlist(); });
    backdrop.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeWaitlist));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeWaitlist(); });
  }

  if (form) {
    form.addEventListener("solace:valid", () => {
      const data = Object.fromEntries(new FormData(form).entries());
      try { localStorage.setItem("solace-waitlist", JSON.stringify({ ...data, at: Date.now() })); } catch (_) {}
      /* Hand-off via WhatsApp so the concierge receives it instantly */
      const msg =
        "Hello Solace, I would like to join the waitlist.%0A%0A" +
        "Name: " + encodeURIComponent(data.name) + "%0A" +
        "Destination: " + encodeURIComponent(data.destination) + "%0A" +
        "Travel window: " + encodeURIComponent(data.window) + "%0A" +
        "Email: " + encodeURIComponent(data.email);
      if (successPanel) { successPanel.hidden = false; form.hidden = true; }
      setTimeout(() => { window.open("https://wa.me/919650470279?text=" + msg, "_blank", "noopener"); }, 900);
    });
  }

  /* Manual open buttons (e.g. "join the waitlist" copy buttons) */
  document.querySelectorAll("[data-open-waitlist]").forEach((b) => {
    b.addEventListener("click", () => openWaitlist(pinLoc ? pinLoc.name : ""));
  });

  /* ---------- Loop ---------- */
  const canvas = renderer.domElement;
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  function tick() {
    requestAnimationFrame(tick);
    resize();
    if (!dragging) {
      rotY += velY; rotX += velX;
      velY *= 0.94; velX *= 0.94;
      rotX = Math.max(-1.15, Math.min(1.15, rotX));
      if (autoSpin) rotY += 0.0016;
    }
    globe.rotation.x = rotX;
    globe.rotation.y = rotY;
    pinRing.lookAt(camera.position);
    const s = 1 + Math.sin(performance.now() * 0.003) * 0.18;
    pinRing.scale.setScalar(s);
    renderer.render(scene, camera);
  }

  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", onDown, { passive: true });
  canvas.addEventListener("touchmove", onMove, { passive: false });
  canvas.addEventListener("touchend", onUp);

  tick();
}

function latLonToVec3(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

function pinIcon() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
