/* ============================================================
   CYMEDIA — vanilla JS
   - Canvas particle network
   - Scroll progress + pulse orb
   - IntersectionObserver reveals
   - Booking dialog + toast
   - Mobile menu
   - Process rail glow tied to scroll
   - Navbar scrolled state
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));

  /* ====================================================
     1. CANVAS PARTICLE NETWORK
     ==================================================== */
  function initParticles() {
    const canvas = $("#particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let particles = [];
    const mouse = { x: 0, y: 0, active: false };

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.max(60, Math.floor(W * H * 0.00012));
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.4,
        hue: Math.random() < 0.7 ? 220 : 270,
        glow: Math.random() < 0.08,
      }));
    }

    function onMouse(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() { mouse.active = false; }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // soft radial glow center
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.55, 50, W * 0.5, H * 0.55, Math.max(W, H) * 0.6);
      grad.addColorStop(0, "rgba(51,119,255,0.10)");
      grad.addColorStop(0.5, "rgba(126,34,206,0.04)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 22000) {
            p.vx += (dx / Math.sqrt(d2 + 1)) * 0.005;
            p.vy += (dy / Math.sqrt(d2 + 1)) * 0.005;
          }
        }

        p.vx *= 0.995;
        p.vy *= 0.995;

        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 220 ? "rgba(180,210,255,0.85)" : "rgba(200,170,255,0.7)";
        ctx.fill();

        if (p.glow) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
          g.addColorStop(0, p.hue === 220 ? "rgba(51,119,255,0.45)" : "rgba(126,34,206,0.35)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      const maxDist = Math.min(180, W * 0.13);
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.35;
            ctx.strokeStyle = a.hue === b.hue && a.hue === 270
              ? `rgba(160,120,240,${alpha})`
              : `rgba(120,170,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);
  }

  /* ====================================================
     2. SCROLL PROGRESS BAR + PULSE ORB
     ==================================================== */
  function initScrollIndicators() {
    const bar = $("#progress-bar");
    const orb = $("#pulse-orb");
    const navbar = $("#navbar");
    const railGlow = $("#railGlow");

    function update() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;

      if (bar) bar.style.width = (progress * 100).toFixed(2) + "%";
      if (orb) orb.style.top = (progress * 100).toFixed(2) + "%";
      if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 24);

      // Process rail glow: tie progress within #process section
      if (railGlow) {
        const sec = $("#process");
        if (sec) {
          const rect = sec.getBoundingClientRect();
          const vh = window.innerHeight;
          const start = rect.top - vh * 0.8;
          const end = rect.bottom - vh * 0.2;
          const range = end - start;
          const local = Math.max(0, Math.min(1, -start / range));
          railGlow.style.height = (local * 100).toFixed(2) + "%";
        }
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ====================================================
     3. INTERSECTION OBSERVER REVEALS
     ==================================================== */
  function initReveals() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ====================================================
     4. BOOKING DIALOG + TOAST
     ==================================================== */
  function initDialog() {
    const dialog = $("#dialog");
    const form = $("#bookForm");
    const submitBtn = $("#submitBtn");
    const content = $("#dialogContent");
    const success = $("#dialogSuccess");
    const toast = $("#toast");

    function open() {
      dialog.classList.add("open");
      dialog.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      // reset
      content.hidden = false;
      success.hidden = true;
      if (form) form.reset();
    }
    function close() {
      dialog.classList.remove("open");
      dialog.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    $$(".open-dialog").forEach((btn) => btn.addEventListener("click", open));
    $$("[data-close]", dialog).forEach((btn) => btn.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dialog.classList.contains("open")) close();
    });

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours…";
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Envoyer ma demande";
          content.hidden = true;
          success.hidden = false;
          showToast("Demande envoyée", "Notre équipe vous recontacte sous 24h.");
          setTimeout(close, 1800);
        }, 900);
      });
    }

    let toastTimer;
    function showToast(title, desc) {
      if (!toast) return;
      toast.innerHTML = `<p class="t-title">${title}</p><p class="t-desc">${desc}</p>`;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
    }
  }

  /* ====================================================
     5. MOBILE MENU
     ==================================================== */
  function initMobileMenu() {
    const toggle = $("#mobileToggle");
    const panel = $("#mobilePanel");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", () => {
      const opened = panel.classList.toggle("open");
      toggle.classList.toggle("open", opened);
    });
    // close on any link click
    $$("a, button", panel).forEach((el) =>
      el.addEventListener("click", () => {
        panel.classList.remove("open");
        toggle.classList.remove("open");
      })
    );
  }

  /* ====================================================
     INIT
     ==================================================== */
  function init() {
    initParticles();
    initScrollIndicators();
    initReveals();
    initDialog();
    initMobileMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();