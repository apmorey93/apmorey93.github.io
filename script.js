const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const navToggle = $(".nav-toggle");
const mobileMenu = $("#mobile-menu");
const progress = $(".scroll-progress");
const resumeOpen = $("#resume-open");
const resumeModal = $("#resume-modal");

const reducedMotion =
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setMenu = (isOpen) => {
  if (!navToggle || !mobileMenu) return;
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  mobileMenu.classList.toggle("open", isOpen);
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
};

if (navToggle && mobileMenu) {
  navToggle.addEventListener("click", () => {
    setMenu(!mobileMenu.classList.contains("open"));
  });
}

$$(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

const updateProgress = () => {
  if (!progress) return;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const pct = height > 0 ? (window.scrollY / height) * 100 : 0;
  progress.style.width = `${pct}%`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

if ("IntersectionObserver" in window && !reducedMotion) {
  document.documentElement.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
  );

  $$(".reveal-up").forEach((element) => revealObserver.observe(element));
} else {
  $$(".reveal-up").forEach((element) => element.classList.add("visible"));
}

const counters = $$("[data-count]");

counters.forEach((counter) => {
  const target = Number(counter.dataset.count);
  const prefix = counter.dataset.prefix || "";
  const suffix = counter.dataset.suffix || "";
  if (Number.isFinite(target)) {
    counter.textContent = `${prefix}${target}${suffix}`;
  }
});

const sections = $$("main section[id]");
const navLinks = $$(".nav-links a");

if ("IntersectionObserver" in window) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((section) => activeObserver.observe(section));
}

if (resumeOpen && resumeModal) {
  resumeOpen.addEventListener("click", () => {
    if (typeof resumeModal.showModal === "function") {
      resumeModal.showModal();
      return;
    }

    window.location.href = "mailto:adityamorey1723@gmail.com?subject=Resume%20request";
  });
}
