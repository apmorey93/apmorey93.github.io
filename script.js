const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const navToggle = $(".nav-toggle");
const mobileMenu = $("#mobile-menu");
const progress = $(".scroll-progress");
const cursorDot = $(".cursor-dot");
const cursorRing = $(".cursor-ring");
const resumeOpen = $("#resume-open");
const resumeModal = $("#resume-modal");
const canvas = $("#ambient-canvas");
const ctx = canvas.getContext("2d");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const setMenu = (isOpen) => {
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  mobileMenu.classList.toggle("open", isOpen);
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
};

navToggle?.addEventListener("click", () => {
  setMenu(!mobileMenu.classList.contains("open"));
});

$$(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

const updateProgress = () => {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const pct = height > 0 ? (window.scrollY / height) * 100 : 0;
  progress.style.width = `${pct}%`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

if (!reducedMotion && cursorDot && cursorRing) {
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  let dotX = ringX;
  let dotY = ringY;

  window.addEventListener("pointermove", (event) => {
    dotX = event.clientX;
    dotY = event.clientY;
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
  });

  const animateCursor = () => {
    ringX += (dotX - ringX) * 0.18;
    ringY += (dotY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();

  $$(".magnetic, a, button, input, textarea").forEach((target) => {
    target.addEventListener("pointerenter", () => document.body.classList.add("cursor-active"));
    target.addEventListener("pointerleave", () => document.body.classList.remove("cursor-active"));
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
);

$$(".reveal-up").forEach((element) => revealObserver.observe(element));

const formatCounter = (counter, value) => {
  const prefix = counter.dataset.prefix || "";
  const suffix = counter.dataset.suffix || "";
  return `${prefix}${Math.round(value)}${suffix}`;
};

const animateCounter = (counter) => {
  const target = Number(counter.dataset.count);
  if (!Number.isFinite(target)) return;

  if (reducedMotion) {
    counter.textContent = formatCounter(counter, target);
    return;
  }

  const start = performance.now();
  const duration = 900;

  const tick = (now) => {
    const progressValue = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    counter.textContent = formatCounter(counter, target * eased);

    if (progressValue < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.7 }
);

$$("[data-count]").forEach((counter) => counterObserver.observe(counter));

const sections = $$("main section[id]");
const navLinks = $$(".nav-links a");

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { threshold: 0.45 }
);

sections.forEach((section) => activeObserver.observe(section));

$$(".project-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (reducedMotion) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = (y / rect.height - 0.5) * -5;
    const rotateY = (x / rect.width - 0.5) * 5;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

resumeOpen?.addEventListener("click", () => {
  if (typeof resumeModal.showModal === "function") {
    resumeModal.showModal();
    return;
  }

  window.location.href = "mailto:adityamorey1723@gmail.com?subject=Resume%20request";
});


const pointer = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5
};

let particles = [];
let width = 0;
let height = 0;
let pixelRatio = 1;
let animationFrameId = 0;

const createParticles = () => {
  const count = Math.min(96, Math.max(42, Math.floor((width * height) / 22000)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    depth: Math.random() * 0.8 + 0.2,
    hue: Math.random() > 0.78 ? "244, 245, 241" : "138, 223, 255"
  }));
};

const resizeCanvas = () => {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  createParticles();
};

const shouldAnimateCanvas = () => !reducedMotion && document.visibilityState === "visible";

const drawCanvas = () => {
  animationFrameId = 0;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(5, 6, 6, 0.52)";
  ctx.fillRect(0, 0, width, height);

  const maxDistance = Math.min(180, width * 0.18);

  particles.forEach((particle, index) => {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const distance = Math.hypot(dx, dy);
    const pull = Math.max(0, 1 - distance / 260) * 0.012 * particle.depth;

    particle.vx += dx * pull;
    particle.vy += dy * pull;
    particle.vx *= 0.985;
    particle.vy *= 0.985;
    particle.x += particle.vx * particle.depth;
    particle.y += particle.vy * particle.depth;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const next = particles[nextIndex];
      const lineDistance = Math.hypot(particle.x - next.x, particle.y - next.y);

      if (lineDistance < maxDistance) {
        const opacity = (1 - lineDistance / maxDistance) * 0.18;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = `rgba(${particle.hue}, ${0.28 + particle.depth * 0.36})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 1.2 + particle.depth * 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  if (shouldAnimateCanvas()) {
    animationFrameId = requestAnimationFrame(drawCanvas);
  }
};

const startCanvas = () => {
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(drawCanvas);
  }
};

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") startCanvas();
});

resizeCanvas();
drawCanvas();
