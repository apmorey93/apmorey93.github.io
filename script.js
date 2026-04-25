const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const navToggle = $(".nav-toggle");
const mobileMenu = $("#mobile-menu");
const progress = $(".scroll-progress");
const resumeOpen = $("#resume-open");
const resumeModal = $("#resume-modal");
const infraOpen = $("#infra-open");
const infraModal = $("#infra-modal");
const cliOverlay = $("#cli-overlay");
const cliOutput = $("#cli-output");
const cliForm = $("#cli-form");
const cliInput = $("#cli-input");
const cliClose = $("#cli-close");
const cliLogin = $("#cli-login");
const cliMobileOpen = $("#cli-mobile-open");
const root = document.documentElement;

const reducedMotion =
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const trackEvent = (name, payload = {}) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }

  window.dispatchEvent(new CustomEvent(name, { detail: payload }));
};

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

const cliLines = [];
const cliHistory = [];
let cliHistoryIndex = 0;
let cliWriteTimer = 0;

const cliCommands = [
  "whoami",
  "ls",
  "cat resume.pdf",
  "cat patent_12172378.txt",
  "ping adityamorey.com",
  "ssh adi@nvidia.com",
  "sudo rm -rf /",
  "uname -a",
  "top",
  "cat /etc/hosts",
  "history",
  "man adi",
  "neofetch",
  "help",
  "clear",
  "exit",
  "matrix",
  "scan",
  "fault",
  "lci",
  "floorplan",
  "life",
  "patent"
];

const cliCommandOutput = {
  whoami: `adi
// senior dfx methodology engineer
// ai/hpc silicon // nvidia corporation
// san jose, ca`,
  ls: `drwxr-xr-x  research/
drwxr-xr-x  artifacts/
drwxr-xr-x  systems/
-rw-r--r--  resume.pdf          [CONTROLLED ACCESS]
-rw-r--r--  lci_paper.pdf       [PUBLIC // SSRN]
-rw-r--r--  patent_12172378.txt [USPTO REGISTERED]
-rw-r--r--  nead_arch.md        [IN DEVELOPMENT]
-rwx------  cuverif.bin         [PROPRIETARY]`,
  "cat resume.pdf": `ERROR: resume.pdf requires authentication
HINT: fastest path is adityamorey1723@gmail.com
// or just ask nicely`,
  "cat patent_12172378.txt": `US PATENT: US-12172378-B1
STATUS: GRANTED
INVENTOR: ADITYA MOREY
DOMAIN: [REDACTED PENDING REVIEW]
USPTO: patents.google.com/patent/US12172378B1
// this one's real`,
  "ping adityamorey.com": `PING adityamorey.com (104.21.x.x): 56 bytes
64 bytes from 104.21.x.x: icmp_seq=0 ttl=57 time=1.337 ms
64 bytes from 104.21.x.x: icmp_seq=1 ttl=57 time=1.337 ms
64 bytes from 104.21.x.x: icmp_seq=2 ttl=57 time=1.337 ms
// round trip complete. you're already here.`,
  "ssh adi@nvidia.com": `Connecting to adi@nvidia.com...
Permission denied (publickey,gssapi-keyex,gssapi-with-mic)
// as expected. try adityamorey1723@gmail.com instead.`,
  "sudo rm -rf /": `adi is not in the sudoers file.
This incident will be reported.
// nice try. this is a portfolio site, not a prod cluster.`,
  "uname -a": `DFX-OS 5.15.0-dfx-amd64 #1 SMP PREEMPT
IEEE-1149.1 COMPLIANT // JTAG ACCESSIBLE
SCAN CHAINS: 47 LOADED
BIST STATUS: PASS`,
  top: `PID   PROCESS              CPU%   MEM
001   scan_methodology     88.2   2.1GB
002   silicon_debug        44.1   1.3GB
003   lci_research         31.7   890MB
004   charcoal_studies      2.1   minimal
005   open_water_swim       0.0   [OFFLINE]
// system load: high. always.`,
  "cat /etc/hosts": `127.0.0.1     localhost
127.0.0.1     dfx-workstation-01
10.0.0.1      silicon.internal
10.0.0.2      scan-debug.internal
10.0.0.3      bist-validation.internal
// the real ones aren't listed here`,
  history: `  1  git clone nvidia/dfx-methodology
  2  vim scan_architecture.v
  3  run_simulation --coverage=full --corner=ss_125c
  4  debug_scan_chain --chain=47 --verbose
  5  grep -r "BIST_FAIL" logs/ | sort -u
  6  python lci_model.py --region=us-west --latency=120ms
  7  ssh tapeout-server "check_coverage --threshold=99.2"
  8  cat /dev/null > regrets.txt
  9  vim nead_architecture.md
 10  cd adityamorey.com && git push`,
  "man adi": `ADI(1)                   User Commands                   ADI(1)

NAME
       adi - senior dfx methodology engineer

SYNOPSIS
       adi [--dfx] [--research] [--debug CHIP] [--hire]

DESCRIPTION
       Builds silicon observability infrastructure for AI/HPC.
       Specializes in scan, JTAG/IJTAG, BIST, secure DFX,
       post-silicon bringup, and test methodology at scale.

OPTIONS
       --dfx          IEEE 1149.1, 1500, 1687 methodology
       --research     LCI framework, NeAd architecture
       --debug CHIP   requires NDA and coffee
       --hire         see: adityamorey1723@gmail.com

SEE ALSO
       linkedin(1), ssrn(1), uspto(1)`,
  neofetch: `         ▄▄▄▄▄▄▄▄▄▄           adi@dfx-workstation
        ██████████████         ─────────────────────
       ████▀▀▀▀▀▀████         OS: DFX-OS 5.15.0
      ████  ██████  ████       Host: NVIDIA AI/HPC
     ████  ████████  ████      Kernel: IEEE-1149.1
    ████████████████████       Uptime: 6 yrs, always on
   ██████████████████████      Shell: dfx-sh 2.4.1
                               CPU: Scan Methodology
                               GPU: WebGPU (you're using it)
                               Memory: 2.1GB / research
                               Patent: US-12172378-B1`
};

const cliAliases = {
  "cat resume.txt": "cat resume.pdf",
  "cat patent.txt": "cat patent_12172378.txt",
  "ssh adi@nvidia": "ssh adi@nvidia.com",
  sudo: "sudo rm -rf /"
};

const renderCli = () => {
  if (!cliOutput) return;
  cliOutput.replaceChildren();

  cliLines.slice(-96).forEach((line) => {
    const row = document.createElement("p");
    row.className = `cli-line ${line.tone || ""}`.trim();
    row.textContent = line.text;
    cliOutput.appendChild(row);
  });

  cliOutput.scrollTop = cliOutput.scrollHeight;
};

const writeCliImmediate = (text, tone = "") => {
  String(text)
    .split("\n")
    .forEach((line) => cliLines.push({ text: line, tone }));
  renderCli();
};

const writeCliTyped = (text, tone = "") => {
  window.clearTimeout(cliWriteTimer);
  const lines = String(text).split("\n");

  lines.forEach((line, index) => {
    cliWriteTimer = window.setTimeout(() => {
      cliLines.push({ text: line, tone });
      renderCli();
    }, index * 40);
  });
};

const openCli = () => {
  if (!cliOverlay || !cliInput) return;
  cliOverlay.hidden = false;
  if (cliLogin) cliLogin.textContent = `Last login: ${new Date().toLocaleString()}`;

  if (!cliLines.length) {
    writeCliImmediate("boot: secure shell attached. type `help`.", "ok");
  } else {
    renderCli();
  }

  requestAnimationFrame(() => cliInput.focus());
  trackEvent("feature_interact", { feature: "cli_terminal", command: "open" });
};

const closeCli = () => {
  if (!cliOverlay) return;
  cliOverlay.hidden = true;
};

const jumpToCompute = (tabName) => {
  closeCli();
  document.getElementById("compute")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  setActiveComputeTab(tabName);
};

const runCliCommand = (rawCommand) => {
  const typedCommand = rawCommand.trim();
  if (!typedCommand) return;

  const normalized = cliAliases[typedCommand.toLowerCase()] || typedCommand.toLowerCase();
  writeCliImmediate(`adi@dfx-ws:~$ ${typedCommand}`, "command");
  cliHistory.push(typedCommand);
  cliHistoryIndex = cliHistory.length;
  trackEvent("feature_interact", { feature: "cli_terminal", command: normalized });

  if (normalized === "clear") {
    cliLines.length = 0;
    renderCli();
    return;
  }

  if (normalized === "exit") {
    closeCli();
    return;
  }

  if (normalized === "help") {
    writeCliTyped(`available commands:
  whoami
  ls
  cat resume.pdf
  cat patent_12172378.txt
  ping adityamorey.com
  ssh adi@nvidia.com
  sudo rm -rf /
  uname -a
  top
  cat /etc/hosts
  history
  man adi
  neofetch
  clear
  exit

navigation aliases:
  matrix  scan  fault  lci  floorplan  life  patent`, "ok");
    return;
  }

  if (cliCommandOutput[normalized]) {
    writeCliTyped(cliCommandOutput[normalized], normalized.includes("sudo") ? "warn" : "ok");
    return;
  }

  if (normalized === "patent") {
    writeCliTyped("opening: patents.google.com/patent/US12172378B1", "ok");
    window.open("https://patents.google.com/patent/US12172378B1", "_blank", "noopener,noreferrer");
    return;
  }

  if (["matrix", "scan", "fault", "lci", "floorplan", "life"].includes(normalized)) {
    writeCliTyped(`routing to ${normalized.toUpperCase()}...`, "ok");
    jumpToCompute(normalized);
    return;
  }

  writeCliTyped(`command not found: ${typedCommand}. try 'help' for available commands.`, "warn");
};

const completeCliCommand = () => {
  if (!cliInput) return;
  const value = cliInput.value.toLowerCase();
  if (!value) return;
  const matches = cliCommands.filter((command) => command.startsWith(value));

  if (matches.length === 1) {
    cliInput.value = matches[0];
    return;
  }

  if (matches.length > 1) {
    writeCliTyped(matches.join("    "), "dim");
  }
};

if (cliOverlay && cliForm && cliInput) {
  cliForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runCliCommand(cliInput.value);
    cliInput.value = "";
  });

  cliInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      cliHistoryIndex = Math.max(0, cliHistoryIndex - 1);
      cliInput.value = cliHistory[cliHistoryIndex] || "";
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      cliHistoryIndex = Math.min(cliHistory.length, cliHistoryIndex + 1);
      cliInput.value = cliHistory[cliHistoryIndex] || "";
    }

    if (event.key === "Tab") {
      event.preventDefault();
      completeCliCommand();
    }
  });

  cliClose?.addEventListener("click", closeCli);
  cliMobileOpen?.addEventListener("click", openCli);
  cliOverlay.addEventListener("click", (event) => {
    if (event.target === cliOverlay) closeCli();
  });

  window.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;

    if (event.key === "Escape" && !cliOverlay.hidden) {
      closeCli();
      return;
    }

    if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === "`" || event.key === "/") {
      event.preventDefault();
      openCli();
    }
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
const floorplanCanvas = $("#floorplan-canvas");
const scanCanvas = $("#scan-canvas");
const faultCanvas = $("#fault-canvas");
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
const floorplanTelemetry = {
  wire: $("#fp-wire-delay"),
  thermal: $("#fp-thermal"),
  routing: $("#fp-routing"),
  score: $("#fp-score")
};
const scanTelemetry = {
  state: $("#scan-state"),
  clock: $("#scan-clock"),
  pins: $("#scan-pins"),
  register: $("#scan-register"),
  step: $("#scan-step"),
  tms: $("#scan-tms"),
  tdi: $("#scan-tdi"),
  reset: $("#scan-reset")
};
const faultTelemetry = {
  pc: $("#fault-pc"),
  cycle: $("#fault-cycle"),
  count: $("#fault-count"),
  flushes: $("#fault-flushes"),
  lost: $("#fault-lost"),
  ipc: $("#fault-ipc"),
  annotation: $("#fault-annotation"),
  speed: $("#fault-speed"),
  speedValue: $("#fault-speed-value"),
  clockLabel: $("#fault-clock-label"),
  registers: $("#fault-register-grid")
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

  if (tabName === "floorplan") {
    requestAnimationFrame(renderFloorplan);
  }

  if (tabName === "scan") {
    requestAnimationFrame(renderScan);
  }

  if (tabName === "fault") {
    ensureFaultEngine();
    requestAnimationFrame(renderFault);
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

const isFloorplanVisible = () => {
  const panel = $("#floorplan-panel");
  return Boolean(panel && !panel.hidden);
};

const isScanVisible = () => {
  const panel = $("#scan-panel");
  return Boolean(panel && !panel.hidden);
};

const isFaultVisible = () => {
  const panel = $("#fault-panel");
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
  if (dataFlowTelemetry.backend) dataFlowTelemetry.backend.style.color = "#76b900";

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
  if (dataFlowTelemetry.backend) dataFlowTelemetry.backend.style.color = "#9a9a9a";

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
        speed > 0.62 ? "rgba(255, 170, 0, 0.72)" : "rgba(118, 185, 0, 0.62)";
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

  drawCurve("standard", "#ffaa00");
  drawCurve("mstack", "#76b900");

  ctx.font = "12px JetBrains Mono, SFMono-Regular, Consolas, monospace";
  ctx.fillStyle = "rgba(229, 231, 235, 0.78)";
  ctx.fillText("u=0.20", plot.left, height - 14);
  ctx.fillText("u=0.96", plot.right - 48, height - 14);
  ctx.fillText("LCI", 10, plot.top + 8);
  ctx.fillStyle = "#76b900";
  ctx.fillText("M-STACK", plot.left + plotWidth * 0.18, toY(modelAt(0.48, "mstack").lci) - 10);
  ctx.fillStyle = "#ffaa00";
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

let floorplanBlocks = [];
let floorplanDragging = null;
let floorplanOffset = { x: 0, y: 0 };
let floorplanReady = false;

const syncFloorplanCanvas = () => {
  if (!floorplanCanvas) return { width: 0, height: 0, changed: false };

  const rect = floorplanCanvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const oldWidth = floorplanCanvas.width;
  const oldHeight = floorplanCanvas.height;
  const width = Math.max(360, Math.floor((rect.width || 640) * dpr));
  const height = Math.max(280, Math.floor((rect.height || 384) * dpr));
  const changed = oldWidth !== width || oldHeight !== height;

  if (changed) {
    floorplanCanvas.width = width;
    floorplanCanvas.height = height;

    if (floorplanBlocks.length && oldWidth > 0 && oldHeight > 0) {
      const scaleX = width / oldWidth;
      const scaleY = height / oldHeight;
      floorplanBlocks.forEach((block) => {
        block.x *= scaleX;
        block.y *= scaleY;
        block.w *= scaleX;
        block.h *= scaleY;
      });
    }
  }

  return { width, height, changed };
};

const seedFloorplanBlocks = (width, height) => {
  const scale = Math.max(0.78, Math.min(width / 640, height / 384));
  const block = (id, x, y, w, h, heat, color, label) => ({
    id,
    x: Math.min(width - w * scale - 8, x * scale),
    y: Math.min(height - h * scale - 8, y * scale),
    w: w * scale,
    h: h * scale,
    heat,
    color,
    label
  });

  floorplanBlocks = [
    block("ALU", 100, 90, 80, 80, 100, "#ffaa00", "COMPUTE"),
    block("L2", 258, 105, 104, 62, 42, "#76b900", "L2_CACHE"),
    block("MEM", 426, 198, 66, 122, 62, "#9a9a9a", "MEM_CTRL"),
    block("TAP", 58, 270, 48, 44, 12, "#e0e0e0", "DEBUG_TAP")
  ];
};

const getFloorplanCenter = (block) => ({
  x: block.x + block.w * 0.5,
  y: block.y + block.h * 0.5
});

const getFloorplanPointer = (event) => {
  const rect = floorplanCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * floorplanCanvas.width,
    y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * floorplanCanvas.height
  };
};

const constrainFloorplanBlock = (block) => {
  block.x = Math.max(0, Math.min(floorplanCanvas.width - block.w, block.x));
  block.y = Math.max(0, Math.min(floorplanCanvas.height - block.h, block.y));
};

function renderFloorplan() {
  if (!floorplanCanvas) return;
  const ctx = floorplanCanvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = syncFloorplanCanvas();
  const heatScale = Math.max(0.78, Math.min(width / 640, height / 384));
  if (!floorplanReady) {
    seedFloorplanBlocks(width, height);
    floorplanReady = true;
  }

  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  floorplanBlocks.forEach((block) => {
    const center = getFloorplanCenter(block);
    const radius = block.heat * 1.45 * heatScale;
    const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
    gradient.addColorStop(0, `rgba(255, 170, 0, ${Math.min(0.42, block.heat / 260)})`);
    gradient.addColorStop(1, "rgba(255, 170, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  const blockById = Object.fromEntries(floorplanBlocks.map((block) => [block.id, block]));
  const routes = [
    { a: blockById.ALU, b: blockById.L2, weight: 3 },
    { a: blockById.L2, b: blockById.MEM, weight: 2 },
    { a: blockById.TAP, b: blockById.ALU, weight: 0.5 }
  ];
  let totalWireDistance = 0;

  ctx.setLineDash([4, 5]);
  routes.forEach((route) => {
    const start = getFloorplanCenter(route.a);
    const end = getFloorplanCenter(route.b);
    const distance = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    totalWireDistance += distance * route.weight;

    ctx.strokeStyle = route.weight > 2 ? "rgba(118, 185, 0, 0.68)" : "rgba(224, 224, 224, 0.34)";
    ctx.lineWidth = route.weight;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  let thermalPenalty = 0;
  for (let i = 0; i < floorplanBlocks.length; i += 1) {
    for (let j = i + 1; j < floorplanBlocks.length; j += 1) {
      const first = floorplanBlocks[i];
      const second = floorplanBlocks[j];
      const firstCenter = getFloorplanCenter(first);
      const secondCenter = getFloorplanCenter(second);
      const distance = Math.max(1, Math.hypot(firstCenter.x - secondCenter.x, firstCenter.y - secondCenter.y));
      const safeDistance = (first.heat + second.heat) * 0.74 * heatScale;

      if (distance < safeDistance) {
        const overlap = (safeDistance - distance) / safeDistance;
        thermalPenalty += overlap * overlap * Math.sqrt(first.heat * second.heat) * 1.65;
      }
    }
  }

  floorplanBlocks.forEach((block) => {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(block.x, block.y, block.w, block.h);
    ctx.strokeStyle = block.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(block.x + 0.5, block.y + 0.5, block.w - 1, block.h - 1);

    ctx.fillStyle = block.color;
    ctx.font = "10px JetBrains Mono, SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(block.label, block.x + block.w * 0.5, block.y + block.h * 0.5);
  });

  const wireDelayPs = totalWireDistance * 0.31;
  const wireScore = Math.max(0, 100 - wireDelayPs / 6.8);
  const heatScore = Math.max(0, 100 - thermalPenalty * 1.4);
  const totalScore = wireScore * 0.62 + heatScore * 0.38;
  const critical = wireScore < 38 || thermalPenalty > 58;

  if (floorplanTelemetry.wire) {
    floorplanTelemetry.wire.textContent = `${Math.round(wireDelayPs)} ps`;
    floorplanTelemetry.wire.style.color = wireScore < 45 ? "#ff4444" : "#76b900";
  }
  if (floorplanTelemetry.thermal) {
    floorplanTelemetry.thermal.textContent = `${thermalPenalty.toFixed(1)} W/mm2`;
    floorplanTelemetry.thermal.style.color = thermalPenalty > 58 ? "#ff4444" : "#ffaa00";
  }
  if (floorplanTelemetry.routing) {
    floorplanTelemetry.routing.textContent = critical ? "CONSTRAINT_FAIL" : "TIMING_MET";
    floorplanTelemetry.routing.style.color = critical ? "#ff4444" : "#9a9a9a";
  }
  if (floorplanTelemetry.score) {
    floorplanTelemetry.score.textContent = `${Math.max(0, totalScore).toFixed(1)} / 100`;
    floorplanTelemetry.score.style.color = critical ? "#ff4444" : "#e0e0e0";
  }
}

const initFloorplan = () => {
  if (!floorplanCanvas) return;

  floorplanCanvas.addEventListener("pointerdown", (event) => {
    const pointer = getFloorplanPointer(event);

    for (let index = floorplanBlocks.length - 1; index >= 0; index -= 1) {
      const block = floorplanBlocks[index];
      const hit =
        pointer.x >= block.x &&
        pointer.x <= block.x + block.w &&
        pointer.y >= block.y &&
        pointer.y <= block.y + block.h;

      if (!hit) continue;

      floorplanDragging = block;
      floorplanOffset = { x: pointer.x - block.x, y: pointer.y - block.y };
      floorplanCanvas.classList.add("dragging");
      floorplanCanvas.setPointerCapture(event.pointerId);
      event.preventDefault();
      break;
    }
  });

  floorplanCanvas.addEventListener("pointermove", (event) => {
    if (!floorplanDragging) return;
    const pointer = getFloorplanPointer(event);
    floorplanDragging.x = pointer.x - floorplanOffset.x;
    floorplanDragging.y = pointer.y - floorplanOffset.y;
    constrainFloorplanBlock(floorplanDragging);
    renderFloorplan();
    event.preventDefault();
  });

  const clearDrag = (event) => {
    if (!floorplanDragging) return;
    floorplanDragging = null;
    floorplanCanvas.classList.remove("dragging");
    if (event && floorplanCanvas.hasPointerCapture(event.pointerId)) {
      floorplanCanvas.releasePointerCapture(event.pointerId);
    }
  };

  floorplanCanvas.addEventListener("pointerup", clearDrag);
  floorplanCanvas.addEventListener("pointercancel", clearDrag);
  window.addEventListener("resize", () => {
    if (isFloorplanVisible()) renderFloorplan();
  });
};

initFloorplan();

const TAP_TRANSITIONS = {
  TEST_LOGIC_RESET: { 0: "RUN_TEST_IDLE", 1: "TEST_LOGIC_RESET" },
  RUN_TEST_IDLE: { 0: "RUN_TEST_IDLE", 1: "SELECT_DR_SCAN" },
  SELECT_DR_SCAN: { 0: "CAPTURE_DR", 1: "SELECT_IR_SCAN" },
  CAPTURE_DR: { 0: "SHIFT_DR", 1: "EXIT1_DR" },
  SHIFT_DR: { 0: "SHIFT_DR", 1: "EXIT1_DR" },
  EXIT1_DR: { 0: "PAUSE_DR", 1: "UPDATE_DR" },
  PAUSE_DR: { 0: "PAUSE_DR", 1: "EXIT2_DR" },
  EXIT2_DR: { 0: "SHIFT_DR", 1: "UPDATE_DR" },
  UPDATE_DR: { 0: "RUN_TEST_IDLE", 1: "SELECT_DR_SCAN" },
  SELECT_IR_SCAN: { 0: "CAPTURE_IR", 1: "TEST_LOGIC_RESET" },
  CAPTURE_IR: { 0: "SHIFT_IR", 1: "EXIT1_IR" },
  SHIFT_IR: { 0: "SHIFT_IR", 1: "EXIT1_IR" },
  EXIT1_IR: { 0: "PAUSE_IR", 1: "UPDATE_IR" },
  PAUSE_IR: { 0: "PAUSE_IR", 1: "EXIT2_IR" },
  EXIT2_IR: { 0: "SHIFT_IR", 1: "UPDATE_IR" },
  UPDATE_IR: { 0: "RUN_TEST_IDLE", 1: "SELECT_DR_SCAN" }
};

const TAP_NODE_POSITIONS = {
  TEST_LOGIC_RESET: [0.12, 0.16],
  RUN_TEST_IDLE: [0.34, 0.16],
  SELECT_DR_SCAN: [0.56, 0.16],
  SELECT_IR_SCAN: [0.78, 0.16],
  CAPTURE_DR: [0.16, 0.34],
  SHIFT_DR: [0.36, 0.34],
  EXIT1_DR: [0.56, 0.34],
  PAUSE_DR: [0.78, 0.34],
  EXIT2_DR: [0.16, 0.52],
  UPDATE_DR: [0.36, 0.52],
  CAPTURE_IR: [0.56, 0.52],
  SHIFT_IR: [0.78, 0.52],
  EXIT1_IR: [0.16, 0.7],
  PAUSE_IR: [0.36, 0.7],
  EXIT2_IR: [0.56, 0.7],
  UPDATE_IR: [0.78, 0.7]
};

let scanState = "TEST_LOGIC_RESET";
let scanClock = 0;
let scanTms = 1;
let scanTdi = 0;
let scanTdo = 0;
let scanRegister = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0];
let scanHistory = [];

const syncScanCanvas = () => {
  if (!scanCanvas) return { width: 0, height: 0, scale: 1 };
  const rect = scanCanvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2.5);
  const width = Math.max(420, Math.floor(rect.width || 720));
  const height = Math.max(360, Math.floor(rect.height || 420));
  const pixelWidth = Math.floor(width * scale);
  const pixelHeight = Math.floor(height * scale);

  if (scanCanvas.width !== pixelWidth || scanCanvas.height !== pixelHeight) {
    scanCanvas.width = pixelWidth;
    scanCanvas.height = pixelHeight;
  }

  return { width, height, scale };
};

const setScanTelemetry = () => {
  if (scanTelemetry.state) scanTelemetry.state.textContent = scanState;
  if (scanTelemetry.clock) scanTelemetry.clock.textContent = String(scanClock);
  if (scanTelemetry.pins) scanTelemetry.pins.textContent = `${scanTms} / ${scanTdi} / ${scanTdo}`;
  if (scanTelemetry.register) scanTelemetry.register.textContent = scanRegister.join("");
  if (scanTelemetry.tms) scanTelemetry.tms.textContent = `TMS=${scanTms}`;
  if (scanTelemetry.tdi) scanTelemetry.tdi.textContent = `TDI=${scanTdi}`;
};

const drawDigitalWave = (ctx, label, values, x, y, width, highColor) => {
  const rowHeight = 24;
  const step = width / Math.max(1, values.length || 1);

  ctx.fillStyle = "#444444";
  ctx.font = "10px JetBrains Mono, SFMono-Regular, Consolas, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x - 52, y + 10);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.beginPath();
  ctx.moveTo(x, y + rowHeight);
  ctx.lineTo(x + width, y + rowHeight);
  ctx.stroke();

  ctx.strokeStyle = highColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  if (!values.length) {
    ctx.moveTo(x, y + rowHeight);
    ctx.lineTo(x + width, y + rowHeight);
    ctx.stroke();
    return;
  }

  values.forEach((value, index) => {
    const x0 = x + index * step;
    const x1 = x + (index + 1) * step;
    const yy = value ? y : y + rowHeight;

    if (index === 0) {
      ctx.moveTo(x0, yy);
    } else {
      const prevY = values[index - 1] ? y : y + rowHeight;
      ctx.lineTo(x0, prevY);
      ctx.lineTo(x0, yy);
    }

    ctx.lineTo(x1, yy);
  });

  ctx.stroke();
  ctx.lineWidth = 1;
};

function renderScan() {
  if (!scanCanvas) return;
  const ctx = scanCanvas.getContext("2d");
  if (!ctx) return;
  const { width, height, scale } = syncScanCanvas();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const leftGutter = 92;
  const rightGutter = 36;
  const topGutter = 44;
  const stateHeight = Math.max(230, Math.min(height * 0.5, height - 198));
  const stateWidth = Math.max(280, width - leftGutter - rightGutter);
  const nodeWidth = Math.min(128, Math.max(94, stateWidth * 0.14));
  const nodeHeight = 34;

  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  const nodeCenters = {};
  Object.entries(TAP_NODE_POSITIONS).forEach(([state, [nx, ny]]) => {
    nodeCenters[state] = {
      x: leftGutter + nx * stateWidth,
      y: topGutter + ny * stateHeight
    };
  });

  const currentTransitions = TAP_TRANSITIONS[scanState];
  [
    { next: currentTransitions[0], label: "TMS0", color: "#76b900" },
    { next: currentTransitions[1], label: "TMS1", color: "#ffaa00" }
  ].forEach((route, index) => {
    const start = nodeCenters[scanState];
    const end = nodeCenters[route.next];
    if (!start || !end) return;

    ctx.strokeStyle = route.color;
    ctx.setLineDash(index ? [5, 5] : []);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = route.color;
    ctx.font = "9px JetBrains Mono, SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const labelX = start.x + (index === 0 ? nodeWidth * 0.78 : nodeWidth * 0.34);
    const labelY = start.y + (index === 0 ? -nodeHeight * 0.62 : -nodeHeight * 0.9);
    ctx.fillText(route.label, labelX, labelY);
  });

  Object.entries(nodeCenters).forEach(([state, center]) => {
    const active = state === scanState;
    const x = center.x - nodeWidth * 0.5;
    const y = center.y - nodeHeight * 0.5;

    ctx.fillStyle = active ? "rgba(118, 185, 0, 0.12)" : "#0a0a0a";
    ctx.fillRect(x, y, nodeWidth, nodeHeight);
    ctx.strokeStyle = active ? "#76b900" : "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = active ? 2 : 1;
    ctx.strokeRect(x + 0.5, y + 0.5, nodeWidth - 1, nodeHeight - 1);
    ctx.fillStyle = active ? "#e0e0e0" : "#444444";
    ctx.font = "9px JetBrains Mono, SFMono-Regular, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.replace("TEST_LOGIC_", "TEST_").replace("_SCAN", ""), center.x, center.y);
  });

  const registerY = topGutter + stateHeight + 34;
  const registerLabelX = 18;
  const registerX = 152;
  const registerWidth = Math.max(180, width - registerX - 50);
  const cellWidth = Math.min(34, registerWidth / scanRegister.length);
  ctx.fillStyle = "#9a9a9a";
  ctx.font = "10px JetBrains Mono, SFMono-Regular, Consolas, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("SCAN_CHAIN[15:0]", registerLabelX, registerY + 13);

  scanRegister.forEach((bit, index) => {
    const x = registerX + index * cellWidth;
    ctx.fillStyle = bit ? "rgba(118, 185, 0, 0.22)" : "#0a0a0a";
    ctx.fillRect(x, registerY, cellWidth, 26);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.strokeRect(x + 0.5, registerY + 0.5, cellWidth - 1, 25);
    ctx.fillStyle = bit ? "#76b900" : "#444444";
    ctx.textAlign = "center";
    ctx.fillText(String(bit), x + cellWidth * 0.5, registerY + 17);
  });

  const samples = scanHistory.slice(-24);
  const tckValues = samples.map((_, index) => index % 2);
  const tmsValues = samples.map((sample) => sample.tms);
  const tdiValues = samples.map((sample) => sample.tdi);
  const tdoValues = samples.map((sample) => sample.tdo);
  const waveX = 104;
  const waveWidth = width - waveX - 50;
  const waveStart = registerY + 70;
  drawDigitalWave(ctx, "TCK", tckValues, waveX, waveStart, waveWidth, "#e0e0e0");
  drawDigitalWave(ctx, "TMS", tmsValues, waveX, waveStart + 34, waveWidth, "#ffaa00");
  drawDigitalWave(ctx, "TDI", tdiValues, waveX, waveStart + 68, waveWidth, "#76b900");
  drawDigitalWave(ctx, "TDO", tdoValues, waveX, waveStart + 102, waveWidth, "#9a9a9a");

  setScanTelemetry();
}

const stepScan = () => {
  const previousState = scanState;
  const shiftActive = previousState === "SHIFT_DR" || previousState === "SHIFT_IR";

  if (shiftActive) {
    scanTdo = scanRegister[scanRegister.length - 1];
    scanRegister.pop();
    scanRegister.unshift(scanTdi);
  } else {
    scanTdo = 0;
  }

  scanState = TAP_TRANSITIONS[scanState][scanTms];
  scanClock += 1;
  scanHistory.push({
    tms: scanTms,
    tdi: scanTdi,
    tdo: scanTdo,
    state: scanState,
    shifted: shiftActive
  });

  if (scanHistory.length > 32) scanHistory = scanHistory.slice(-32);
  renderScan();
};

const resetScan = () => {
  scanState = "TEST_LOGIC_RESET";
  scanClock = 0;
  scanTms = 1;
  scanTdi = 0;
  scanTdo = 0;
  scanRegister = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0];
  scanHistory = [];
  renderScan();
};

const initScan = () => {
  if (!scanCanvas) return;

  scanTelemetry.step?.addEventListener("click", stepScan);
  scanTelemetry.tms?.addEventListener("click", () => {
    scanTms = scanTms ? 0 : 1;
    renderScan();
  });
  scanTelemetry.tdi?.addEventListener("click", () => {
    scanTdi = scanTdi ? 0 : 1;
    renderScan();
  });
  scanTelemetry.reset?.addEventListener("click", resetScan);

  window.addEventListener("resize", () => {
    if (isScanVisible()) renderScan();
  });

  setScanTelemetry();
};

initScan();

const FAULT_STAGES = ["fetch", "decode", "execute", "memory", "writeback"];
const FAULT_STAGE_LABELS = ["FETCH", "DECODE", "EXECUTE", "MEMORY", "WRITEBACK"];
const FAULT_ROM = [
  "ADD R1, R2, R3",
  "LW  R4, 0x10(R5)",
  "SUB R6, R1, R4",
  "BEQ R2, R0, +8",
  "MUL R7, R3, R5",
  "SW  R7, 0x20(R1)"
];

let faultPipeline = [null, null, null, null, null];
let faultPc = 0;
let faultCycle = 0;
let faultCompleted = 0;
let faultInjected = 0;
let faultFlushes = 0;
let faultCyclesLost = 0;
let faultHz = 1;
let faultRunning = false;
let faultRaf = 0;
let faultLastFrame = 0;
let faultAccumulator = 0;
let faultSequence = 0;
let activeFault = null;
let faultPoison = 0;
let faultCorruptRegister = "";
let faultHistoryRows = [];
const faultCellRecords = new Map();

const FAULT_ANNOTATIONS = {
  fetch: "// WHAT DFX CATCHES HERE:\n// Scan dump captures PC and fetch register state at cycle N.\n// Invalid opcode is observable before architectural state commits.\n// This is why early capture visibility matters.",
  decode: "// WHAT DFX CATCHES HERE:\n// Scan dump captures corrupted decode flops and operand selection.\n// IJTAG access can isolate local register-control failure.\n// Coverage turns a silent decode error into a diagnosable state.",
  execute: "// WHAT DFX CATCHES HERE:\n// BIST would detect ALU output mismatch against expected signature.\n// Poisoned result propagation is caught before it becomes a product escape.\n// This is why arithmetic datapaths need observability.",
  memory: "// WHAT DFX CATCHES HERE:\n// IEEE 1149.1 JTAG boundary scan detects bus fault behavior.\n// RAM dump and array dump expose address/data corruption.\n// This is why buses and memories get their own debug paths.",
  writeback: "// WHAT DFX CATCHES HERE:\n// Scan dump captures register-file state at the failing cycle.\n// Architectural state corruption becomes inspectable instead of mystical.\n// This is why scan coverage targets stay above 99%."
};

const syncFaultCanvas = () => {
  if (!faultCanvas) return { width: 0, height: 0 };
  const rect = faultCanvas.getBoundingClientRect();
  const width = Math.max(420, Math.floor(rect.width || 760));
  const height = Math.max(300, Math.floor(rect.height || 330));

  if (faultCanvas.width !== width || faultCanvas.height !== height) {
    faultCanvas.width = width;
    faultCanvas.height = height;
  }

  return { width, height };
};

const recordFaultCell = (instruction, stageIndex, status) => {
  if (!instruction) return;
  if (!faultCellRecords.has(instruction.id)) faultCellRecords.set(instruction.id, []);
  faultCellRecords.get(instruction.id).push({
    cycle: faultCycle,
    stage: FAULT_STAGE_LABELS[stageIndex],
    status
  });

  if (!faultHistoryRows.includes(instruction.id)) faultHistoryRows.push(instruction.id);
  if (faultHistoryRows.length > 12) {
    const removed = faultHistoryRows.shift();
    faultCellRecords.delete(removed);
  }
};

const createFaultInstruction = () => {
  const text = FAULT_ROM[faultPc % FAULT_ROM.length];
  const instruction = {
    id: `I${String(faultSequence).padStart(2, "0")}`,
    text,
    pc: faultPc * 4
  };
  faultPc = (faultPc + 1) % FAULT_ROM.length;
  faultSequence += 1;
  return instruction;
};

const setStageDisplay = (stageName, instruction, status, labelOverride = "") => {
  const stageNode = document.querySelector(`.fault-stage[data-stage="${stageName}"]`);
  const instrNode = document.getElementById(`fault-${stageName}-instr`);
  const statusNode = document.getElementById(`fault-${stageName}-status`);
  const state = status.toLowerCase();

  if (stageNode) stageNode.dataset.state = state === "ok" ? "ok" : state;
  if (instrNode) instrNode.textContent = labelOverride || instruction?.text || "--";
  if (statusNode) statusNode.textContent = status;
};

const updateFaultRegisters = () => {
  if (!faultTelemetry.registers) return;
  faultTelemetry.registers.replaceChildren();

  for (let index = 0; index < 8; index += 1) {
    const cell = document.createElement("span");
    const register = `R${index}`;
    cell.textContent = faultCorruptRegister === register ? `${register}=0x??` : `${register}=0x${(index * 17).toString(16).padStart(2, "0").toUpperCase()}`;
    cell.classList.toggle("corrupt", faultCorruptRegister === register);
    faultTelemetry.registers.appendChild(cell);
  }
};

const applyFaultStageDisplay = () => {
  const overrides = new Map();

  if (activeFault) {
    const age = activeFault.age;
    if (activeFault.stage === "fetch") {
      overrides.set("fetch", { status: age < 2 ? "FAULT" : "STALL", label: "0xDEADBEEF" });
      if (age >= 2) {
        ["decode", "execute", "memory", "writeback"].forEach((stage) =>
          overrides.set(stage, { status: "FLUSHED", label: "FLUSHED" })
        );
      }
    }

    if (activeFault.stage === "decode") {
      overrides.set("decode", { status: age < 2 ? "FAULT" : "STALL", label: "ADD R??, R??" });
      ["execute", "memory", "writeback"].forEach((stage) =>
        overrides.set(stage, { status: age >= 2 ? "FLUSHED" : "FAULT", label: age >= 2 ? "FLUSHED" : "[CORRUPT]" })
      );
    }

    if (activeFault.stage === "memory") {
      overrides.set("memory", { status: activeFault.freeze > 0 ? "STALL" : "FAULT", label: "BUS ERROR: 0xBAD00000" });
    }
  }

  if (faultPoison > 0) {
    overrides.set("execute", { status: "FAULT", label: "0xFF != 0x2A" });
    overrides.set("memory", { status: "STALL", label: "[POISONED DATA]" });
    overrides.set("writeback", { status: "STALL", label: "[POISONED DATA]" });
  }

  if (faultCorruptRegister) {
    overrides.set("writeback", { status: "FAULT", label: `${faultCorruptRegister} <- 0x??` });
  }

  FAULT_STAGES.forEach((stage, index) => {
    const instruction = faultPipeline[index];
    const override = overrides.get(stage);
    setStageDisplay(stage, instruction, override?.status || "OK", override?.label || "");
    recordFaultCell(instruction, index, override?.status || "OK");
  });
};

const updateFaultTelemetry = () => {
  if (faultTelemetry.pc) faultTelemetry.pc.textContent = `0x${(faultPc * 4).toString(16).padStart(4, "0").toUpperCase()}`;
  if (faultTelemetry.cycle) faultTelemetry.cycle.textContent = String(faultCycle);
  if (faultTelemetry.count) faultTelemetry.count.textContent = String(faultInjected);
  if (faultTelemetry.flushes) faultTelemetry.flushes.textContent = String(faultFlushes);
  if (faultTelemetry.lost) faultTelemetry.lost.textContent = String(faultCyclesLost);
  if (faultTelemetry.ipc) faultTelemetry.ipc.textContent = (faultCycle ? faultCompleted / faultCycle : 1).toFixed(2);
  if (faultTelemetry.speedValue) faultTelemetry.speedValue.textContent = `${faultHz.toFixed(1)}HZ`;
  if (faultTelemetry.clockLabel) faultTelemetry.clockLabel.textContent = `CLOCK: ${faultHz.toFixed(1)}HZ`;
  updateFaultRegisters();
};

const flushFaultPipeline = () => {
  faultPipeline = [null, null, null, null, null];
  faultFlushes += 1;
  faultCyclesLost += 3;
};

const tickFaultPipeline = () => {
  faultCycle += 1;
  let freeze = false;

  if (activeFault) {
    activeFault.age += 1;

    if (activeFault.stage === "fetch" || activeFault.stage === "decode") {
      if (activeFault.age === 1) {
        freeze = true;
        faultCyclesLost += 1;
      }
      if (activeFault.age === 2) {
        flushFaultPipeline();
      }
      if (activeFault.age > 4) activeFault = null;
    }

    if (activeFault?.stage === "memory") {
      if (activeFault.freeze > 0) {
        activeFault.freeze -= 1;
        freeze = true;
        faultCyclesLost += 1;
      } else {
        flushFaultPipeline();
        activeFault = null;
      }
    }
  }

  if (!freeze) {
    if (faultPipeline[4]) faultCompleted += 1;
    faultPipeline.pop();
    faultPipeline.unshift(createFaultInstruction());
  }

  if (faultPoison > 0) faultPoison -= 1;
  applyFaultStageDisplay();
  updateFaultTelemetry();
};

function renderFault() {
  if (!faultCanvas) return;
  const ctx = faultCanvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = syncFaultCanvas();
  const left = 92;
  const top = 42;
  const columns = 12;
  const rows = Math.max(5, Math.min(8, faultHistoryRows.length || 5));
  const cellW = (width - left - 24) / columns;
  const cellH = (height - top - 32) / rows;
  const cycleStart = Math.max(0, faultCycle - columns + 1);
  const visibleRows = faultHistoryRows.slice(-rows);

  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(118, 185, 0, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  ctx.font = "10px JetBrains Mono, SFMono-Regular, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#666666";
  for (let column = 0; column < columns; column += 1) {
    ctx.fillText(`C${cycleStart + column}`, left + column * cellW + cellW * 0.5, 18);
  }

  visibleRows.forEach((rowId, row) => {
    ctx.textAlign = "left";
    ctx.fillStyle = "#666666";
    ctx.fillText(rowId, 16, top + row * cellH + cellH * 0.5);

    const records = faultCellRecords.get(rowId) || [];
    for (let column = 0; column < columns; column += 1) {
      const cycle = cycleStart + column;
      const x = left + column * cellW;
      const y = top + row * cellH;
      const record = records.find((item) => item.cycle === cycle);
      const status = record?.status || "";
      const stage = record?.stage || "";

      ctx.fillStyle =
        status === "FAULT"
          ? "rgba(255, 68, 68, 0.34)"
          : status === "STALL"
            ? "rgba(255, 170, 0, 0.24)"
            : status === "FLUSHED"
              ? "rgba(68, 68, 68, 0.28)"
              : record
                ? "rgba(118, 185, 0, 0.16)"
                : "rgba(255, 255, 255, 0.02)";
      ctx.fillRect(x, y, cellW - 2, cellH - 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 2, cellH - 2);

      if (stage) {
        ctx.fillStyle = status === "FAULT" ? "#ff4444" : status === "STALL" ? "#ffaa00" : "#76b900";
        ctx.textAlign = "center";
        ctx.fillText(stage.slice(0, 2), x + cellW * 0.5, y + cellH * 0.5);
      }
    }
  });
}

const faultLoop = (time) => {
  if (!faultRunning) return;
  if (!faultLastFrame) faultLastFrame = time;
  const delta = time - faultLastFrame;
  faultLastFrame = time;

  if (isFaultVisible()) {
    faultAccumulator += delta;
    const interval = 1000 / faultHz;
    while (faultAccumulator >= interval) {
      faultAccumulator -= interval;
      tickFaultPipeline();
    }
    renderFault();
  }

  faultRaf = requestAnimationFrame(faultLoop);
};

const ensureFaultEngine = () => {
  if (!faultCanvas || faultRunning) return;
  faultRunning = true;
  if (faultPipeline.every((slot) => slot === null)) {
    faultPipeline = [createFaultInstruction(), null, null, null, null];
    applyFaultStageDisplay();
    updateFaultTelemetry();
  }
  faultRaf = requestAnimationFrame(faultLoop);
};

const injectFault = (stage) => {
  if (!FAULT_STAGES.includes(stage)) return;
  ensureFaultEngine();
  faultInjected += 1;
  faultCorruptRegister = "";
  activeFault = { stage, age: 0, freeze: stage === "memory" ? 3 : 0 };

  if (stage === "execute") {
    faultPoison = 4;
    activeFault = null;
  }

  if (stage === "writeback") {
    faultCorruptRegister = "R7";
    activeFault = null;
  }

  if (faultTelemetry.annotation) faultTelemetry.annotation.textContent = FAULT_ANNOTATIONS[stage];
  document.body.classList.add("fault-flash");
  window.setTimeout(() => document.body.classList.remove("fault-flash"), 90);
  applyFaultStageDisplay();
  updateFaultTelemetry();
  renderFault();
  trackEvent("feature_interact", { feature: "fault_injection", stage });
};

const initFaultEngine = () => {
  if (!faultCanvas) return;

  document.querySelectorAll("[data-fault-stage]").forEach((button) => {
    button.addEventListener("click", () => injectFault(button.dataset.faultStage || ""));
  });

  faultTelemetry.speed?.addEventListener("input", () => {
    faultHz = Number(faultTelemetry.speed.value) || 1;
    updateFaultTelemetry();
  });

  window.addEventListener("resize", () => {
    if (isFaultVisible()) renderFault();
  });

  updateFaultTelemetry();
};

initFaultEngine();

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
      ctx.fillStyle = blueMode ? `rgba(118, 185, 0, ${alpha})` : `rgba(255, 170, 0, ${alpha})`;
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
      ctx.fillStyle = (column + row + lifeGeneration) % 11 === 0 ? "#ffaa00" : "#76b900";
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
