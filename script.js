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
const WEBGPU_MATRIX_SIZE = 256;
const CPU_MATRIX_SIZE = 128;
const WORKGROUP_SIZE = 8;

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
