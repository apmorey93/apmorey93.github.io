const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const navToggle = $(".nav-toggle");
const mobileMenu = $("#mobile-menu");
const progress = $(".scroll-progress");
const resumeOpen = $("#resume-open");
const resumeModal = $("#resume-modal");
const infraOpen = $("#infra-open");
const infraModal = $("#infra-modal");
const root = document.documentElement;

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
  root.style.setProperty("--grid-y", `${(window.scrollY * 0.12).toFixed(2)}px`);
  root.style.setProperty("--grid-x", `${(window.scrollY * -0.045).toFixed(2)}px`);
};

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const parallaxTargets = $$("[data-parallax]");
const interactivePanels = $$(".system-card, .artifact-card, .timeline-row, .contact-panel");
let parallaxFrame = 0;

const updateParallax = () => {
  parallaxFrame = 0;
  if (reducedMotion) return;

  parallaxTargets.forEach((target) => {
    const depth = Number(target.dataset.parallax || 0);
    const rect = target.getBoundingClientRect();
    const centerDelta = window.innerHeight * 0.5 - (rect.top + rect.height * 0.5);
    const y = Math.max(-28, Math.min(28, centerDelta * depth));
    target.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
  });
};

const requestParallax = () => {
  if (parallaxFrame) return;
  parallaxFrame = requestAnimationFrame(updateParallax);
};

if (!reducedMotion && parallaxTargets.length) {
  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
  requestParallax();
}

if (!reducedMotion) {
  window.addEventListener(
    "pointermove",
    (event) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    },
    { passive: true }
  );

  interactivePanels.forEach((panel) => {
    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      panel.style.transform = `translate3d(${(x * 5).toFixed(2)}px, ${(y * 5).toFixed(2)}px, 0)`;
      panel.style.setProperty("--cell-activity", "0.065");
    });

    panel.addEventListener("pointerleave", () => {
      panel.style.transform = "";
      panel.style.removeProperty("--cell-activity");
    });
  });
}

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

$$("[data-count]").forEach((counter) => {
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

if (infraOpen && infraModal) {
  infraOpen.addEventListener("click", () => {
    if (typeof infraModal.showModal === "function") {
      infraModal.showModal();
      return;
    }

    infraModal.setAttribute("open", "");
  });
}

const SVG_NS = "http://www.w3.org/2000/svg";

const mathTokenSpecs = [
  { type: "COMMAND", regex: /^\\[a-zA-Z]+/ },
  { type: "LBRACE", regex: /^\{/ },
  { type: "RBRACE", regex: /^\}/ },
  { type: "SUBSCRIPT", regex: /^_/ },
  { type: "SUPERSCRIPT", regex: /^\^/ },
  { type: "NORM", regex: /^\|\|/ },
  { type: "OPERATOR", regex: /^[+\-=(),|]/ },
  { type: "IDENTIFIER", regex: /^[a-zA-Z0-9]+/ },
  { type: "WHITESPACE", regex: /^\s+/ }
];

const tokenizeMath = (input) => {
  const tokens = [];
  let source = input.trim();

  while (source.length > 0) {
    let matched = false;

    for (const spec of mathTokenSpecs) {
      const match = source.match(spec.regex);
      if (!match) continue;

      matched = true;
      if (spec.type !== "WHITESPACE") {
        tokens.push({ type: spec.type, value: match[0] });
      }
      source = source.slice(match[0].length);
      break;
    }

    if (!matched) {
      throw new Error(`Unexpected math token near "${source.slice(0, 12)}"`);
    }
  }

  return tokens;
};

class MathParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  peek() {
    return this.tokens[this.index];
  }

  consume(type) {
    const token = this.peek();
    if (!token || (type && token.type !== type)) {
      throw new Error(`Expected ${type || "token"}, received ${token ? token.type : "EOF"}`);
    }
    this.index += 1;
    return token;
  }

  parse() {
    const expression = this.parseExpression();
    if (this.peek()) {
      throw new Error(`Unexpected trailing token ${this.peek().value}`);
    }
    return expression;
  }

  parseExpression(stopType = "RBRACE") {
    const children = [];

    while (this.peek() && this.peek().type !== stopType) {
      let atom = this.parseAtom();

      while (this.peek() && (this.peek().type === "SUBSCRIPT" || this.peek().type === "SUPERSCRIPT")) {
        const scriptToken = this.consume();
        const script = this.parseScriptTarget();
        atom = this.attachScript(atom, scriptToken.type, script);
      }

      children.push(atom);
    }

    return { type: "Row", children };
  }

  parseAtom() {
    const token = this.consume();

    if (token.type === "LBRACE") {
      const child = this.parseExpression("RBRACE");
      this.consume("RBRACE");
      return { type: "Group", child };
    }

    if (token.type === "COMMAND") {
      const name = token.value.slice(1);
      if (name === "mathcal") {
        const child = this.parseScriptTarget();
        return { type: "Mathcal", child };
      }
      return { type: "Symbol", name };
    }

    if (token.type === "IDENTIFIER") {
      return { type: "Identifier", value: token.value };
    }

    if (token.type === "NORM") {
      return { type: "Operator", value: "||" };
    }

    if (token.type === "OPERATOR") {
      return { type: "Operator", value: token.value };
    }

    throw new Error(`Unexpected atom ${token.value}`);
  }

  parseScriptTarget() {
    if (this.peek() && this.peek().type === "LBRACE") {
      this.consume("LBRACE");
      const child = this.parseExpression("RBRACE");
      this.consume("RBRACE");
      return child;
    }

    return this.parseAtom();
  }

  attachScript(base, scriptType, script) {
    if (scriptType === "SUBSCRIPT") {
      if (base.type === "Superscript") {
        return { type: "Subsup", base: base.base, sub: script, sup: base.sup };
      }
      if (base.type === "Subsup") {
        return { ...base, sub: script };
      }
      return { type: "Subscript", base, sub: script };
    }

    if (base.type === "Subscript") {
      return { type: "Subsup", base: base.base, sub: base.sub, sup: script };
    }
    if (base.type === "Subsup") {
      return { ...base, sup: script };
    }
    return { type: "Superscript", base, sup: script };
  }
}

const glyphPaths = {
  lambda: {
    width: 24,
    height: 28,
    baseline: 22,
    d: "M5 23 L12 5 L20 23 M9 14 L3 23"
  },
  sum: {
    width: 27,
    height: 28,
    baseline: 22,
    d: "M22 5 H6 L15 14 L6 23 H23"
  },
  theta: {
    width: 24,
    height: 28,
    baseline: 22,
    d: "M12 5 C17 5 20 9 20 14 C20 19 17 23 12 23 C7 23 4 19 4 14 C4 9 7 5 12 5 Z M5.5 14 H18.5"
  },
  phi: {
    width: 24,
    height: 30,
    baseline: 23,
    d: "M12 3 V27 M12 8 C17 8 20 10.5 20 14.5 C20 18.5 17 21 12 21 C7 21 4 18.5 4 14.5 C4 10.5 7 8 12 8 Z"
  },
  mathcalL: {
    width: 28,
    height: 30,
    baseline: 23,
    d: "M19 6 C15 3 9 5 9 11 C9 14 12 15 14 12 C16 9 12 7 8 12 C4 17 6 24 13 24 C18 24 22 21 23 17 M12 23 H23"
  }
};

const shiftLayout = (layout, dx, dy) => ({
  width: layout.width,
  height: layout.height,
  baseline: layout.baseline,
  items: layout.items.map((item) => ({ ...item, x: item.x + dx, y: item.y + dy }))
});

const blankLayout = () => ({ width: 0, height: 0, baseline: 0, items: [] });

const pathLayout = (glyph, scale) => ({
  width: glyph.width * scale,
  height: glyph.height * scale,
  baseline: glyph.baseline * scale,
  items: [{ kind: "path", d: glyph.d, x: 0, y: 0, scale }]
});

const textLayout = (text, scale, role = "identifier") => {
  const size = 18 * scale;
  const width = Math.max(size * 0.6, text.length * size * 0.62 + (role === "operator" ? size * 0.32 : 0));
  return {
    width,
    height: 28 * scale,
    baseline: 21 * scale,
    items: [{ kind: "text", text, x: 0, y: 21 * scale, size }]
  };
};

const plainMathText = (node) => {
  if (!node) return "";
  if (node.type === "Identifier" || node.type === "Operator") return node.value;
  if (node.type === "Group") return plainMathText(node.child);
  if (node.type === "Row") return node.children.map(plainMathText).join("");
  return "";
};

const layoutMathNode = (node, scale = 1) => {
  if (!node) return blankLayout();

  if (node.type === "Row") {
    const childLayouts = node.children.map((child) => layoutMathNode(child, scale));
    if (childLayouts.length === 0) return blankLayout();

    const baseline = Math.max(...childLayouts.map((layout) => layout.baseline));
    const descent = Math.max(...childLayouts.map((layout) => layout.height - layout.baseline));
    const gap = 4 * scale;
    let x = 0;
    const items = [];

    childLayouts.forEach((layout, index) => {
      const shifted = shiftLayout(layout, x, baseline - layout.baseline);
      items.push(...shifted.items);
      x += layout.width + (index === childLayouts.length - 1 ? 0 : gap);
    });

    return { width: x, height: baseline + descent, baseline, items };
  }

  if (node.type === "Group") {
    return layoutMathNode(node.child, scale);
  }

  if (node.type === "Identifier") {
    return textLayout(node.value, scale);
  }

  if (node.type === "Operator") {
    return textLayout(node.value, scale, "operator");
  }

  if (node.type === "Symbol") {
    return glyphPaths[node.name] ? pathLayout(glyphPaths[node.name], scale) : textLayout(`\\${node.name}`, scale);
  }

  if (node.type === "Mathcal") {
    return plainMathText(node.child) === "L" ? pathLayout(glyphPaths.mathcalL, scale) : layoutMathNode(node.child, scale);
  }

  if (node.type === "Subscript") {
    const base = layoutMathNode(node.base, scale);
    const sub = layoutMathNode(node.sub, scale * 0.62);
    const subX = base.width + 1 * scale;
    const subY = base.baseline + 8 * scale - sub.baseline;
    const top = Math.min(0, subY);
    const yOffset = top < 0 ? -top : 0;
    const baseShift = shiftLayout(base, 0, yOffset);
    const subShift = shiftLayout(sub, subX, subY + yOffset);

    return {
      width: base.width + sub.width + 3 * scale,
      height: Math.max(base.height + yOffset, subY + yOffset + sub.height),
      baseline: base.baseline + yOffset,
      items: [...baseShift.items, ...subShift.items]
    };
  }

  if (node.type === "Superscript") {
    const base = layoutMathNode(node.base, scale);
    const sup = layoutMathNode(node.sup, scale * 0.62);
    const baseY = 5 * scale;
    const supShift = shiftLayout(sup, base.width + 1 * scale, 0);
    const baseShift = shiftLayout(base, 0, baseY);

    return {
      width: base.width + sup.width + 3 * scale,
      height: Math.max(baseY + base.height, sup.height),
      baseline: base.baseline + baseY,
      items: [...baseShift.items, ...supShift.items]
    };
  }

  if (node.type === "Subsup") {
    const base = layoutMathNode(node.base, scale);
    const sub = layoutMathNode(node.sub, scale * 0.62);
    const sup = layoutMathNode(node.sup, scale * 0.62);
    const scriptX = base.width + 1 * scale;
    const baseY = 5 * scale;
    const subY = baseY + base.baseline + 8 * scale - sub.baseline;
    const baseShift = shiftLayout(base, 0, baseY);
    const subShift = shiftLayout(sub, scriptX, subY);
    const supShift = shiftLayout(sup, scriptX, 0);

    return {
      width: base.width + Math.max(sub.width, sup.width) + 3 * scale,
      height: Math.max(baseY + base.height, subY + sub.height, sup.height),
      baseline: base.baseline + baseY,
      items: [...baseShift.items, ...supShift.items, ...subShift.items]
    };
  }

  return blankLayout();
};

const renderMathSvg = (ast, label) => {
  const layout = layoutMathNode(ast, 1);
  const padding = 10;
  const svg = document.createElementNS(SVG_NS, "svg");
  const width = Math.ceil(layout.width + padding * 2);
  const height = Math.ceil(layout.height + padding * 2);

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", label);

  layout.items.forEach((item) => {
    if (item.kind === "path") {
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", item.d);
      path.setAttribute("transform", `translate(${padding + item.x} ${padding + item.y}) scale(${item.scale})`);
      path.setAttribute("stroke-width", "1.8");
      path.setAttribute("vector-effect", "non-scaling-stroke");
      svg.append(path);
      return;
    }

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", String(padding + item.x));
    text.setAttribute("y", String(padding + item.y));
    text.setAttribute("font-size", String(item.size));
    text.textContent = item.text;
    svg.append(text);
  });

  return svg;
};

const countAstNodes = (node) => {
  if (!node) return 0;
  if (node.type === "Row") return 1 + node.children.reduce((total, child) => total + countAstNodes(child), 0);
  if (node.type === "Group" || node.type === "Mathcal") return 1 + countAstNodes(node.child);
  if (node.type === "Subscript") return 1 + countAstNodes(node.base) + countAstNodes(node.sub);
  if (node.type === "Superscript") return 1 + countAstNodes(node.base) + countAstNodes(node.sup);
  if (node.type === "Subsup") return 1 + countAstNodes(node.base) + countAstNodes(node.sub) + countAstNodes(node.sup);
  return 1;
};

$$("[data-math]").forEach((block) => {
  const source = block.dataset.math || "";

  try {
    const tokens = tokenizeMath(source);
    const ast = new MathParser(tokens).parse();
    const svg = renderMathSvg(ast, source);
    const meta = document.createElement("div");
    meta.className = "math-compiler-meta";
    meta.textContent = `LEXER:${tokens.length} TOKENS // AST:${countAstNodes(ast)} NODES // RENDERER:RAW_SVG_PATHS`;
    block.replaceChildren(svg, meta);
  } catch (error) {
    const fallback = document.createElement("div");
    fallback.className = "math-error";
    fallback.textContent = `MATH_COMPILER_FAULT: ${error.message}`;
    block.replaceChildren(fallback);
  }
});

const telemetryTargets = {
  status: $("#gpu-status"),
  matrix: $("#matrix-size"),
  buffer: $("#buffer-size"),
  workgroups: $("#workgroup-count"),
  dispatch: $("#dispatch-time"),
  checksum: $("#compute-checksum"),
  gflops: $("#gflops")
};

const computeCanvas = $("#compute-canvas");
const computeButton = $("#compute-rerun");
const computeTabs = $$(".compute-tab");
const computePanels = $$(".compute-panel");
const lifeCanvas = $("#life-canvas");
const dataFlowCanvas = $("#data-flow-canvas");
const lciCanvas = $("#lci-canvas");
const dataFlowTelemetry = {
  backend: $("#df-backend"),
  count: $("#df-count"),
  compute: $("#df-compute"),
  state: $("#df-state"),
  motion: $("#df-motion-status")
};
const lciControls = {
  latency: $("#lci-latency"),
  reliability: $("#lci-reliability"),
  latencyValue: $("#lci-latency-val"),
  reliabilityValue: $("#lci-reliability-val"),
  mstack: $("#lci-mstack-val"),
  standard: $("#lci-std-val"),
  mstackPhi: $("#lci-mstack-phi"),
  standardPhi: $("#lci-std-phi")
};
const lifeControls = {
  state: $("#life-state"),
  generation: $("#life-generation"),
  grid: $("#life-grid-size"),
  live: $("#life-live-count"),
  step: $("#life-step-time"),
  density: $("#life-density"),
  toggle: $("#life-toggle"),
  stepButton: $("#life-step"),
  random: $("#life-random"),
  clear: $("#life-clear")
};
const WEBGPU_MATRIX_SIZE = 256;
const CPU_MATRIX_SIZE = 128;
const WORKGROUP_SIZE = 8;
const LIFE_COLUMNS = 80;
const LIFE_ROWS = 48;
let dataFlowStarted = false;
let dataFlowStop = null;

const setActiveComputeTab = (tabName) => {
  computeTabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  computePanels.forEach((panel) => {
    const isActive = panel.id === `${tabName}-panel`;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });

  if (tabName === "life") {
    drawLife();
  }

  if (tabName === "flow") {
    ensureDataFlow();
  }

  if (tabName === "lci") {
    requestAnimationFrame(drawLCI);
  }
};

computeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveComputeTab(tab.dataset.tab || "matrix"));
});

const setDataFlowTelemetry = (key, value) => {
  if (dataFlowTelemetry[key]) dataFlowTelemetry[key].textContent = value;
};

const isDataFlowVisible = () => {
  const panel = $("#flow-panel");
  return Boolean(panel && !panel.hidden);
};

const isLciVisible = () => {
  const panel = $("#lci-panel");
  return Boolean(panel && !panel.hidden);
};

const syncDataFlowCanvas = (canvas) => {
  const parent = canvas.parentElement;
  const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.floor((rect.width || 960) * dpr));
  const height = Math.max(180, Math.floor((rect.height || 320) * dpr));
  const changed = canvas.width !== width || canvas.height !== height;

  if (changed) {
    canvas.width = width;
    canvas.height = height;
  }

  return { width, height, changed };
};

const paintDataFlowIdle = (canvas) => {
  const { width, height } = syncDataFlowCanvas(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }
};

async function ensureDataFlow() {
  if (dataFlowStarted || !dataFlowCanvas) return;
  dataFlowStarted = true;

  try {
    dataFlowStop = await initDataFlow();
  } catch (error) {
    console.warn("Data flow field failed to initialize.", error);
    setDataFlowTelemetry("backend", "FAULT");
    setDataFlowTelemetry("compute", "HALTED");
    setDataFlowTelemetry("state", "INIT_ERROR");
    paintDataFlowIdle(dataFlowCanvas);
  }
}

async function initDataFlow() {
  if (!dataFlowCanvas) return null;

  paintDataFlowIdle(dataFlowCanvas);
  setDataFlowTelemetry("backend", "INITIALIZING...");
  setDataFlowTelemetry("count", "--");
  setDataFlowTelemetry("compute", "--");
  setDataFlowTelemetry("state", "BOOTSTRAP");

  if (dataFlowTelemetry.motion) {
    dataFlowTelemetry.motion.hidden = true;
  }

  if (reducedMotion) {
    if (dataFlowTelemetry.motion) dataFlowTelemetry.motion.hidden = false;
    setDataFlowTelemetry("backend", "HALTED");
    setDataFlowTelemetry("count", "0");
    setDataFlowTelemetry("compute", "IDLE");
    setDataFlowTelemetry("state", "ACCESSIBILITY_LOCK");
    return null;
  }

  syncDataFlowCanvas(dataFlowCanvas);
  const pointer = {
    x: dataFlowCanvas.width * 0.5,
    y: dataFlowCanvas.height * 0.5,
    active: 0
  };

  const updatePointer = (event) => {
    const rect = dataFlowCanvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * dataFlowCanvas.width;
    pointer.y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * dataFlowCanvas.height;
    pointer.active = 1;
  };

  dataFlowCanvas.addEventListener("pointermove", updatePointer);
  dataFlowCanvas.addEventListener("pointerenter", updatePointer);
  dataFlowCanvas.addEventListener("pointerleave", () => {
    pointer.active = 0;
  });

  if (window.isSecureContext && navigator.gpu) {
    try {
      return await runWebGpuDataFlow(dataFlowCanvas, pointer);
    } catch (error) {
      console.warn("WebGPU data flow setup failed, falling back to CPU.", error);
    }
  }

  return runCpuDataFlow(dataFlowCanvas, pointer);
}

async function runWebGpuDataFlow(canvas, pointer) {
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) throw new Error("GPU_ADAPTER_UNAVAILABLE");

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) throw new Error("WEBGPU_CONTEXT_UNAVAILABLE");

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  const particleCount = 16384;
  const workgroupSize = 64;
  const particleData = new Float32Array(particleCount * 4);

  syncDataFlowCanvas(canvas);
  for (let index = 0; index < particleCount; index += 1) {
    const offset = index * 4;
    particleData[offset] = Math.random() * canvas.width;
    particleData[offset + 1] = Math.random() * canvas.height;
    particleData[offset + 2] = (Math.random() - 0.5) * 18;
    particleData[offset + 3] = (Math.random() - 0.5) * 18;
  }

  const computeShader = `
struct Particle {
  pos: vec2<f32>,
  vel: vec2<f32>,
}

struct Params {
  pointer: vec2<f32>,
  active: f32,
  dt: f32,
  res: vec2<f32>,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: Params;

@compute @workgroup_size(${workgroupSize})
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  if (i >= ${particleCount}u) {
    return;
  }

  var p = particles[i];

  if (params.active > 0.0) {
    let direction = params.pointer - p.pos;
    let distance = max(length(direction), 8.0);
    let force = normalize(direction) * (62000.0 / (distance * distance));
    p.vel += force * params.dt;
  }

  p.vel.x += sin((p.pos.y + f32(i % 17u)) * 0.012) * 1.8;
  p.vel.y += cos((p.pos.x + f32(i % 23u)) * 0.009) * 0.65;
  p.vel *= 0.962;
  p.pos += p.vel * params.dt;

  if (p.pos.x < 0.0) { p.pos.x = params.res.x; }
  if (p.pos.x > params.res.x) { p.pos.x = 0.0; }
  if (p.pos.y < 0.0) { p.pos.y = params.res.y; }
  if (p.pos.y > params.res.y) { p.pos.y = 0.0; }

  particles[i] = p;
}
`;

  const renderShader = `
struct Particle {
  pos: vec2<f32>,
  vel: vec2<f32>,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> resolution: vec2<f32>;

struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) speed: f32,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOut {
  let p = particles[vertexIndex];
  let ndc = (p.pos / resolution) * 2.0 - 1.0;
  var out: VertexOut;
  out.position = vec4<f32>(ndc.x, -ndc.y, 0.0, 1.0);
  out.speed = length(p.vel);
  return out;
}

@fragment
fn fs_main(@location(0) speed: f32) -> @location(0) vec4<f32> {
  let blue = vec3<f32>(0.49, 0.83, 0.99);
  let amber = vec3<f32>(0.96, 0.62, 0.04);
  let color = mix(blue, amber, clamp(speed * 0.038, 0.0, 1.0));
  return vec4<f32>(color, 0.72);
}
`;

  const particleBuffer = device.createBuffer({
    size: particleData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(particleBuffer, 0, particleData);

  const paramsBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  const resolutionBuffer = device.createBuffer({
    size: 8,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(resolutionBuffer, 0, new Float32Array([canvas.width, canvas.height]));

  const computePipeline = await device.createComputePipelineAsync({
    layout: "auto",
    compute: {
      module: device.createShaderModule({ code: computeShader }),
      entryPoint: "main"
    }
  });

  const renderPipeline = await device.createRenderPipelineAsync({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({ code: renderShader }),
      entryPoint: "vs_main"
    },
    fragment: {
      module: device.createShaderModule({ code: renderShader }),
      entryPoint: "fs_main",
      targets: [
        {
          format,
          blend: {
            color: { srcFactor: "src-alpha", dstFactor: "one", operation: "add" },
            alpha: { srcFactor: "one", dstFactor: "one", operation: "add" }
          }
        }
      ]
    },
    primitive: { topology: "point-list" }
  });

  const computeBindGroup = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: particleBuffer } },
      { binding: 1, resource: { buffer: paramsBuffer } }
    ]
  });

  const renderBindGroup = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: particleBuffer } },
      { binding: 1, resource: { buffer: resolutionBuffer } }
    ]
  });

  setDataFlowTelemetry("backend", "WEBGPU NATIVE");
  setDataFlowTelemetry("count", particleCount.toLocaleString("en-US"));
  setDataFlowTelemetry("compute", "WGSL_COMPUTE+POINT_LIST");
  setDataFlowTelemetry("state", "ACTIVE_FLOW");
  if (dataFlowTelemetry.backend) dataFlowTelemetry.backend.style.color = "#7dd3fc";

  let animationId = 0;
  let lastTime = performance.now();
  let frameCount = 0;

  const frame = (time) => {
    animationId = requestAnimationFrame(frame);

    if (!isDataFlowVisible()) {
      lastTime = time;
      return;
    }

    const size = syncDataFlowCanvas(canvas);
    if (size.changed) {
      context.configure({ device, format, alphaMode: "premultiplied" });
      device.queue.writeBuffer(resolutionBuffer, 0, new Float32Array([canvas.width, canvas.height]));
    }

    const dt = Math.min((time - lastTime) / 1000, 0.08);
    lastTime = time;
    device.queue.writeBuffer(
      paramsBuffer,
      0,
      new Float32Array([pointer.x, pointer.y, pointer.active, dt, canvas.width, canvas.height])
    );

    const encoder = device.createCommandEncoder();
    const computePass = encoder.beginComputePass();
    computePass.setPipeline(computePipeline);
    computePass.setBindGroup(0, computeBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(particleCount / workgroupSize));
    computePass.end();

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.008, g: 0.008, b: 0.008, a: 1 },
          loadOp: "clear",
          storeOp: "store"
        }
      ]
    });
    renderPass.setPipeline(renderPipeline);
    renderPass.setBindGroup(0, renderBindGroup);
    renderPass.draw(particleCount, 1, 0, 0);
    renderPass.end();

    device.queue.submit([encoder.finish()]);

    frameCount += 1;
    if (frameCount % 24 === 0) {
      setDataFlowTelemetry("compute", `${Math.round(dt * 1000)} ms // ZERO_READBACK`);
    }
  };

  device.lost.then(() => {
    setDataFlowTelemetry("state", "DEVICE_LOST");
  });

  animationId = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(animationId);
    particleBuffer.destroy();
    paramsBuffer.destroy();
    resolutionBuffer.destroy();
  };
}

function runCpuDataFlow(canvas, pointer) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_2D_UNAVAILABLE");

  const particleCount = 2048;
  const positions = new Float32Array(particleCount * 2);
  const velocities = new Float32Array(particleCount * 2);
  syncDataFlowCanvas(canvas);

  for (let index = 0; index < particleCount; index += 1) {
    positions[index * 2] = Math.random() * canvas.width;
    positions[index * 2 + 1] = Math.random() * canvas.height;
    velocities[index * 2] = (Math.random() - 0.5) * 14;
    velocities[index * 2 + 1] = (Math.random() - 0.5) * 14;
  }

  setDataFlowTelemetry("backend", "CPU FALLBACK");
  setDataFlowTelemetry("count", particleCount.toLocaleString("en-US"));
  setDataFlowTelemetry("compute", "JS_TYPED_ARRAY");
  setDataFlowTelemetry("state", "ACTIVE_FLOW");
  if (dataFlowTelemetry.backend) dataFlowTelemetry.backend.style.color = "#9ca3af";

  let animationId = 0;
  let lastTime = performance.now();
  let frameCount = 0;

  const frame = (time) => {
    animationId = requestAnimationFrame(frame);

    if (!isDataFlowVisible()) {
      lastTime = time;
      return;
    }

    syncDataFlowCanvas(canvas);
    const dt = Math.min((time - lastTime) / 1000, 0.08);
    lastTime = time;

    ctx.fillStyle = "rgba(2, 2, 2, 0.44)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < particleCount; index += 1) {
      const offset = index * 2;
      let x = positions[offset];
      let y = positions[offset + 1];
      let vx = velocities[offset];
      let vy = velocities[offset + 1];

      if (pointer.active) {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 8);
        const force = 62000 / (distance * distance);
        vx += (dx / distance) * force * dt;
        vy += (dy / distance) * force * dt;
      }

      vx += Math.sin((y + (index % 17)) * 0.012) * 1.8;
      vy += Math.cos((x + (index % 23)) * 0.009) * 0.65;
      vx *= 0.962;
      vy *= 0.962;
      x += vx * dt;
      y += vy * dt;

      if (x < 0) x = canvas.width;
      if (x > canvas.width) x = 0;
      if (y < 0) y = canvas.height;
      if (y > canvas.height) y = 0;

      positions[offset] = x;
      positions[offset + 1] = y;
      velocities[offset] = vx;
      velocities[offset + 1] = vy;

      const speed = Math.min(1, Math.sqrt(vx * vx + vy * vy) * 0.038);
      ctx.fillStyle =
        speed > 0.62 ? "rgba(245, 158, 11, 0.72)" : "rgba(125, 211, 252, 0.62)";
      ctx.fillRect(x, y, 2, 2);
    }

    frameCount += 1;
    if (frameCount % 24 === 0) {
      setDataFlowTelemetry("compute", `${Math.round(dt * 1000)} ms // MAIN_THREAD`);
    }
  };

  animationId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(animationId);
}

const syncLciCanvas = () => {
  if (!lciCanvas) return { width: 0, height: 0 };
  const rect = lciCanvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(360, Math.floor((rect.width || 640) * dpr));
  const height = Math.max(280, Math.floor((rect.height || 384) * dpr));

  if (lciCanvas.width !== width || lciCanvas.height !== height) {
    lciCanvas.width = width;
    lciCanvas.height = height;
  }

  return { width, height };
};

function drawLCI() {
  if (!lciCanvas) return;
  const ctx = lciCanvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = syncLciCanvas();
  const networkRtt = Number(lciControls.latency ? lciControls.latency.value : 120);
  const availabilityTargetPct = Number(lciControls.reliability ? lciControls.reliability.value : 99);
  const availabilityTarget = availabilityTargetPct / 100;
  const latencyTarget = 200;
  const beta = 20;
  const weights = { accuracy: 0.5, latency: 0.2, availability: 0.2, safety: 0.1 };
  const plot = {
    left: 52,
    right: width - 24,
    top: 26,
    bottom: height - 42
  };
  const plotWidth = plot.right - plot.left;
  const plotHeight = plot.bottom - plot.top;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothHinge = (value, threshold) => beta * Math.log(1 + Math.exp((value - threshold) / beta));
  const latencyScore = (latencyMs) => {
    const adjusted = latencyTarget / (latencyTarget + smoothHinge(latencyMs, latencyTarget));
    return clamp(adjusted, 0.05, 1);
  };
  const thresholdScore = (observed, target) => clamp(observed / target, 0.05, 1);
  const qosPhi = ({ accuracy, latencyMs, availability, safety }) => {
    const accuracyScore = thresholdScore(accuracy, 0.85);
    const availabilityScore = thresholdScore(availability, availabilityTarget);
    const safetyScore = thresholdScore(safety, 0.95);
    return (
      Math.pow(accuracyScore, weights.accuracy) *
      Math.pow(latencyScore(latencyMs), weights.latency) *
      Math.pow(availabilityScore, weights.availability) *
      Math.pow(safetyScore, weights.safety)
    );
  };
  const modelAt = (utilization, mode) => {
    const standard = mode === "standard";
    const umax = standard ? 0.92 : 0.96;
    const headroom = Math.max(0.025, umax - utilization);
    const queueTail = (standard ? 36 : 20) * Math.pow(utilization / headroom, standard ? 1.72 : 1.34);
    const networkMs = standard ? networkRtt : Math.max(8, networkRtt * 0.16);
    const baseLatency = standard ? 54 : 38;
    const latencyMs = baseLatency + networkMs + queueTail;
    const directCost =
      (standard ? 0.052 : 0.064) / Math.max(0.18, utilization) +
      (standard ? 0.016 : 0.012) +
      networkMs * (standard ? 0.00022 : 0.00004);
    const availability = clamp((standard ? 0.997 : 0.9993) - Math.pow(utilization, 4) * (standard ? 0.012 : 0.004), 0.88, 0.9999);
    const phi = qosPhi({
      accuracy: standard ? 0.872 : 0.876,
      latencyMs,
      availability,
      safety: standard ? 0.962 : 0.965
    });

    return { latencyMs, directCost, phi, lci: directCost / phi };
  };
  const utilizationAt = (index) => 0.2 + (index / 180) * 0.76;
  const maxCost = Math.max(
    ...Array.from({ length: 181 }, (_, index) =>
      Math.max(modelAt(utilizationAt(index), "standard").lci, modelAt(utilizationAt(index), "mstack").lci)
    )
  ) * 1.16;
  const toX = (utilization) => plot.left + ((utilization - 0.2) / 0.76) * plotWidth;
  const toY = (cost) => plot.bottom - (cost / maxCost) * plotHeight;

  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.11)";
  ctx.lineWidth = 1;

  for (let x = plot.left; x <= plot.right; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, plot.top);
    ctx.lineTo(x + 0.5, plot.bottom);
    ctx.stroke();
  }

  for (let y = plot.top; y <= plot.bottom; y += 40) {
    ctx.beginPath();
    ctx.moveTo(plot.left, y + 0.5);
    ctx.lineTo(plot.right, y + 0.5);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(229, 231, 235, 0.35)";
  ctx.beginPath();
  ctx.moveTo(plot.left, plot.top);
  ctx.lineTo(plot.left, plot.bottom);
  ctx.lineTo(plot.right, plot.bottom);
  ctx.stroke();

  const drawCurve = (mode, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let index = 0; index <= 180; index += 1) {
      const utilization = utilizationAt(index);
      const x = toX(utilization);
      const y = toY(modelAt(utilization, mode).lci);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  };

  drawCurve("standard", "#f59e0b");
  drawCurve("mstack", "#7dd3fc");

  ctx.font = "12px JetBrains Mono, SFMono-Regular, Consolas, monospace";
  ctx.fillStyle = "rgba(229, 231, 235, 0.78)";
  ctx.fillText("u=0.20", plot.left, height - 14);
  ctx.fillText("u=0.96", plot.right - 48, height - 14);
  ctx.fillText("LCI", 10, plot.top + 8);
  ctx.fillStyle = "#7dd3fc";
  ctx.fillText("M-STACK", plot.left + plotWidth * 0.18, toY(modelAt(0.48, "mstack").lci) - 10);
  ctx.fillStyle = "#f59e0b";
  ctx.fillText("STANDARD", plot.left + plotWidth * 0.58, toY(modelAt(0.62, "standard").lci) - 12);

  const mstackFinal = modelAt(0.72, "mstack");
  const standardFinal = modelAt(0.72, "standard");
  if (lciControls.latencyValue) lciControls.latencyValue.textContent = `${networkRtt.toFixed(0)} ms`;
  if (lciControls.reliabilityValue) lciControls.reliabilityValue.textContent = `${availabilityTargetPct.toFixed(2)}%`;
  if (lciControls.mstack) lciControls.mstack.textContent = `$${mstackFinal.lci.toFixed(3)}`;
  if (lciControls.standard) lciControls.standard.textContent = `$${standardFinal.lci.toFixed(3)}`;
  if (lciControls.mstackPhi) lciControls.mstackPhi.textContent = mstackFinal.phi.toFixed(3);
  if (lciControls.standardPhi) lciControls.standardPhi.textContent = standardFinal.phi.toFixed(3);
}

if (lciControls.latency && lciControls.reliability) {
  lciControls.latency.addEventListener("input", drawLCI);
  lciControls.reliability.addEventListener("input", drawLCI);
  window.addEventListener("resize", () => {
    if (isLciVisible()) drawLCI();
  });
}

const setTelemetry = (key, value) => {
  if (telemetryTargets[key]) telemetryTargets[key].textContent = value;
};

const makeFlatMatrix = (size, seed) => {
  const values = new Float32Array(size * size);
  for (let index = 0; index < values.length; index += 1) {
    values[index] = (((index * seed + seed * 13) % 257) - 128) / 128;
  }
  return values;
};

const makeGpuMatrix = (size, seed) => {
  const flat = makeFlatMatrix(size, seed);
  const matrix = new Float32Array(2 + flat.length);
  matrix[0] = size;
  matrix[1] = size;
  matrix.set(flat, 2);
  return matrix;
};

const calculateChecksum = (values) => {
  if (!values.length) return "0.0000";
  const stride = Math.max(1, Math.floor(values.length / 1024));
  let sum = 0;
  for (let index = 0; index < values.length; index += stride) {
    sum += values[index] * ((index % 17) + 1);
  }
  return sum.toFixed(4);
};

const formatGflops = (size, elapsedMs) => {
  if (elapsedMs <= 0) return "--";
  const operations = 2 * size * size * size;
  return (operations / (elapsedMs / 1000) / 1e9).toFixed(2);
};

const renderComputeSignature = (values, size, backend) => {
  if (!computeCanvas) return;
  const ctx = computeCanvas.getContext("2d");
  if (!ctx) return;

  const width = computeCanvas.width;
  const height = computeCanvas.height;
  const columns = 96;
  const rows = 30;
  const cellWidth = Math.ceil(width / columns);
  const cellHeight = Math.ceil(height / rows);
  const blueMode = backend.startsWith("WEBGPU");

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const matrixRow = Math.floor((row / rows) * size);
      const matrixColumn = Math.floor((column / columns) * size);
      const index = (matrixRow * size + matrixColumn) % values.length;
      const value = Math.abs(values[index] || 0);
      const intensity = Math.min(1, (value % 1.7) / 1.7);
      const alpha = 0.16 + intensity * 0.84;
      ctx.fillStyle = blueMode ? `rgba(125, 211, 252, ${alpha})` : `rgba(245, 158, 11, ${alpha})`;
      ctx.fillRect(column * cellWidth, row * cellHeight, Math.max(1, cellWidth - 1), Math.max(1, cellHeight - 1));
    }
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const MATMUL_WGSL = `
struct Matrix {
  size : vec2<f32>,
  numbers: array<f32>,
}

@group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
@group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
@group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
    return;
  }

  resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);
  let resultCell = vec2(global_id.x, global_id.y);
  var result = 0.0;
  for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
    let a = i + resultCell.x * u32(firstMatrix.size.y);
    let b = resultCell.y + i * u32(secondMatrix.size.y);
    result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
  }

  let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
  resultMatrix.numbers[index] = result;
}
`;

const runWebGpuMatmul = async () => {
  if (!window.isSecureContext || !navigator.gpu) {
    throw new Error("WEBGPU_UNAVAILABLE");
  }

  const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) throw new Error("GPU_ADAPTER_UNAVAILABLE");

  const device = await adapter.requestDevice();
  const size = WEBGPU_MATRIX_SIZE;
  const firstMatrix = makeGpuMatrix(size, 17);
  const secondMatrix = makeGpuMatrix(size, 29);
  const resultMatrix = new Float32Array(2 + size * size);
  resultMatrix[0] = size;
  resultMatrix[1] = size;
  const matrixBytes = firstMatrix.byteLength;

  const firstBuffer = device.createBuffer({
    size: matrixBytes,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });
  const secondBuffer = device.createBuffer({
    size: matrixBytes,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });
  const resultBuffer = device.createBuffer({
    size: matrixBytes,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
  });
  const readBuffer = device.createBuffer({
    size: matrixBytes,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  device.queue.writeBuffer(firstBuffer, 0, firstMatrix);
  device.queue.writeBuffer(secondBuffer, 0, secondMatrix);
  device.queue.writeBuffer(resultBuffer, 0, resultMatrix);

  const shaderModule = device.createShaderModule({ code: MATMUL_WGSL });
  const pipeline = await device.createComputePipelineAsync({
    layout: "auto",
    compute: { module: shaderModule, entryPoint: "main" }
  });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: firstBuffer } },
      { binding: 1, resource: { buffer: secondBuffer } },
      { binding: 2, resource: { buffer: resultBuffer } }
    ]
  });

  const workgroups = Math.ceil(size / WORKGROUP_SIZE);
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(workgroups, workgroups);
  pass.end();
  encoder.copyBufferToBuffer(resultBuffer, 0, readBuffer, 0, matrixBytes);

  const dispatchStart = performance.now();
  device.queue.submit([encoder.finish()]);
  await device.queue.onSubmittedWorkDone();
  const dispatchMs = performance.now() - dispatchStart;

  await readBuffer.mapAsync(GPUMapMode.READ);
  const mapped = new Float32Array(readBuffer.getMappedRange());
  const sampleLength = Math.min(size * size, 8192);
  const sample = new Float32Array(sampleLength);
  sample.set(mapped.subarray(2, 2 + sampleLength));
  readBuffer.unmap();

  firstBuffer.destroy();
  secondBuffer.destroy();
  resultBuffer.destroy();
  readBuffer.destroy();

  const adapterInfo = adapter.info || {};
  const adapterName = [adapterInfo.vendor, adapterInfo.architecture].filter(Boolean).join("/");

  return {
    backend: adapterName ? `WEBGPU / ${adapterName}` : "WEBGPU COMPUTE",
    size,
    bufferMb: ((matrixBytes * 4) / (1024 * 1024)).toFixed(2),
    workgroups: `${workgroups} x ${workgroups} @ ${WORKGROUP_SIZE}x${WORKGROUP_SIZE}`,
    dispatchMs,
    gflops: formatGflops(size, dispatchMs),
    checksum: calculateChecksum(sample),
    sample
  };
};

const runCpuMatmul = () => {
  const size = CPU_MATRIX_SIZE;
  const first = makeFlatMatrix(size, 17);
  const second = makeFlatMatrix(size, 29);
  const result = new Float32Array(size * size);
  const start = performance.now();

  for (let row = 0; row < size; row += 1) {
    const rowOffset = row * size;
    for (let column = 0; column < size; column += 1) {
      let sum = 0;
      for (let inner = 0; inner < size; inner += 1) {
        sum += first[rowOffset + inner] * second[inner * size + column];
      }
      result[rowOffset + column] = sum;
    }
  }

  const elapsed = performance.now() - start;

  return {
    backend: "CPU FALLBACK (TYPED ARRAY)",
    size,
    bufferMb: (((first.byteLength + second.byteLength + result.byteLength) / (1024 * 1024))).toFixed(2),
    workgroups: "1 HOST THREAD / ROW-MAJOR LOOP",
    dispatchMs: elapsed,
    gflops: formatGflops(size, elapsed),
    checksum: calculateChecksum(result),
    sample: result
  };
};

const paintIdleComputeCanvas = () => {
  if (!computeCanvas) return;
  const ctx = computeCanvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, computeCanvas.width, computeCanvas.height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  for (let x = 0; x <= computeCanvas.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, computeCanvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= computeCanvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(computeCanvas.width, y);
    ctx.stroke();
  }
};

const runComputeCell = async () => {
  if (!telemetryTargets.status) return;

  if (computeButton) {
    computeButton.disabled = true;
  }

  setTelemetry("status", "INITIALIZING...");
  setTelemetry("matrix", "--");
  setTelemetry("buffer", "--");
  setTelemetry("workgroups", "--");
  setTelemetry("dispatch", "--");
  setTelemetry("checksum", "--");
  setTelemetry("gflops", "--");

  let result;
  try {
    result = await runWebGpuMatmul();
  } catch (error) {
    result = runCpuMatmul();
  }

  setTelemetry("status", result.backend);
  setTelemetry("matrix", `${result.size} x ${result.size}`);
  setTelemetry("buffer", result.bufferMb);
  setTelemetry("workgroups", result.workgroups);
  setTelemetry("dispatch", result.dispatchMs.toFixed(2));
  setTelemetry("checksum", result.checksum);
  setTelemetry("gflops", result.gflops);
  renderComputeSignature(result.sample, result.size, result.backend);

  if (computeButton) {
    computeButton.disabled = false;
  }
};

if (telemetryTargets.status) {
  paintIdleComputeCanvas();
  runComputeCell();
  if (computeButton) {
    computeButton.addEventListener("click", runComputeCell);
  }
}

let lifeCells = new Uint8Array(LIFE_COLUMNS * LIFE_ROWS);
let lifeNext = new Uint8Array(LIFE_COLUMNS * LIFE_ROWS);
let lifeGeneration = 0;
let lifeRunning = false;
let lifeAnimationId = 0;
let lifeLastFrame = 0;
let lifeDragging = false;

const lifeIndex = (column, row) => row * LIFE_COLUMNS + column;

const countLifeNeighbors = (column, row) => {
  let neighbors = 0;

  for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
    for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
      if (xOffset === 0 && yOffset === 0) continue;

      const x = column + xOffset;
      const y = row + yOffset;
      if (x < 0 || x >= LIFE_COLUMNS || y < 0 || y >= LIFE_ROWS) continue;
      neighbors += lifeCells[lifeIndex(x, y)];
    }
  }

  return neighbors;
};

const countLiveCells = () => {
  let live = 0;
  for (let index = 0; index < lifeCells.length; index += 1) {
    live += lifeCells[index];
  }
  return live;
};

const updateLifeTelemetry = (stepMs = null) => {
  const live = countLiveCells();
  if (lifeControls.state) lifeControls.state.textContent = lifeRunning ? "RUNNING" : "PAUSED";
  if (lifeControls.generation) lifeControls.generation.textContent = String(lifeGeneration);
  if (lifeControls.grid) lifeControls.grid.textContent = `${LIFE_COLUMNS} x ${LIFE_ROWS}`;
  if (lifeControls.live) lifeControls.live.textContent = String(live);
  if (lifeControls.step) lifeControls.step.textContent = stepMs === null ? "--" : stepMs.toFixed(2);
  if (lifeControls.density) lifeControls.density.textContent = `${((live / lifeCells.length) * 100).toFixed(2)}%`;
  if (lifeControls.toggle) lifeControls.toggle.textContent = lifeRunning ? "PAUSE" : "RUN";
};

const drawLife = () => {
  if (!lifeCanvas) return;
  const ctx = lifeCanvas.getContext("2d");
  if (!ctx) return;

  const cellWidth = lifeCanvas.width / LIFE_COLUMNS;
  const cellHeight = lifeCanvas.height / LIFE_ROWS;

  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, lifeCanvas.width, lifeCanvas.height);

  for (let row = 0; row < LIFE_ROWS; row += 1) {
    for (let column = 0; column < LIFE_COLUMNS; column += 1) {
      if (!lifeCells[lifeIndex(column, row)]) continue;
      ctx.fillStyle = (column + row + lifeGeneration) % 11 === 0 ? "#f59e0b" : "#7dd3fc";
      ctx.fillRect(
        Math.floor(column * cellWidth),
        Math.floor(row * cellHeight),
        Math.ceil(cellWidth) - 1,
        Math.ceil(cellHeight) - 1
      );
    }
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  for (let column = 0; column <= LIFE_COLUMNS; column += 4) {
    const x = Math.floor(column * cellWidth) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, lifeCanvas.height);
    ctx.stroke();
  }
  for (let row = 0; row <= LIFE_ROWS; row += 4) {
    const y = Math.floor(row * cellHeight) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(lifeCanvas.width, y);
    ctx.stroke();
  }
};

const stepLife = () => {
  const start = performance.now();

  for (let row = 0; row < LIFE_ROWS; row += 1) {
    for (let column = 0; column < LIFE_COLUMNS; column += 1) {
      const index = lifeIndex(column, row);
      const live = lifeCells[index] === 1;
      const neighbors = countLifeNeighbors(column, row);
      lifeNext[index] = live ? Number(neighbors === 2 || neighbors === 3) : Number(neighbors === 3);
    }
  }

  [lifeCells, lifeNext] = [lifeNext, lifeCells];
  lifeNext.fill(0);
  lifeGeneration += 1;
  const elapsed = performance.now() - start;
  drawLife();
  updateLifeTelemetry(elapsed);
};

const animateLife = (timestamp) => {
  if (!lifeRunning) return;

  if (!lifeLastFrame || timestamp - lifeLastFrame >= 100) {
    stepLife();
    lifeLastFrame = timestamp;
  }

  lifeAnimationId = requestAnimationFrame(animateLife);
};

const setLifeRunning = (isRunning) => {
  lifeRunning = isRunning;
  updateLifeTelemetry();

  if (lifeRunning) {
    lifeLastFrame = 0;
    cancelAnimationFrame(lifeAnimationId);
    lifeAnimationId = requestAnimationFrame(animateLife);
  } else {
    cancelAnimationFrame(lifeAnimationId);
  }
};

const seedLife = () => {
  for (let row = 0; row < LIFE_ROWS; row += 1) {
    for (let column = 0; column < LIFE_COLUMNS; column += 1) {
      const centerBias =
        column > LIFE_COLUMNS * 0.16 &&
        column < LIFE_COLUMNS * 0.84 &&
        row > LIFE_ROWS * 0.16 &&
        row < LIFE_ROWS * 0.84;
      const deterministic = ((column * 17 + row * 31 + (column ^ row) * 7) % 100) / 100;
      lifeCells[lifeIndex(column, row)] = Number(centerBias && deterministic > 0.66);
    }
  }

  lifeGeneration = 0;
  drawLife();
  updateLifeTelemetry();
};

const clearLife = () => {
  setLifeRunning(false);
  lifeCells.fill(0);
  lifeNext.fill(0);
  lifeGeneration = 0;
  drawLife();
  updateLifeTelemetry();
};

const getLifeCellFromPointer = (event) => {
  const rect = lifeCanvas.getBoundingClientRect();
  const column = Math.floor(((event.clientX - rect.left) / rect.width) * LIFE_COLUMNS);
  const row = Math.floor(((event.clientY - rect.top) / rect.height) * LIFE_ROWS);
  return {
    column: Math.max(0, Math.min(LIFE_COLUMNS - 1, column)),
    row: Math.max(0, Math.min(LIFE_ROWS - 1, row))
  };
};

const setLifeCellFromPointer = (event, mode = "toggle") => {
  if (!lifeCanvas) return;
  const { column, row } = getLifeCellFromPointer(event);
  const index = lifeIndex(column, row);
  lifeCells[index] = mode === "paint" ? 1 : Number(!lifeCells[index]);
  drawLife();
  updateLifeTelemetry();
};

if (lifeCanvas) {
  seedLife();

  lifeCanvas.addEventListener("pointerdown", (event) => {
    lifeDragging = true;
    lifeCanvas.setPointerCapture(event.pointerId);
    setLifeCellFromPointer(event);
  });

  lifeCanvas.addEventListener("pointermove", (event) => {
    if (!lifeDragging) return;
    setLifeCellFromPointer(event, "paint");
  });

  lifeCanvas.addEventListener("pointerup", (event) => {
    lifeDragging = false;
    lifeCanvas.releasePointerCapture(event.pointerId);
  });

  lifeCanvas.addEventListener("pointerleave", () => {
    lifeDragging = false;
  });
}

if (lifeControls.toggle) {
  lifeControls.toggle.addEventListener("click", () => setLifeRunning(!lifeRunning));
}

if (lifeControls.stepButton) {
  lifeControls.stepButton.addEventListener("click", () => {
    setLifeRunning(false);
    stepLife();
  });
}

if (lifeControls.random) {
  lifeControls.random.addEventListener("click", () => {
    setLifeRunning(false);
    seedLife();
  });
}

if (lifeControls.clear) {
  lifeControls.clear.addEventListener("click", clearLife);
}
