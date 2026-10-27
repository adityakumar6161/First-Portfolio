/**
 * THE FUTURE BUILDER — INTERACTIVE RUNTIME
 * Clean, modular Vanilla JavaScript for portfolio interaction
 */

(function () {
  "use strict";

  // Merged configuration object with sensible fallbacks
  const userConfig = window.PORTFOLIO_CONFIG || {};
  const SITE_CONFIG = {
    email: userConfig.email || "your.email@example.com",
    github: (userConfig.socials && userConfig.socials.github) || "https://github.com/your-username",
    linkedin: (userConfig.socials && userConfig.socials.linkedin) || "https://linkedin.com/in/your-username",
    studentName: userConfig.monogram || "AK",
    timezone: userConfig.timezone || "Asia/Kolkata",
    timezoneLabel: userConfig.timezoneLabel || "Campus Time",
  };

  // Sync email display in HTML with config
  const emailDisplayElem = document.getElementById("user-email-text");
  if (emailDisplayElem) {
    emailDisplayElem.textContent = SITE_CONFIG.email;
  }

  /* ==========================================================================
     1. Interactive 3D Geometric Wireframe Canvas
     ========================================================================== */
  const canvas = document.getElementById("hero-canvas");
  const coordsDisplay = document.getElementById("canvas-coords");
  const fpsDisplay = document.getElementById("fps-counter");

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let isCanvasVisible = true;
    let prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Responsive canvas dimensions
    const setupCanvasResolution = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupCanvasResolution();
    window.addEventListener("resize", setupCanvasResolution);

    // 3D Math & Geometry Definitions: Dual Nested Icosahedron + Orbital Rings
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawVertices = [
      [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
    ];

    // Normalize and scale
    const baseRadius = 110;
    const vertices = rawVertices.map(v => {
      const len = Math.hypot(v[0], v[1], v[2]);
      return [ (v[0] / len) * baseRadius, (v[1] / len) * baseRadius, (v[2] / len) * baseRadius ];
    });

    // Outer icosahedron edges
    const edges = [];
    const threshold = baseRadius * 1.15;
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const dist = Math.hypot(
          vertices[i][0] - vertices[j][0],
          vertices[i][1] - vertices[j][1],
          vertices[i][2] - vertices[j][2]
        );
        if (dist < threshold) {
          edges.push([i, j]);
        }
      }
    }

    // Inner core octahedron
    const coreRadius = 45;
    const coreVertices = [
      [coreRadius, 0, 0], [-coreRadius, 0, 0],
      [0, coreRadius, 0], [0, -coreRadius, 0],
      [0, 0, coreRadius], [0, 0, -coreRadius]
    ];
    const coreEdges = [
      [0, 2], [2, 1], [1, 3], [3, 0], // equatorial
      [0, 4], [2, 4], [1, 4], [3, 4], // top pyramid
      [0, 5], [2, 5], [1, 5], [3, 5]  // bottom pyramid
    ];

    // Rotation angles
    let rotX = 0.25;
    let rotY = 0.75;
    let rotZ = 0.15;
    let targetRotX = rotX;
    let targetRotY = rotY;

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Mouse drag interaction
    canvas.addEventListener("mousedown", (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) {
        // Subtle tilt on hover
        const rect = canvas.getBoundingClientRect();
        if (
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
        ) {
          const offsetX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const offsetY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          targetRotY = rotY + offsetX * 0.05;
          targetRotX = rotX - offsetY * 0.05;
        }
        return;
      }
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    // Touch support for mobile
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener("touchend", () => {
      isDragging = false;
    });

    window.addEventListener("touchmove", (e) => {
      if (isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastMouseX;
        const dy = e.touches[0].clientY - lastMouseY;
        rotY += dx * 0.012;
        rotX += dy * 0.012;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    // 3D rotation projection helper
    const projectPoint = (x, y, z, cx, cy, fov = 320) => {
      // Rotate around X
      let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
      let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);

      // Rotate around Y
      let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

      // Rotate around Z
      let x3 = x2 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
      let y3 = x2 * Math.sin(rotZ) + y1 * Math.cos(rotZ);

      const distance = fov / (fov + z2);
      return {
        x: cx + x3 * distance,
        y: cy + y3 * distance,
        z: z2,
        scale: distance
      };
    };

    // FPS calculation variables
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    // Render loop
    const render = (time) => {
      if (!isCanvasVisible) {
        requestAnimationFrame(render);
        return;
      }

      // Smooth auto-rotation if motion is enabled and not dragging
      if (!prefersReducedMotion && !isDragging) {
        rotY += 0.007;
        rotX += 0.003;
        rotZ += 0.002;
      }

      // Calculate FPS every 30 frames
      frameCount++;
      if (frameCount % 30 === 0) {
        const delta = (time - lastFrameTime) / 30;
        fps = Math.round(1000 / delta);
        lastFrameTime = time;
        if (fpsDisplay) fpsDisplay.textContent = `${Math.min(fps, 60)}.0 FPS`;
      }

      // Update HUD matrix coordinate readout
      if (coordsDisplay && frameCount % 6 === 0) {
        const degX = Math.round(((rotX % (Math.PI * 2)) * 180 / Math.PI + 360) % 360);
        const degY = Math.round(((rotY % (Math.PI * 2)) * 180 / Math.PI + 360) % 360);
        const degZ = Math.round(((rotZ % (Math.PI * 2)) * 180 / Math.PI + 360) % 360);
        coordsDisplay.textContent = `ROT: X:${degX.toString().padStart(3, "0")}° Y:${degY.toString().padStart(3, "0")}° Z:${degZ.toString().padStart(3, "0")}°`;
      }

      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw subtle orbital ring in background
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.45, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(41, 46, 40, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Project outer vertices
      const projectedOuter = vertices.map(v => projectPoint(v[0], v[1], v[2], cx, cy));

      // Draw outer edges with depth-based opacity
      edges.forEach(([i, j]) => {
        const p1 = projectedOuter[i];
        const p2 = projectedOuter[j];
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.12, Math.min(0.85, (avgZ + baseRadius) / (baseRadius * 2)));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(198, 255, 99, ${alpha * 0.75})`;
        ctx.lineWidth = alpha > 0.5 ? 1.5 : 0.8;
        ctx.stroke();
      });

      // Project inner core
      const projectedCore = coreVertices.map(v => projectPoint(v[0], v[1], v[2], cx, cy));

      // Draw inner core edges
      coreEdges.forEach(([i, j]) => {
        const p1 = projectedCore[i];
        const p2 = projectedCore[j];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = "rgba(242, 243, 238, 0.45)";
        ctx.lineWidth = 1.1;
        ctx.stroke();
      });

      // Connect inner core to select outer vertices (architectural tether)
      for (let k = 0; k < 6; k++) {
        const outerP = projectedOuter[k];
        const innerP = projectedCore[k % 6];
        ctx.beginPath();
        ctx.moveTo(innerP.x, innerP.y);
        ctx.lineTo(outerP.x, outerP.y);
        ctx.strokeStyle = "rgba(198, 255, 99, 0.12)";
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // Draw vertices (nodes)
      projectedOuter.forEach(p => {
        const radius = Math.max(1.8, p.scale * 3);
        const alpha = Math.max(0.2, (p.z + baseRadius) / (baseRadius * 2));

        // Subtle glow for frontal vertices
        if (p.z > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(198, 255, 99, ${alpha * 0.25})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 243, 238, ${Math.min(1, alpha + 0.2)})`;
        ctx.fill();
      });

      // Inner vertices
      projectedCore.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#C6FF63";
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    // Pause rendering when canvas is outside viewport
    const canvasObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isCanvasVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    canvasObserver.observe(canvas);

    requestAnimationFrame(render);
  }

  /* ==========================================================================
     2. Sticky Header Scrolled State
     ========================================================================== */
  const header = document.getElementById("header");
  const handleScroll = () => {
    if (window.scrollY > 25) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* ==========================================================================
     3. Active Nav Link on Scroll (IntersectionObserver)
     ========================================================================== */
  const navLinks = document.querySelectorAll(".nav-link, .mobile-link");
  const sections = document.querySelectorAll("section[id]");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (href === `#${id}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ==========================================================================
     4. Mobile Navigation Drawer Toggle
     ========================================================================== */
  const mobileToggle = document.getElementById("mobile-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileLinkItems = document.querySelectorAll(".mobile-link");

  const toggleMobileNav = (open) => {
    const isExpanded = open !== undefined ? open : mobileToggle.getAttribute("aria-expanded") === "true";
    const newState = !isExpanded;
    mobileToggle.setAttribute("aria-expanded", String(newState));
    mobileNav.setAttribute("aria-hidden", String(!newState));
  };

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", () => toggleMobileNav());

    // Close when clicking any mobile link
    mobileLinkItems.forEach((link) => {
      link.addEventListener("click", () => toggleMobileNav(false));
    });

    // Close on Escape key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileToggle.getAttribute("aria-expanded") === "true") {
        toggleMobileNav(false);
      }
    });
  }

  /* ==========================================================================
     5. Project Detail Specifications & Modal Window
     ========================================================================== */
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalContent = document.getElementById("modal-content");
  const modalTag = document.getElementById("modal-tag");
  const modalClose = document.getElementById("modal-close");
  const modalDismiss = document.getElementById("modal-dismiss-btn");
  const projectTriggers = document.querySelectorAll(".project-info-trigger");

  const PROJECT_DETAILS = {
    "modal-journal": {
      tag: "SPECIFICATION // PROJECT 001",
      title: "Tech & AI Journal — Engineering & Editorial Plan",
      description: "A deliberate exploration of recent artificial intelligence research papers, systems architecture, and engineering commentary. Rather than generic summaries, each piece analyzes practical mechanics.",
      sections: [
        {
          heading: "Planned Architecture",
          bullets: [
            "Static-site generation with lightweight Markdown frontmatter parsing.",
            "Local syntax highlighting with zero heavy external runtime scripts.",
            "Minimalist dark editorial aesthetic with strict typography hierarchy."
          ]
        },
        {
          heading: "Active Writing Pipeline",
          bullets: [
            "Article 01: 'Demystifying Attention: Vector transformations from scratch'.",
            "Article 02: 'What first-year CS curricula miss about modern software systems'.",
            "Article 03: 'Evaluating small language models for on-device utility'."
          ]
        },
        {
          heading: "Current Status",
          bullets: [
            "Content drafts currently in private GitHub repo; publishing site pipeline being structured."
          ]
        }
      ]
    },
    "modal-edtech": {
      tag: "SPECIFICATION // PROJECT 002",
      title: "College Discovery Platform — Architecture Concept",
      description: "An education-technology conceptual prototype designed to solve the fragmented, ad-cluttered experience of discovering university programs and understanding admissions criteria.",
      sections: [
        {
          heading: "Key Problem Framing",
          bullets: [
            "Prospective students face marketing brochures rather than structured data.",
            "Course curricula, faculty research focus, and cutoff benchmarks are often buried.",
            "Need for multi-dimensional comparison across parameters that actually matter."
          ]
        },
        {
          heading: "Proposed System Design",
          bullets: [
            "Normalized JSON relational schema for universities, degrees, and program specializations.",
            "Client-side multidimensional filtering using lightweight vector similarity exploration.",
            "Clean, accessible comparison matrices without sponsored bias or promotional noise."
          ]
        },
        {
          heading: "Current Stage",
          bullets: [
            "Schema modeling in progress; interface wireframes and evaluation criteria being formalized."
          ]
        }
      ]
    },
    "modal-quant": {
      tag: "SPECIFICATION // PROJECT 003",
      title: "Quantitative Research — Factor Analysis & Exploration",
      description: "A disciplined self-study curriculum and code laboratory applying statistical rigor, hypothesis formulation, and empirical testing to market data.",
      sections: [
        {
          heading: "Research Focus Areas",
          bullets: [
            "Factor definitions: Momentum, low-volatility, and valuation ratios.",
            "Data hygiene: Adjusting for survivorship bias and lookahead anomalies.",
            "Systematic evaluation: Information Coefficient (IC) and Sharpe Ratio calculations."
          ]
        },
        {
          heading: "Working Toolchain",
          bullets: [
            "Python scientific stack: NumPy, Pandas, SciPy for vector operations.",
            "Jupyter notebooks for exploratory data inspection and visualization.",
            "Clean tabular logging for backtest simulation logs and assumptions."
          ]
        },
        {
          heading: "Current Stage",
          bullets: [
            "Implementing baseline factor calculations on historical index constituents; reviewing academic papers."
          ]
        }
      ]
    }
  };

  const openModal = (modalKey) => {
    const data = PROJECT_DETAILS[modalKey];
    if (!data || !modalBackdrop || !modalContent) return;

    modalTag.textContent = data.tag;
    let html = `<h3>${data.title}</h3><p>${data.description}</p>`;

    data.sections.forEach((sec) => {
      html += `<div class="modal-section-title">${sec.heading}</div><ul class="modal-bullets">`;
      sec.bullets.forEach((bullet) => {
        html += `<li>${bullet}</li>`;
      });
      html += `</ul>`;
    });

    modalContent.innerHTML = html;
    modalBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (!modalBackdrop) return;
    modalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  projectTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modalKey = trigger.getAttribute("data-modal");
      openModal(modalKey);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalDismiss) modalDismiss.addEventListener("click", closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBackdrop && modalBackdrop.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });

  /* ==========================================================================
     6. Copy Email to Clipboard & Toast Notification
     ========================================================================== */
  const copyBtn = document.getElementById("copy-email-button");
  const copyLabel = document.getElementById("copy-label-text");
  const toast = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");
  let toastTimeout = null;

  const showToast = (message) => {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.add("active");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("active");
    }, 2800);
  };

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = SITE_CONFIG.email;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback
          const tempInput = document.createElement("textarea");
          tempInput.value = email;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
        }
        copyLabel.textContent = "Copied!";
        showToast(`Email copied: ${email}`);
        setTimeout(() => {
          copyLabel.textContent = "Copy Address";
        }, 2000);
      } catch (err) {
        showToast(`Email: ${email}`);
      }
    });
  }

  /* ==========================================================================
     7. Live Campus Time Clock
     ========================================================================== */
  const liveClockElement = document.getElementById("live-campus-time");
  const updateCampusTime = () => {
    if (!liveClockElement) return;
    try {
      const now = new Date();
      const options = {
        timeZone: SITE_CONFIG.timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const formatted = new Intl.DateTimeFormat("en-US", options).format(now);
      liveClockElement.textContent = `${formatted} (Campus Time)`;
    } catch (e) {
      liveClockElement.textContent = "IST (UTC +5:30)";
    }
  };

  updateCampusTime();
  setInterval(updateCampusTime, 1000);

  // Expose configuration in window for developer exploration
  window.AK_PORTFOLIO_CONFIG = SITE_CONFIG;
})();
