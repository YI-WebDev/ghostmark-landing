import { animate, createTimeline, stagger } from "./assets/vendor/anime.esm.min.js";

const lang = document.documentElement.lang;
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const siteConfig = {
  checkoutUrl: "",
  chromeStoreUrl: "",
  supportEmail: "",
  premiumPriceLabel: lang === "ja" ? "NinjaMark Premium ライセンス" : "NinjaMark Premium license",
  billingLabel: lang === "ja" ? "ライセンスキー配布" : "License key delivery",
};

function applyConfig() {
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  const checkoutLinks = document.querySelectorAll(".js-checkout-link");
  const storeLinks = document.querySelectorAll(".js-store-link");
  const supportLinks = document.querySelectorAll(".js-support-link");
  const priceLabel = document.querySelector(".js-price-label");
  const billingLabel = document.querySelector(".js-billing-label");

  if (priceLabel) priceLabel.textContent = siteConfig.premiumPriceLabel;
  if (billingLabel) billingLabel.textContent = siteConfig.billingLabel;

  checkoutLinks.forEach((link) => {
    if (siteConfig.checkoutUrl) {
      link.href = siteConfig.checkoutUrl;
      link.removeAttribute("aria-disabled");
      link.classList.remove("is-disabled");
      if (link.tagName === "A") {
        link.target = "_blank";
        link.rel = "noopener";
      }
      link.textContent = lang === "ja" ? "Premium を購入" : "Get Premium";
      return;
    }

    link.href = "#premium";
    link.removeAttribute("aria-disabled");
    link.classList.remove("is-disabled");
  });

  storeLinks.forEach((link) => {
    if (siteConfig.chromeStoreUrl) {
      link.href = siteConfig.chromeStoreUrl;
      link.removeAttribute("aria-disabled");
      link.classList.remove("is-disabled");
      link.target = "_blank";
      link.rel = "noopener";
      return;
    }

    link.href = "#overview";
    link.removeAttribute("aria-disabled");
    link.classList.remove("is-disabled");
  });

  supportLinks.forEach((link) => {
    if (siteConfig.supportEmail) {
      link.href = `mailto:${siteConfig.supportEmail}`;
      const text = link.textContent.toLowerCase();
      if (text.includes("@") || text.includes("確認") || text.includes("support") || text.includes("pre-purchase")) {
        link.textContent = siteConfig.supportEmail;
      }
      return;
    }

    link.href = "#faq";
  });
}

function initCanvas() {
  if (REDUCED) return;

  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let raf = 0;
  let mouse = { x: 0, y: 0 };

  const MAX_DIST = 130;
  const SPEED = 0.22;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = (Math.random() - 0.5) * SPEED;
      this.r = Math.random() * 1.4 + 0.7;
      this.hue = Math.random() > 0.5 ? 252 : 175;
    }

    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d2 = dx * dx + dy * dy;

      if (d2 < 160 * 160 && d2 > 0) {
        const d = Math.sqrt(d2);
        const force = ((160 - d) / 160) * 0.45;
        this.vx += (dx / d) * force;
        this.vy += (dy / d) * force;
      }

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > SPEED * 2.8) {
        this.vx = (this.vx / speed) * SPEED * 2.8;
        this.vy = (this.vy / speed) * SPEED * 2.8;
      }

      this.vx += (Math.random() - 0.5) * 0.007;
      this.vy += (Math.random() - 0.5) * 0.007;
      this.vx *= 0.996;
      this.vy *= 0.996;
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},72%,72%,0.52)`;
      ctx.fill();
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    mouse = { x: width / 2, y: height / 2 };
    const count = Math.min(58, Math.floor((width * height) / 20000));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(135,120,255,${(1 - dist / MAX_DIST) * 0.17})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    raf = window.requestAnimationFrame(draw);
  }

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(raf);
    resize();
    draw();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(raf);
    } else {
      draw();
    }
  });

  resize();
  draw();
}

function initCursorGlow() {
  if (REDUCED) return;

  const glow = document.getElementById("cursorGlow");
  if (!glow) return;

  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;
  let targetX = currentX;
  let targetY = currentY;

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  const tick = () => {
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;
    window.requestAnimationFrame(tick);
  };

  tick();
}

function initHeroTitle() {
  const title = document.querySelector(".js-split-title");
  if (!title) return;

  const text = title.textContent ?? "";
  title.innerHTML = "";

  const chars = [];

  if (lang === "en") {
    const words = text.trim().split(/\s+/);
    words.forEach((word, wordIndex) => {
      const wordWrap = document.createElement("span");
      wordWrap.className = "word";

      [...word].forEach((char) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        wordWrap.appendChild(span);
        chars.push(span);
      });

      if (wordIndex < words.length - 1) {
        const space = document.createElement("span");
        space.className = "char";
        space.textContent = "\u00a0";
        wordWrap.appendChild(space);
        chars.push(space);
      }

      title.appendChild(wordWrap);
    });
  } else {
    [...text].forEach((char) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = char === " " ? "\u00a0" : char;
      title.appendChild(span);
      chars.push(span);
    });
  }

  if (REDUCED) {
    chars.forEach((char) => {
      char.style.opacity = "1";
    });
    return;
  }

  animate(chars, {
    opacity: { from: 0, to: 1 },
    translateY: { from: "0.7em", to: "0em" },
    delay: stagger(38, { start: 380 }),
    duration: 980,
    ease: "outExpo",
  });
}

function initHeroFadeIns() {
  document.querySelectorAll(".js-fade-in").forEach((element) => {
    const delay = parseInt(element.dataset.delay || "0", 10);
    if (REDUCED) {
      element.classList.add("is-visible");
      return;
    }

    animate(element, {
      opacity: { from: 0, to: 1 },
      translateY: { from: 18, to: 0 },
      delay,
      duration: 820,
      ease: "outExpo",
    });

    window.setTimeout(() => {
      element.classList.add("is-visible");
    }, delay + 820);
  });
}

function initHeroBrowserLoop() {
  const chrome = document.querySelector(".js-chrome");
  const blockOverlay = document.querySelector(".js-block-overlay");
  const authGate = document.querySelector(".js-auth-gate");
  const incognito = document.querySelector(".js-incognito");
  const beam = document.querySelector(".js-beam");
  const authDots = [...document.querySelectorAll(".auth-dot")];
  const authStatus = document.querySelector(".js-auth-status");
  const pageSkel = document.querySelector(".js-page-skel");

  if (!chrome || !blockOverlay || !authGate || !incognito) {
    return null;
  }

  let loopId = 0;
  let pauseUntil = 0;

  const isMobile = () => window.innerWidth < 780;

  const resetState = () => {
    chrome.classList.remove("is-blocked", "is-shake", "is-authing", "is-success");
    blockOverlay.style.opacity = "0";
    blockOverlay.style.transform = "scale(0.96)";
    authGate.style.opacity = "0";
    authGate.style.transform = "scale(0.94) translateY(8px)";
    incognito.style.opacity = "0";
    incognito.style.transform = `translate(${isMobile() ? 0 : 28}px, 14px) scale(0.9)`;
    if (beam) {
      beam.style.opacity = "0";
      beam.style.transform = "scaleX(0)";
    }
    if (pageSkel) {
      pageSkel.style.opacity = "1";
      pageSkel.style.filter = "";
    }
    authDots.forEach((dot) => {
      dot.style.opacity = "0";
      dot.style.transform = "scale(0.5)";
    });
    if (authStatus) authStatus.style.opacity = "0";
  };

  const showPhase = (phase) => {
    resetState();

    if (phase === 1) {
      chrome.classList.add("is-blocked");
      if (pageSkel) {
        pageSkel.style.opacity = "0.24";
        pageSkel.style.filter = "blur(2px) saturate(.3)";
      }
      animate(blockOverlay, {
        opacity: { from: 0, to: 1 },
        scale: { from: 0.96, to: 1 },
        duration: 380,
        ease: "outCubic",
      });
      return;
    }

    if (phase === 2) {
      chrome.classList.add("is-authing");
      animate(authGate, {
        opacity: { from: 0, to: 1 },
        scale: { from: 0.94, to: 1 },
        translateY: { from: 8, to: 0 },
        duration: 380,
        ease: "outCubic",
      });
      authDots.forEach((dot, index) => {
        animate(dot, {
          opacity: { from: 0, to: 1 },
          scale: { from: 0.5, to: 1 },
          delay: index * 80,
          duration: 130,
          ease: "outCubic",
        });
      });
      return;
    }

    if (phase === 3) {
      chrome.classList.add("is-success");
      animate(incognito, {
        opacity: { from: 0, to: 1 },
        translateX: { from: isMobile() ? 0 : 28, to: 0 },
        translateY: { from: 14, to: 0 },
        scale: { from: 0.9, to: 1 },
        duration: 460,
        ease: "outCubic",
      });
      if (authStatus) {
        animate(authStatus, {
          opacity: { from: 0, to: 1 },
          duration: 300,
          delay: 180,
        });
      }
    }
  };

  const scheduleNext = (delay) => {
    window.clearTimeout(loopId);
    loopId = window.setTimeout(() => {
      if (Date.now() < pauseUntil) {
        scheduleNext(1000);
        return;
      }
      runCycle();
    }, delay);
  };

  const runCycle = () => {
    window.clearTimeout(loopId);
    resetState();

    const timeline = createTimeline({ defaults: { ease: "outExpo" } });

    timeline.add(chrome, {
      duration: 200,
      onBegin: () => chrome.classList.add("is-blocked"),
    }, 700);

    if (pageSkel) {
      timeline.add(pageSkel, {
        opacity: { from: 1, to: 0.24 },
        duration: 380,
        ease: "inOutSine",
      }, 900);
    }

    timeline.add(blockOverlay, {
      opacity: { from: 0, to: 1 },
      scale: { from: 0.96, to: 1 },
      duration: 460,
      ease: "outCubic",
      onBegin: () => {
        chrome.classList.add("is-shake");
        window.setTimeout(() => chrome.classList.remove("is-shake"), 400);
      },
    }, 1100);

    timeline.add(blockOverlay, { duration: 640 }, 1560);

    timeline.add(blockOverlay, {
      opacity: { from: 1, to: 0 },
      scale: { from: 1, to: 0.98 },
      duration: 300,
      ease: "inOutSine",
    }, 2200);

    timeline.add(chrome, {
      duration: 100,
      onBegin: () => {
        chrome.classList.remove("is-blocked");
        chrome.classList.add("is-authing");
      },
    }, 2200);

    timeline.add(authGate, {
      opacity: { from: 0, to: 1 },
      scale: { from: 0.94, to: 1 },
      translateY: { from: 8, to: 0 },
      duration: 480,
      ease: "outCubic",
    }, 2360);

    authDots.forEach((dot, index) => {
      timeline.add(dot, {
        opacity: { from: 0, to: 1 },
        scale: { from: 0.5, to: 1 },
        duration: 160,
        ease: "outCubic",
      }, 2840 + index * 95);
    });

    if (authStatus) {
      timeline.add(authStatus, {
        opacity: { from: 0, to: 1 },
        duration: 320,
      }, 3690);
    }

    if (beam) {
      timeline.add(beam, {
        opacity: { from: 0, to: 0.9 },
        scaleX: { from: 0, to: 1 },
        duration: 500,
        ease: "outCubic",
      }, 3980);
    }

    timeline.add(authGate, {
      opacity: { from: 1, to: 0 },
      scale: { from: 1, to: 0.96 },
      duration: 340,
      ease: "inOutSine",
      onBegin: () => {
        chrome.classList.remove("is-authing");
        chrome.classList.add("is-success");
      },
    }, 4180);

    timeline.add(incognito, {
      opacity: { from: 0, to: 1 },
      translateX: { from: isMobile() ? 0 : 28, to: 0 },
      translateY: { from: 14, to: 0 },
      scale: { from: 0.9, to: 1 },
      duration: 560,
      ease: "outCubic",
    }, 4400);

    if (beam) {
      timeline.add(beam, {
        opacity: { from: 0.9, to: 0 },
        duration: 380,
      }, 4840);
    }

    timeline.add(incognito, { duration: 900 }, 4960);

    timeline.add(incognito, {
      opacity: { from: 1, to: 0 },
      translateX: { from: 0, to: isMobile() ? 0 : -16 },
      translateY: { from: 0, to: 8 },
      scale: { from: 1, to: 0.92 },
      duration: 420,
      ease: "inOutSine",
    }, 5860);

    timeline.add(chrome, {
      duration: 200,
      onBegin: () => chrome.classList.remove("is-success"),
    }, 6020);

    timeline.init();
    scheduleNext(7400);
  };

  animate(chrome, {
    opacity: { from: 0, to: 1 },
    translateY: { from: 36, to: 0 },
    scale: { from: 0.97, to: 1 },
    delay: 280,
    duration: 800,
    ease: "outExpo",
  });

  if (REDUCED) {
    return {
      setPhase: showPhase,
      pause: () => {},
    };
  }

  scheduleNext(1300);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(loopId);
      return;
    }
    scheduleNext(900);
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(loopId);
    resetState();
    scheduleNext(800);
  });

  return {
    setPhase: showPhase,
    pause: (ms = 6000) => {
      pauseUntil = Date.now() + ms;
      scheduleNext(ms);
    },
  };
}

function animateReveal(root) {
  if (root.dataset.animated === "1") return;
  root.dataset.animated = "1";

  if (REDUCED) {
    if (root.matches(".workflow-timeline")) {
      root.querySelectorAll(".timeline-step").forEach((step) => step.classList.add("tl-active"));
      root.querySelectorAll(".timeline-num").forEach((num) => num.classList.add("tl-lit"));
    }
    return;
  }

  const title = root.querySelector("h2");
  if (root.matches(".section-head") && title) {
    animate(title, {
      opacity: { from: 0, to: 1 },
      translateY: { from: 28, to: 0 },
      duration: 900,
      delay: 80,
      ease: "outExpo",
    });
  }

  if (root.matches(".feature-strip")) {
    animate([...root.querySelectorAll(".feature-strip-item")], {
      opacity: { from: 0, to: 1 },
      translateY: { from: 20, to: 0 },
      delay: stagger(70),
      duration: 640,
      ease: "outExpo",
    });
  }

  if (root.matches(".overview-grid")) {
    animate(root.querySelectorAll(".overview-copy p"), {
      opacity: { from: 0, to: 1 },
      translateX: { from: -24, to: 0 },
      delay: stagger(110),
      duration: 720,
      ease: "outExpo",
    });
    animate(root.querySelectorAll(".meta-item"), {
      opacity: { from: 0, to: 1 },
      translateX: { from: 28, to: 0 },
      delay: stagger(90, { start: 200 }),
      duration: 720,
      ease: "outExpo",
    });
  }

  if (root.matches(".workflow-timeline")) {
    const steps = [...root.querySelectorAll(".timeline-step")];
    const nums = [...root.querySelectorAll(".timeline-num")];
    steps.forEach((step, index) => {
      const delay = 180 + index * 320;
      window.setTimeout(() => {
        nums[index]?.classList.add("tl-lit");
        step.classList.add("tl-active");
      }, delay);
    });
  }

  if (root.matches(".features-grid")) {
    animate([...root.querySelectorAll(".feature-card")], {
      opacity: { from: 0, to: 1 },
      translateY: { from: 28, to: 0 },
      scale: { from: 0.97, to: 1 },
      delay: stagger(80),
      duration: 700,
      ease: "outExpo",
    });
  }

  if (root.matches(".showcase-copy")) {
    animate(root.querySelectorAll("p"), {
      opacity: { from: 0, to: 1 },
      translateY: { from: 24, to: 0 },
      delay: stagger(120),
      duration: 720,
      ease: "outExpo",
    });
  }

  if (root.matches(".showcase-strip")) {
    animate(root.querySelectorAll(".showcase-item"), {
      opacity: { from: 0, to: 1 },
      translateX: { from: 36, to: 0 },
      delay: stagger(100),
      duration: 700,
      ease: "outExpo",
    });
  }

  if (root.matches(".plan-shell")) {
    animate(root.querySelectorAll(".plan-side > *"), {
      opacity: { from: 0, to: 1 },
      translateX: { from: -26, to: 0 },
      delay: stagger(65),
      duration: 720,
      ease: "outExpo",
    });
    animate(root.querySelectorAll(".plan-row"), {
      opacity: { from: 0, to: 1 },
      translateX: { from: 40, to: 0 },
      delay: stagger(55, { start: 200 }),
      duration: 660,
      ease: "outExpo",
    });
  }

  if (root.matches(".security-grid")) {
    animate([...root.children], {
      opacity: { from: 0, to: 1 },
      translateY: { from: 28, to: 0 },
      delay: stagger(150),
      duration: 740,
      ease: "outExpo",
    });
  }

  if (root.matches(".faq-list")) {
    animate(root.querySelectorAll(".faq-item"), {
      opacity: { from: 0, to: 1 },
      translateY: { from: 18, to: 0 },
      delay: stagger(65),
      duration: 640,
      ease: "outExpo",
    });
  }

  if (root.matches(".section-cta")) {
    animate(root.querySelectorAll(".cta-shell > *"), {
      opacity: { from: 0, to: 1 },
      translateY: { from: 22, to: 0 },
      delay: stagger(80),
      duration: 700,
      ease: "outExpo",
    });
  }
}

function initScrollReveal() {
  const elements = document.querySelectorAll(".js-reveal");
  if (!("IntersectionObserver" in window) || REDUCED) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
      animateReveal(element);
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      animateReveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.13,
    rootMargin: "0px 0px -5% 0px",
  });

  elements.forEach((element) => observer.observe(element));
}

function initTilt() {
  if (REDUCED) return;

  document.querySelectorAll(".js-tilt").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform = `perspective(1400px) rotateX(${py * -5}deg) rotateY(${px * 7}deg) translateY(-4px)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

function initShimmer() {
  if (REDUCED) return;

  document.querySelectorAll(".plan-row--premium").forEach((row, index) => {
    const pulse = () => {
      animate(row, {
        backgroundColor: [
          "rgba(123,111,255,0.08)",
          "rgba(123,111,255,0.16)",
          "rgba(123,111,255,0.08)",
        ],
        duration: 1800,
        ease: "inOutSine",
      });
    };

    window.setTimeout(pulse, index * 300);
    window.setInterval(pulse, 3200 + index * 220);
  });
}

function initInteractiveDemo(heroController) {
  const buttons = [...document.querySelectorAll(".js-demo-btn")];
  if (!buttons.length || !heroController) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((candidate) => {
        candidate.classList.toggle("is-active", candidate === button);
      });

      heroController.setPhase(Number(button.dataset.phase));
      heroController.pause(6500);
    });
  });
}

function initNav() {
  const nav = document.querySelector(".nav");
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === id);
      });
    });
  }, {
    rootMargin: "-30% 0px -60% 0px",
    threshold: 0,
  });

  sections.forEach((section) => observer.observe(section));
}

applyConfig();
initNav();
initCanvas();
initCursorGlow();
initHeroTitle();
initHeroFadeIns();
const heroController = initHeroBrowserLoop();
initInteractiveDemo(heroController);
initScrollReveal();
initTilt();
initShimmer();
