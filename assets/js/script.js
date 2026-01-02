const header = document.querySelector("header");
const video = document.querySelector(".video-background");

// Detect mobile device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                 ('ontouchstart' in window);

// Track if user has interacted
let userHasInteracted = false;

// Mark user interaction on first scroll or touch
const markInteraction = () => {
  if (!userHasInteracted) {
    userHasInteracted = true;
    console.log("User interaction detected");
  }
};

window.addEventListener("scroll", markInteraction, { passive: true, once: true });
window.addEventListener("touchstart", markInteraction, { passive: true, once: true });
window.addEventListener("click", markInteraction, { passive: true, once: true });

// Scroll handling
window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 100) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  },
  { passive: true }
);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    
    // Close mobile menu if open
    const navLinks = document.querySelector(".nav-links");
    if (navLinks && navLinks.classList.contains("mobile-active")) {
      navLinks.classList.remove("mobile-active");
    }
    
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Intersection Observer for animations
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

// Animate brand logos separately
document.querySelectorAll(".brand-logo").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  revealObserver.observe(el);
});

// Counter animation
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

// Parallax floating elements
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

// Portfolio video handling
document.addEventListener("DOMContentLoaded", () => {
  // Background video setup
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

  // Portfolio videos setup
  const portfolioItems = document.querySelectorAll(".portfolio-item");
  
  portfolioItems.forEach((item) => {
    const videoEl = item.querySelector(".portfolio-video");
    const fallbackImg = item.querySelector(".portfolio-fallback");
    
    if (videoEl) {
      // Set video attributes
      videoEl.muted = true;
      videoEl.loop = true;
      videoEl.setAttribute("playsinline", "");
      videoEl.preload = "metadata";
      
      // Track if this specific video has played
      let hasPlayedOnce = false;
      
      // Function to try playing video
      const tryPlayVideo = () => {
        if (videoEl.style.display === "none") return;
        
        videoEl.muted = true;
        videoEl.play().then(() => {
          hasPlayedOnce = true;
          console.log("Portfolio video playing");
        }).catch(err => {
          console.debug("Video play failed:", err);
          // Only show fallback on complete failure
          if (fallbackImg && err.name === "NotSupportedError") {
            videoEl.style.display = "none";
            fallbackImg.style.display = "block";
          }
        });
      };
      
      // Error handling
      videoEl.addEventListener("error", () => {
        console.warn("Portfolio video failed to load, showing fallback image");
        videoEl.style.display = "none";
        if (fallbackImg) {
          fallbackImg.style.display = "block";
        }
      });

      videoEl.addEventListener("loadeddata", () => {
        console.log("Video loaded successfully");
      });

      // Preload video on desktop
      if (!isMobile) {
        videoEl.load(); // Start loading video immediately
      }

      // Create intersection observer for viewport visibility
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Wait a bit for user interaction if on mobile
            if (isMobile && !userHasInteracted) {
              // Wait for interaction, then try to play
              const playOnInteraction = () => {
                setTimeout(() => tryPlayVideo(), 100);
              };
              window.addEventListener("scroll", playOnInteraction, { passive: true, once: true });
              window.addEventListener("touchstart", playOnInteraction, { passive: true, once: true });
            } else if (!isMobile) {
              // Desktop: video is preloaded, just wait for hover to play
              // Don't autoplay on scroll for desktop
            } else {
              // Mobile after interaction
              tryPlayVideo();
            }
          } else {
            // Pause when out of view to save resources
            if (hasPlayedOnce && videoEl.style.display !== "none") {
              videoEl.pause();
            }
          }
        });
      }, { 
        threshold: 0.5,
        rootMargin: "50px"
      });
      
      videoObserver.observe(item);

      // Mobile: play on touch
      if (isMobile) {
        item.addEventListener("touchstart", (e) => {
          // Don't prevent default - we want click to still work for modal
          tryPlayVideo();
        }, { passive: true });
      } else {
        // Desktop: Play video on hover (muted) - video is already preloaded
        item.addEventListener("mouseenter", () => {
          tryPlayVideo();
        });

        // Pause video when not hovering
        item.addEventListener("mouseleave", () => {
          if (videoEl.style.display !== "none") {
            videoEl.pause();
            videoEl.currentTime = 0;
          }
        });
      }
    }

    // Click to open modal with sound - attached to the item itself
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const videoSrc = item.getAttribute("data-video");
      console.log("Clicked portfolio item, video source:", videoSrc);
      
      if (videoSrc) {
        openVideoModal(videoSrc);
      } else {
        console.error("No video source found in data-video attribute");
      }
    });
  });

  document.body.classList.add("loaded");
});

// Video Modal Functions
function openVideoModal(videoSrc) {
  console.log("Opening video modal with source:", videoSrc);
  
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  
  if (!modal || !modalVideo) {
    console.error("Modal or video element not found!");
    return;
  }
  
  // Pause all portfolio videos
  document.querySelectorAll(".portfolio-video").forEach(v => {
    v.pause();
    v.currentTime = 0;
  });
  
  // Set video source
  modalVideo.src = videoSrc;
  modalVideo.muted = false; // Enable sound
  modalVideo.controls = true;
  modalVideo.load();
  
  // Show modal
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  
  // Play video with sound after loading
  modalVideo.addEventListener("loadedmetadata", function playOnce() {
    modalVideo.play().then(() => {
      console.log("Video playing successfully");
    }).catch(err => {
      console.error("Modal video play failed:", err);
    });
    modalVideo.removeEventListener("loadedmetadata", playOnce);
  }, { once: true });
}

function closeVideoModal() {
  console.log("Closing video modal");
  
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  
  if (modal && modalVideo) {
    // Pause and reset video
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = "";
    
    // Hide modal
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Close modal on overlay click
document.addEventListener("click", (e) => {
  const modal = document.getElementById("videoModal");
  if (e.target.classList.contains("video-modal-overlay")) {
    closeVideoModal();
  }
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("videoModal");
    if (modal && modal.classList.contains("active")) {
      closeVideoModal();
    }
  }
});

// Expose closeVideoModal to global scope for inline onclick
window.closeVideoModal = closeVideoModal;

// Mobile menu toggle
function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  const menuBtn = document.querySelector(".mobile-menu-btn");
  
  if (navLinks) {
    navLinks.classList.toggle("mobile-active");
    
    // Animate hamburger icon
    if (menuBtn) {
      menuBtn.classList.toggle("active");
    }
  }
}
window.toggleMobileMenu = toggleMobileMenu;

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  const navLinks = document.querySelector(".nav-links");
  const menuBtn = document.querySelector(".mobile-menu-btn");
  
  if (
    navLinks &&
    navLinks.classList.contains("mobile-active") &&
    !e.target.closest("nav")
  ) {
    navLinks.classList.remove("mobile-active");
    if (menuBtn) {
      menuBtn.classList.remove("active");
    }
  }
});

// Performance optimization for low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
  document.documentElement.style.setProperty("--animation-duration", "0.2s");
}

// Accessibility: Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") document.body.classList.add("keyboard-navigation");
});
document.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-navigation");
});

// Lazy load images
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}