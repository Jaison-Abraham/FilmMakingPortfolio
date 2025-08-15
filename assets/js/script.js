const header = document.querySelector("header");
const video = document.querySelector(".video-background");

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 100) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  },
  { passive: true }
);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
);

document
  .querySelectorAll(".glass-card, .portfolio-item, .contact-item")
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    revealObserver.observe(el);
  });

function animateCounter(el, target) {
  let current = 0;
  const step = Math.max(1, Math.floor(target / 100));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + "+";
      clearInterval(timer);
    } else {
      el.textContent = current + "+";
    }
  }, 20);
}

const statsGrid = document.querySelector(".stats-grid");
if (statsGrid) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      statsGrid.querySelectorAll(".stat-number").forEach((num) => {
        const target = parseInt(num.textContent, 10) || 0;
        animateCounter(num, target);
      });
      statsObserver.unobserve(statsGrid);
    });
  });
  statsObserver.observe(statsGrid);
}

// --------- Parallax dots with extra motion
(() => {
  const dots = Array.from(document.querySelectorAll(".floating-element"));
  if (!dots.length) return;

  let latestY = window.pageYOffset;
  let ticking = false;
  let time = 0;

  function onScroll() {
    latestY = window.pageYOffset;
    if (!ticking) {
      window.requestAnimationFrame(updateDots);
      ticking = true;
    }
  }

  function updateDots() {
    time += 0.02;
    dots.forEach((el, i) => {
      const speed = 0.5 + i * 0.15;
      const wave = Math.sin(time + i) * 100; 
      const offsetY = latestY * speed + wave;
      const offsetX = Math.cos(time + i * 0.5) * 10;
      el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${
        1 + Math.sin(time + i) * 0.05
      })`;
    });
    ticking = false;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  setInterval(updateDots, 16); 
})();

document.addEventListener("DOMContentLoaded", () => {
  if (video) {
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.setAttribute("playsinline", "");

    video.play().catch(() => {
      console.debug("Autoplay might be blocked; video will remain muted.");
    });

    video.addEventListener("error", function () {
      console.warn("Video failed to load, hiding video background");
      this.style.display = "none";
      const hero = document.querySelector(".hero");
      if (hero) {
        hero.style.background =
          "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)";
      }
    });
  }

  document.body.classList.add("loaded");
});

function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  if (navLinks) navLinks.classList.toggle("mobile-active");
}
window.toggleMobileMenu = toggleMobileMenu;

if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
  document.documentElement.style.setProperty("--animation-duration", "0.2s");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") document.body.classList.add("keyboard-navigation");
});
document.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-navigation");
});
