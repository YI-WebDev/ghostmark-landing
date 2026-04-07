import {
  animate,
  createTimeline,
  splitText,
  stagger,
} from "./assets/vendor/anime.esm.min.js";

const siteConfig = {
  checkoutUrl: "",
  chromeStoreUrl: "",
  supportEmail: "",
  premiumPriceLabel: "GhostMark Premium ライセンス",
  billingLabel: "ライセンスキー配布",
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sectionTitleCache = new WeakMap();

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
      link.textContent = "Premium を購入";
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
      if (link.textContent.includes("@") || link.textContent.includes("確認事項")) {
        link.textContent = siteConfig.supportEmail;
      }
      return;
    }

    link.href = "#faq";
  });
}

function initReveal() {
  const elements = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
      animateSectionChildren(element);
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      animateSectionChildren(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  });

  elements.forEach((element) => observer.observe(element));
}

function initHeroParallax() {
  return;
}

function getSectionTitleSplitter(target) {
  if (sectionTitleCache.has(target)) return sectionTitleCache.get(target);

  const splitter = splitText(target, {
    words: {
      wrap: "clip",
      class: "split-word",
    },
    chars: false,
  });
  sectionTitleCache.set(target, splitter);
  return splitter;
}

function initHeroAnimation() {
  document.querySelector(".hero-copy")?.classList.add("is-visible");
  document.querySelector(".hero-visual")?.classList.add("is-visible");
}

function initHeroFlowLoop() {
  const stage = document.querySelector(".js-flow-stage");
  const theater = stage?.querySelector(".js-flow-theater");
  const steps = Array.from(stage?.querySelectorAll(".js-flow-step") ?? []);
  const note = stage?.querySelector(".js-flow-stage-note");
  const caption = stage?.querySelector(".js-flow-caption");
  const pill = stage?.querySelector(".js-flow-meta-pill");
  const counter = stage?.querySelector(".js-flow-counter");
  const beamLine = stage?.querySelector(".js-flow-beam-line");
  const source = stage?.querySelector(".js-flow-source");
  const sourceHotspot = stage?.querySelector(".js-flow-source-hotspot");
  const block = stage?.querySelector(".js-flow-block");
  const scanline = stage?.querySelector(".js-flow-scanline");
  const gate = stage?.querySelector(".js-flow-gate");
  const gateShell = stage?.querySelector(".flow-gate-shell");
  const gateHotspot = stage?.querySelector(".js-flow-gate-hotspot");
  const gateStatus = stage?.querySelector(".js-flow-gate-status");
  const target = stage?.querySelector(".js-flow-target");
  const targetHotspot = stage?.querySelector(".js-flow-target-hotspot");
  const targetCard = stage?.querySelector(".js-flow-target-card");
  const token = stage?.querySelector(".js-flow-token");

  if (
    !stage
    || !theater
    || !source
    || !sourceHotspot
    || !block
    || !scanline
    || !gate
    || !gateShell
    || !gateHotspot
    || !gateStatus
    || !target
    || !targetHotspot
    || !targetCard
    || !token
  ) {
    return;
  }

  const flowStates = [
    {
      note: "Watching normal tabs",
      caption: "1. Protected URL detected in a normal tab.",
      pill: "Normal tab blocked",
      counter: "01 / 03",
    },
    {
      note: "Waiting for verification",
      caption: "2. Unlock gate asks for the master or folder password.",
      pill: "Unlock required",
      counter: "02 / 03",
    },
    {
      note: "Handoff to incognito",
      caption: "3. Verified URL is handed to a separate incognito window.",
      pill: "Incognito open",
      counter: "03 / 03",
    },
  ];

  let restartId = 0;

  const setFlowState = (nextIndex) => {
    steps.forEach((step, index) => {
      step.classList.toggle("is-active", index === nextIndex);
    });

    if (note) note.textContent = flowStates[nextIndex].note;
    if (caption) caption.textContent = flowStates[nextIndex].caption;
    if (pill) pill.textContent = flowStates[nextIndex].pill;
    if (counter) counter.textContent = flowStates[nextIndex].counter;
  };

  const getTokenPosition = (targetNode) => {
    const theaterRect = theater.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();
    const tokenRect = token.getBoundingClientRect();

    return {
      left: targetRect.left - theaterRect.left + targetRect.width / 2 - tokenRect.width / 2,
      top: targetRect.top - theaterRect.top + targetRect.height / 2 - tokenRect.height / 2,
    };
  };

  const placeToken = (targetNode) => {
    const { left, top } = getTokenPosition(targetNode);
    token.style.left = `${left}px`;
    token.style.top = `${top}px`;
  };

  const resetScene = () => {
    source.classList.remove("is-alert");
    gate.classList.remove("is-active", "is-verified");
    target.classList.remove("is-open");

    setFlowState(0);
    placeToken(sourceHotspot);

    scanline.style.opacity = "0";
    scanline.style.transform = "translateX(-22%)";

    block.style.opacity = "0";
    block.style.transform = "scale(0.96)";

    gateShell.style.opacity = "0.58";
    gateShell.style.transform = "scale(0.94)";
    gateStatus.style.opacity = "0.42";
    gateStatus.style.transform = "scale(1)";

    targetCard.style.opacity = "0.16";
    targetCard.style.transform = "translateY(12px) scale(0.98)";

    if (beamLine) beamLine.style.transform = "scaleX(0)";

    token.style.opacity = "0";
    token.style.transform = "scale(1)";
  };

  const stopLoop = () => {
    if (!restartId) return;
    window.clearTimeout(restartId);
    restartId = 0;
  };

  const startLoop = () => {
    stopLoop();
    if (prefersReducedMotion) return;
    restartId = window.setTimeout(runScene, 5200);
  };

  const runScene = () => {
    stopLoop();
    resetScene();

    const sourcePosition = getTokenPosition(sourceHotspot);
    const gatePosition = getTokenPosition(gateHotspot);
    const targetPosition = getTokenPosition(targetHotspot);

    token.style.left = `${sourcePosition.left}px`;
    token.style.top = `${sourcePosition.top}px`;

    createTimeline({
      defaults: {
        ease: "outExpo",
      },
    })
      .add(scanline, {
        opacity: { from: 0, to: 1 },
        x: { from: "-22%", to: "118%" },
        duration: 760,
        ease: "inOutSine",
        onBegin: () => {
          setFlowState(0);
          source.classList.add("is-alert");
        },
      }, 0)
      .add(block, {
        opacity: { from: 0, to: 1 },
        scale: { from: 0.96, to: 1 },
        duration: 420,
      }, 240)
      .add(gateShell, {
        opacity: { from: 0.58, to: 1 },
        scale: { from: 0.94, to: 1 },
        duration: 520,
        onBegin: () => {
          setFlowState(1);
          gate.classList.add("is-active");
          token.style.opacity = "1";
        },
      }, 980)
      .add(beamLine, {
        scaleX: { from: 0, to: 0.5 },
        duration: 620,
        ease: "outCubic",
      }, 1040)
      .add(token, {
        left: gatePosition.left,
        top: gatePosition.top,
        duration: 760,
        ease: "inOutCubic",
      }, 1080)
      .add(gateStatus, {
        opacity: { from: 0.42, to: 1 },
        scale: { from: 0.94, to: 1 },
        duration: 360,
        onBegin: () => {
          gate.classList.add("is-verified");
        },
      }, 1660)
      .add(targetCard, {
        opacity: { from: 0.16, to: 1 },
        y: { from: 12, to: 0 },
        scale: { from: 0.98, to: 1 },
        duration: 620,
        onBegin: () => {
          setFlowState(2);
          target.classList.add("is-open");
        },
      }, 1980)
      .add(beamLine, {
        scaleX: { from: 0.5, to: 1 },
        duration: 720,
        ease: "outCubic",
      }, 1980)
      .add(token, {
        left: targetPosition.left,
        top: targetPosition.top,
        duration: 820,
        ease: "inOutCubic",
      }, 1980)
      .add(token, {
        opacity: { from: 1, to: 0 },
        scale: { from: 1, to: 0.92 },
        duration: 260,
      }, 2800)
      .init();

    startLoop();
  };

  window.addEventListener("resize", () => {
    resetScene();
    if (!prefersReducedMotion) runScene();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
      return;
    }

    if (!prefersReducedMotion) runScene();
  });

  if (prefersReducedMotion) {
    setFlowState(2);
    source.classList.add("is-alert");
    gate.classList.add("is-active", "is-verified");
    target.classList.add("is-open");
    block.style.opacity = "1";
    block.style.transform = "scale(1)";
    gateShell.style.opacity = "1";
    gateShell.style.transform = "scale(1)";
    gateStatus.style.opacity = "1";
    targetCard.style.opacity = "1";
    targetCard.style.transform = "none";
    if (beamLine) beamLine.style.transform = "scaleX(1)";
    token.style.opacity = "0";
    placeToken(targetHotspot);
    return;
  }

  runScene();
}

function animateSectionChildren(root) {
  if (root.dataset.motionDone === "true") return;
  root.dataset.motionDone = "true";

  const sectionHead = root.classList.contains("section-head") ? root : root.querySelector?.(".section-head");
  const sectionTitle = sectionHead?.querySelector(".js-section-title");

  if (sectionTitle && !prefersReducedMotion) {
    const splitter = getSectionTitleSplitter(sectionTitle);
    animate(splitter.words, {
      opacity: { from: 0 },
      y: { from: "1.05em" },
      rotateZ: { from: 4 },
      delay: stagger(60),
      ease: "outExpo",
      duration: 900,
    });
  }

  if (root.matches(".offer-grid")) {
    animate(root.querySelectorAll(".offer-copy p"), {
      opacity: { from: 0 },
      x: { from: -28 },
      delay: stagger(100),
      ease: "outExpo",
      duration: 760,
    });

    animate(root.querySelectorAll(".offer-meta-item"), {
      opacity: { from: 0 },
      x: { from: 42 },
      delay: stagger(120, { start: 140 }),
      ease: "outExpo",
      duration: 760,
    });
  }

  if (root.matches(".workflow-rail")) {
    animate(root.querySelectorAll(".workflow-step"), {
      opacity: { from: 0 },
      y: { from: 38 },
      scale: { from: 0.94 },
      delay: stagger(120),
      ease: "outExpo",
      duration: 760,
    });
  }

  if (root.matches(".showcase-copy")) {
    animate(root.querySelectorAll("p"), {
      opacity: { from: 0 },
      y: { from: 28 },
      delay: stagger(120),
      ease: "outExpo",
      duration: 760,
    });
  }

  if (root.matches(".showcase-strip")) {
    animate(root.querySelectorAll(".showcase-item"), {
      opacity: { from: 0 },
      x: { from: 36 },
      delay: stagger(110),
      ease: "outExpo",
      duration: 760,
    });
  }

  if (root.matches(".plan-shell")) {
    animate(root.querySelectorAll(".plan-side > *"), {
      opacity: { from: 0 },
      x: { from: -26 },
      delay: stagger(75),
      ease: "outExpo",
      duration: 760,
    });

    animate(root.querySelectorAll(".plan-fact-item"), {
      opacity: { from: 0 },
      x: { from: -18 },
      delay: stagger(110, { start: 220 }),
      ease: "outExpo",
      duration: 760,
    });

    animate(root.querySelectorAll(".plan-table-row"), {
      opacity: { from: 0 },
      x: { from: 46 },
      delay: stagger(70, { start: 180 }),
      ease: "outExpo",
      duration: 700,
    });
  }

  if (root.matches(".security-grid")) {
    animate(root.children, {
      opacity: { from: 0 },
      y: { from: 32 },
      delay: stagger(140),
      ease: "outExpo",
      duration: 760,
    });
  }

  if (root.matches(".faq-list")) {
    animate(root.querySelectorAll("details"), {
      opacity: { from: 0 },
      y: { from: 26 },
      delay: stagger(90),
      ease: "outExpo",
      duration: 700,
    });
  }

  if (root.matches(".section-cta")) {
    animate(root.querySelectorAll(".cta-shell > *"), {
      opacity: { from: 0 },
      y: { from: 26 },
      delay: stagger(90),
      ease: "outExpo",
      duration: 720,
    });
  }
}

function initAmbientLoops() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".offer-meta-item").forEach((item, index) => {
    animate(item, {
      x: index % 2 === 0 ? 5 : -5,
      duration: 2600 + index * 160,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });
  });

  document.querySelectorAll(".plan-fact-item").forEach((item, index) => {
    animate(item, {
      x: index % 2 === 0 ? -4 : 4,
      duration: 2800 + index * 180,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });
  });
}

function initSurfaceTilt() {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".js-tilt-surface").forEach((surface) => {
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      surface.style.transform = `perspective(1600px) rotateX(${py * -5}deg) rotateY(${px * 7}deg) translateY(-4px)`;
    });

    surface.addEventListener("pointerleave", () => {
      surface.style.transform = "";
    });
  });
}

function initHighlightSweeps() {
  if (prefersReducedMotion) return;

  const nodes = document.querySelectorAll(
    ".offer-grid, .plan-shell, .cta-shell, .plan-table-row"
  );

  nodes.forEach((node, index) => {
    const pulse = () => {
      node.classList.remove("is-sweeping");
      requestAnimationFrame(() => node.classList.add("is-sweeping"));
    };

    pulse();
    window.setInterval(pulse, 3200 + index * 140);
  });
}

applyConfig();
initHeroAnimation();
initHeroFlowLoop();
initReveal();
initHeroParallax();
initAmbientLoops();
initSurfaceTilt();
initHighlightSweeps();
