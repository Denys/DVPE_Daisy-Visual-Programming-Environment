import { useState, useMemo } from "react";

const SOURCES = [
  // ── Part 1: Core Morphisms ──
  { id: 1, title: "backdrop-filter — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter", part: 1, tags: ["glassmorphism", "css", "reference"], type: "docs", desc: "Definitive CSS reference for backdrop-filter. Covers all filter functions (blur, brightness, contrast, saturate), formal syntax, browser compat table. Your single source of truth for what the property actually does." },
  { id: 2, title: "Next-level frosted glass with backdrop-filter — Josh W. Comeau", url: "https://www.joshwcomeau.com/css/backdrop-filter/", part: 1, tags: ["glassmorphism", "tutorial", "css"], type: "tutorial", desc: "Best practical tutorial on implementing frosted glass effects. Covers stacking context gotchas, performance notes, browser support (~97% as of late 2024). The go-to for learning backdrop-filter properly." },
  { id: 3, title: "Create OS-style backgrounds with backdrop-filter — web.dev", url: "https://web.dev/articles/backdrop-filter", part: 1, tags: ["glassmorphism", "tutorial", "performance"], type: "tutorial", desc: "Google's guide to backdrop-filter. Key insight: each backdrop-filter creates a new stacking context. Demonstrates combining multiple filter functions and animated backdrop effects." },
  { id: 4, title: "12 Glassmorphism UI Features, Best Practices, and Examples — UXpilot", url: "https://uxpilot.ai/blogs/glassmorphism-ui", part: 1, tags: ["glassmorphism", "design", "best-practices"], type: "article", desc: "Comprehensive glassmorphism guide covering lighting direction, dark mode adaptations, color palette strategies. Real-world examples from AnyDistance, Apple Music. Excellent section on pairing neon gradients with glass." },
  { id: 5, title: "Glassmorphism vs. Claymorphism vs. Skeuomorphism: 2025 UI Design Guide — Medium", url: "https://medium.com/design-bootcamp/glassmorphism-vs-claymorphism-vs-skeuomorphism-2025-ui-design-guide-e639ff73b389", part: 1, tags: ["glassmorphism", "claymorphism", "comparison"], type: "article", desc: "Side-by-side comparison of morphism philosophies with visual examples. Useful for understanding the aesthetic spectrum and when each approach fits." },
  { id: 6, title: "Neumorphism and CSS — CSS-Tricks", url: "https://css-tricks.com/neumorphism-and-css/", part: 1, tags: ["neumorphism", "css", "tutorial"], type: "tutorial", desc: "Foundational CSS-Tricks article on implementing neumorphism. Covers the dual-shadow technique, color matching requirements, and why the effect demands background-matching element colors." },
  { id: 7, title: "Implementing Neumorphic Shadows — OpenReplay", url: "https://blog.openreplay.com/implementing-neumorphic-shadows/", part: 1, tags: ["neumorphism", "css", "shadows"], type: "tutorial", desc: "Practical neumorphism implementation guide. Details shadow calculations, pressed/raised states, and the performance implications of dual box-shadows on multiple elements." },
  { id: 8, title: "Neumorphism — the accessible and inclusive way — Axess Lab", url: "https://axesslab.com/neumorphism/", part: 1, tags: ["neumorphism", "accessibility", "wcag"], type: "article", desc: "Critical accessibility analysis of neumorphism. Low-vision simulator screenshots showing buttons disappearing entirely. WCAG 1.4.11 contrast requirements (≥3:1 for UI components). Essential reading before using neumorphism on interactive elements." },
  { id: 9, title: "Neumorphism vs Glassmorphism 2025: UI Trends — Redlio Designs", url: "https://redliodesigns.com/blog/neumorphism-vs-glassmorphism-2025-ui-trends", part: 1, tags: ["neumorphism", "glassmorphism", "comparison", "2025"], type: "article", desc: "Updated 2025 comparison. Performance benchmarks for box-shadow rendering vs. backdrop-filter. Practical guidance on where each morphism works in production." },
  { id: 10, title: "How to Animate CSS Box Shadows and Optimize Performance — SitePoint", url: "https://www.sitepoint.com/css-box-shadow-animation-performance/", part: 1, tags: ["performance", "shadows", "animation", "neumorphism"], type: "tutorial", desc: "Key performance data: shadow animation 55ms → 117ms under 4x CPU throttle. The ::after pseudo-element opacity trick for performant shadow animation. Essential for neumorphism and neon glow hover states." },
  { id: 11, title: "backdrop-filter: blur() performance issues — shadcn/ui #327", url: "https://github.com/shadcn-ui/ui/issues/327", part: 1, tags: ["glassmorphism", "performance", "bug-report"], type: "github", desc: "Real-world performance issue report from the most popular React component library. Documents FPS drops with backdrop-filter on large elements and proposed workarounds. Essential reading for production glass effects." },
  { id: 12, title: "backdrop-filter performance mode — FoundryVTT #10400", url: "https://github.com/foundryvtt/foundryvtt/issues/10400", part: 1, tags: ["glassmorphism", "performance", "bug-report"], type: "github", desc: "Another real-world report: backdrop-filter causing significant FPS drops in a complex canvas application. Documents per-element vs. accumulated GPU cost. Directly relevant to DVPE's multi-block canvas." },
  { id: 13, title: "CSS blur filter performance — Mozilla Bugzilla #925025", url: "https://bugzilla.mozilla.org/show_bug.cgi?id=925025", part: 1, tags: ["glassmorphism", "performance", "firefox"], type: "github", desc: "Historical Firefox bug documenting order-of-magnitude slower blur filter rendering vs. Chrome. Status: mostly resolved by 2024, but explains why Firefox was the last holdout on backdrop-filter." },
  { id: 14, title: "Glassmorphism CSS Generator — Glass UI", url: "https://ui.glass/generator/", part: 1, tags: ["glassmorphism", "tool", "generator"], type: "tool", desc: "Interactive generator for glassmorphism CSS. Adjust blur, transparency, color, border. Instant code output. Good for quick prototyping before fine-tuning in your own playground." },
  { id: 15, title: "Glassmorphism with Accessibility in Mind — New Target", url: "https://www.newtarget.com/web-insights-blog/glassmorphism/", part: 1, tags: ["glassmorphism", "accessibility", "wcag"], type: "article", desc: "Focused specifically on making glassmorphism WCAG-compliant. Covers contrast ratio testing on transparent surfaces, prefers-reduced-transparency media query, and fallback strategies." },
  { id: 16, title: "How Glassmorphism Drives User Focus in Complex Enterprise UI — Innoraft", url: "https://www.innoraft.ai/blog/how-glassmorphism-drives-user-focus-complex-enterprise-ui", part: 1, tags: ["glassmorphism", "ux", "enterprise"], type: "article", desc: "Enterprise perspective on glass effects. Visual hierarchy through translucent layering, directing attention with selective blur depth. Relevant for DVPE's complex multi-panel interface." },

  // ── Part 2: Emerging Morphisms ──
  { id: 20, title: "Apple introduces Liquid Glass design — Apple Newsroom (WWDC 2025)", url: "https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/", part: 2, tags: ["liquid-glass", "apple", "2025"], type: "article", desc: "Apple's official announcement of Liquid Glass across iOS 26, macOS Tahoe. The defining moment that validated glassmorphism as a decade-long paradigm. Describes optical refraction, dynamic light response, and layered depth." },
  { id: 21, title: "CSS Liquid Glass Effects — Designfast Tutorial", url: "https://designfast.io/liquid-glass", part: 2, tags: ["liquid-glass", "css", "tutorial"], type: "tutorial", desc: "Practical CSS tutorial for recreating Apple's Liquid Glass on the web. Covers SVG feDisplacementMap for optical refraction, dynamic lighting with CSS custom properties, and the specific blur/opacity combinations Apple uses." },
  { id: 22, title: "Liquid Glass in CSS and SVG — ekino-france (Medium)", url: "https://medium.com/ekino-france/liquid-glass-in-css-and-svg-839985fcb88d", part: 2, tags: ["liquid-glass", "svg", "advanced"], type: "tutorial", desc: "Deep technical implementation using SVG filters for the refraction/distortion effect that separates Liquid Glass from standard glassmorphism. Advanced — for when you want to go beyond backdrop-filter." },
  { id: 23, title: "liquid-glass — GitHub generator", url: "https://github.com/yanglei1826877278/liquid-glass", part: 2, tags: ["liquid-glass", "tool", "generator"], type: "tool", desc: "Open-source Liquid Glass CSS/HTML generator. Customize blur, transparency, glow parameters and copy the code. React/Vue compatible output." },
  { id: 24, title: "Aurora UI — how to create with CSS — DEV Community", url: "https://dev.to/albertwalicki/aurora-ui-how-to-create-with-css-4b6g", part: 2, tags: ["aurora", "css", "tutorial"], type: "tutorial", desc: "Step-by-step CSS aurora gradient implementation. Multiple radial-gradient layers with background-position animation. The technique for DVPE's atmospheric background behind glass blocks." },
  { id: 25, title: "CSS Aurora Effect — DEV Community", url: "https://dev.to/oobleck/css-aurora-effect-569n", part: 2, tags: ["aurora", "css", "animation"], type: "tutorial", desc: "Alternative aurora implementation using filter: blur on pseudo-elements with animated transforms. Lighter GPU load than backdrop-filter-based approaches." },
  { id: 26, title: "Aurora Gradient with React & Framer Motion — Medium", url: "https://medium.com/design-bootcamp/beautiful-aurora-gradient-with-react-framer-motion-9ab40674b5fb", part: 2, tags: ["aurora", "react", "framer-motion"], type: "tutorial", desc: "React-specific aurora implementation using Framer Motion's useMotionTemplate for dynamic gradient animation. Directly applicable to DVPE's React stack." },
  { id: 27, title: "Neobrutalism: Definition and Best Practices — NN/g", url: "https://www.nngroup.com/articles/neobrutalism/", part: 2, tags: ["neo-brutalism", "ux-research", "best-practices"], type: "article", desc: "Nielsen Norman Group's authoritative analysis (April 2025). Documents neo-brutalism as mature but warns of increased cognitive load. Best use cases vs. contraindications. The research backbone for deciding if/when to mix brutalist elements." },
  { id: 28, title: "Neobrutalism Components — shadcn/ui template", url: "https://www.shadcn.io/template/ekmas-neobrutalism-components", part: 2, tags: ["neo-brutalism", "react", "components"], type: "tool", desc: "Production-ready neo-brutalism components built on shadcn/ui. Thick borders, hard drop shadows, bold colors. Useful as contrast reference against DVPE's glass aesthetic." },
  { id: 29, title: "Old Timey Terminal Styling — CSS-Tricks", url: "https://css-tricks.com/old-timey-terminal-styling/", part: 2, tags: ["terminal", "retro", "css"], type: "tutorial", desc: "Terminal/CRT aesthetic implementation: phosphor glow via text-shadow, scanline overlays with repeating-linear-gradient, CRT flicker animations. Directly applicable for DVPE system message styling." },
  { id: 30, title: "Retro Terminal UI — Benjamin Brewster (Medium)", url: "https://medium.com/@benjamib/retro-terminal-ui-ae9ac8eae71a", part: 2, tags: ["terminal", "retro", "design"], type: "article", desc: "Design principles for terminal aesthetics in modern UIs. Font choices (VT323, JetBrains Mono), color temperature, scanline density. Useful for DVPE's monospace timestamp and system message elements." },
  { id: 31, title: "Retro-futuristic UX Designs — LogRocket", url: "https://blog.logrocket.com/ux-design/retro-futuristic-ux-designs-bringing-back-the-future/", part: 2, tags: ["retro-futurism", "ux", "design"], type: "article", desc: "Broader retro-futurism UX survey. Covers how synth/audio interfaces naturally fit the retro-futuristic aesthetic. DVPE's dark-theme-with-neon design sits squarely in this territory." },
  { id: 32, title: "Creating Holographic Effects in CSS — OpenReplay", url: "https://blog.openreplay.com/creating-holographic-effects-css/", part: 2, tags: ["holographic", "css", "advanced"], type: "tutorial", desc: "Comprehensive holographic CSS implementation. OKLCH gradients with mix-blend-mode for smooth hue rotation, mouse-tracking tilt effects. Applicable for premium DVPE UI accents (badges, status indicators)." },
  { id: 33, title: "How to Get the Holographic CSS Effect — CSS3.com", url: "https://css3.com/how-to-get-the-holographic-css-effect-a-complete-guide/", part: 2, tags: ["holographic", "css", "tutorial"], type: "tutorial", desc: "Step-by-step holographic effect guide. Covers iridescent gradients, foil card effects, and rainbow shimmer animations using conic-gradient and hue-rotate." },
  { id: 34, title: "Pokemon Cards CSS — simeydotme (GitHub)", url: "https://github.com/simeydotme/pokemon-cards-css", part: 2, tags: ["holographic", "css", "showcase"], type: "github", desc: "Reference implementation of advanced holographic/iridescent CSS effects. Demonstrates mouse-reactive tilt, rainbow foil patterns, and layered blend modes. The gold standard for holographic card UI." },
  { id: 35, title: "The Bento Box Effect: Why Modular Grids Dominate 2025 — Onecodesoft", url: "https://www.onecodesoft.com/blogs/the-bento-box-effect-why-modular-grids-dominate-2025-design", part: 2, tags: ["bento", "layout", "2025"], type: "article", desc: "Analysis of bento grid as the dominant 2025 layout pattern. CSS Grid grid-auto-flow: dense, container queries for responsive bento items. Relevant as the structural pattern DVPE's morphism effects sit within." },
  { id: 36, title: "Build a Bento Layout with CSS Grid — iamsteve", url: "https://iamsteve.me/blog/bento-layout-css-grid", part: 2, tags: ["bento", "css-grid", "tutorial"], type: "tutorial", desc: "Practical bento grid implementation tutorial. Clean CSS Grid patterns with named areas and auto-flow. No frameworks required." },
  { id: 37, title: "BentoGrids.com — Curated Bento Grid Examples", url: "https://bentogrids.com/", part: 2, tags: ["bento", "inspiration", "gallery"], type: "tool", desc: "Gallery of hundreds of bento grid designs from Apple, Stripe, Linear, and others. Excellent for visual reference when designing DVPE settings/configuration panels." },
  { id: 38, title: "UI Trends: Neumorphism vs. Glassmorphism vs. Neubrutalism — CC Creative", url: "https://www.cccreative.design/blogs/differences-in-ui-design-trends-neumorphism-glassmorphism-and-neubrutalism", part: 2, tags: ["comparison", "neumorphism", "glassmorphism", "neo-brutalism"], type: "article", desc: "Three-way morphism comparison with visual examples and use-case recommendations. Good for understanding how different morphisms can be combined selectively." },
  { id: 39, title: "Apple's Liquid Glass UI Design + CSS guide — DEV Community", url: "https://dev.to/gruszdev/apples-liquid-glass-revolution-how-glassmorphism-is-shaping-ui-design-in-2025-with-css-code-1221", part: 2, tags: ["liquid-glass", "css", "apple", "2025"], type: "tutorial", desc: "Developer-focused Liquid Glass CSS code walkthrough. Practical implementation with specific property values. Updated for Apple's 2025 design language." },
  { id: 40, title: "Top UI Design Trends to Watch in 2025 — Nerdify", url: "https://getnerdify.com/blog/user-interface-design-trends/", part: 2, tags: ["trends", "2025", "survey"], type: "article", desc: "Broad 2025 UI trend survey covering glassmorphism, aurora gradients, bento grids, AI-generated interfaces. Useful for understanding where DVPE's aesthetic sits in the wider landscape." },

  // ── Part 3: AI-Assisted Workflow ──
  { id: 50, title: "What is v0? — v0.app Documentation", url: "https://v0.app/docs", part: 3, tags: ["v0", "ai-tool", "docs"], type: "docs", desc: "Official v0.dev documentation. Generates React + Tailwind + shadcn/ui components from prompts. Best for initial morphism component scaffolding when you provide specific CSS values." },
  { id: 51, title: "v0.dev Guide 2025 — Flexxited", url: "https://flexxited.com/blog/v0-dev-guide-2025-ai-powered-ui-generation-for-react-and-tailwind-css", part: 3, tags: ["v0", "guide", "2025"], type: "article", desc: "Practical v0.dev workflow guide. Covers prompt engineering for UI generation, iterative refinement, and when to export vs. continue iterating. Morphism-specific prompting strategies." },
  { id: 52, title: "Glassmorphism Website — v0 by Vercel (example)", url: "https://v0.app/chat/glassmorphism-website-p6sbNtTTT9e", part: 3, tags: ["v0", "glassmorphism", "example"], type: "tool", desc: "Live v0.dev glassmorphism generation example. Shows what v0 produces from a glassmorphism prompt — backdrop-blur-md, luminous borders, floating cards. Use as baseline for your own more specific prompts." },
  { id: 53, title: "Base44 vs Lovable: Features and Pricing — Tech.co", url: "https://tech.co/ai/vibe-coding/base44-vs-lovable", part: 3, tags: ["lovable", "ai-tool", "comparison"], type: "article", desc: "Comparison of AI app builders. Lovable uniquely offers morphism style presets (glassmorphism, neumorphism, neo-brutalism) at project creation — the only tool with explicit morphism awareness." },
  { id: 54, title: "Cursor AI for Angular Development — Brian Treese", url: "https://briantree.se/cursor-ai-for-better-angular-development/", part: 3, tags: ["cursor", "ai-tool", "workflow"], type: "article", desc: "Practical Cursor IDE workflow guide. The Cmd+K inline editing pattern that works best for morphism CSS refinement — highlight CSS block, describe exact adjustments, apply." },
  { id: 55, title: "What is Bolt.new AI — Prismetric", url: "https://www.prismetric.com/what-is-bolt-ai/", part: 3, tags: ["bolt", "ai-tool", "review"], type: "article", desc: "bolt.new capabilities review. Faster for full-stack scaffolding but produces rougher design output. Best used for initial project structure, not final morphism styling." },
  { id: 56, title: "10 AI Prompts for Stunning Glowing UI Effects — StackFindOver", url: "https://blog.stackfindover.com/ai-prompts-for-glowing-ui-effects/", part: 3, tags: ["ai-prompts", "glow", "glassmorphism"], type: "article", desc: "Curated prompt templates specifically for glow effects: glassmorphism edge glow, neon text, dark-mode accent glow, hover glow transitions. Directly applicable to DVPE block styling prompts." },
  { id: 57, title: "Best Glassmorphism AI Prompts — DocsBot", url: "https://docsbot.ai/prompts/tags?tag=Glassmorphism", part: 3, tags: ["ai-prompts", "glassmorphism", "collection"], type: "tool", desc: "Large collection of glassmorphism prompts across ChatGPT, Claude, and Gemini. Covers dark mode, dashboard UI, mobile UI, gaming overlays. Good for prompt inspiration and patterns." },
  { id: 58, title: "CSS Garden Challenge: Testing AI Design Skills — John Turner", url: "https://johndturner.com/blog/css-garden-challenge-test-ai-design-skills/", part: 3, tags: ["ai-tool", "design", "benchmark"], type: "article", desc: "Systematic benchmark of AI tools (Claude, GPT, Gemini, v0) at generating CSS designs. Reveals which models handle glassmorphism best and where they fail. Useful for tool selection." },
  { id: 59, title: "Awesome Gemini AI Prompts — GitHub", url: "https://github.com/ZeroLu/awesome-gemini-ai", part: 3, tags: ["ai-prompts", "gemini", "design"], type: "github", desc: "Includes a detailed 'visually striking website' system prompt with glassmorphism, neon accents, bento grids, shader backgrounds. The most comprehensive AI design meta-prompt template available." },

  // ── Part 4: Build Tools & Performance ──
  { id: 70, title: "How to Choose Between Next.js and Vite.js — SoftwareLogic", url: "https://softwarelogic.co/en/blog/how-to-choose-between-nextjs-and-vitejs-for-projects", part: 4, tags: ["vite", "nextjs", "framework", "comparison"], type: "article", desc: "Framework comparison for morphism-heavy projects. Key insight: backdrop-filter effects are 100% client-side GPU operations — SSR provides zero benefit. Vite's faster HMR wins for visual iteration." },
  { id: 71, title: "GSAP vs Motion: A Detailed Comparison — motion.dev", url: "https://motion.dev/docs/gsap-vs-motion", part: 4, tags: ["motion", "gsap", "animation", "performance"], type: "docs", desc: "Head-to-head comparison. Motion runs 2.5x faster for unknown-value animations and 6x faster for type-switching. MIT-licensed (vs GSAP's restrictive license post-Webflow acquisition). Hardware-accelerated via Web Animations API." },
  { id: 72, title: "Reduce Bundle Size of Framer Motion — motion.dev", url: "https://motion.dev/docs/react-reduce-bundle-size", part: 4, tags: ["motion", "performance", "bundle-size"], type: "docs", desc: "Critical for performance budget: LazyMotion reduces initial bundle from 34kb to ~4.6kb. Code-split animation features so they load on demand. Essential for keeping DVPE's animation library under 10kb." },
  { id: 73, title: "Design Tokens — Style Dictionary", url: "https://styledictionary.com/info/tokens/", part: 4, tags: ["tokens", "style-dictionary", "design-system"], type: "docs", desc: "Style Dictionary v4 documentation. Forward-compatible with W3C DTCG Design Tokens spec. Transform morphism tokens (blur, opacity, shadow) to CSS custom properties, Tailwind config, and platform-specific outputs." },
  { id: 74, title: "W3C Design Tokens Specification Reaches v1 — DesignZig", url: "https://designzig.com/design-tokens-specification-reaches-first-stable-version-with-w3c-community-group/", part: 4, tags: ["tokens", "w3c", "standard"], type: "article", desc: "Coverage of the DTCG Design Tokens spec reaching v1 stable (October 2025). Defines the standard JSON format for design tokens that tools like Style Dictionary and Tokens Studio implement." },
  { id: 75, title: "Style Dictionary — GitHub", url: "https://github.com/style-dictionary/style-dictionary", part: 4, tags: ["tokens", "style-dictionary", "tool"], type: "github", desc: "Style Dictionary v4 source. Cross-platform design token build system. Transforms token definitions into CSS, SCSS, JS, Android, iOS outputs. The industry standard for design token management." },
  { id: 76, title: "Intro to Design Tokens — Tokens Studio", url: "https://docs.tokens.studio/fundamentals/design-tokens", part: 4, tags: ["tokens", "figma", "design-system"], type: "docs", desc: "Tokens Studio documentation. Bridges Figma design tokens to code via @tokens-studio/sd-transforms plugin for Style Dictionary. The Figma-to-code pipeline for morphism design systems." },
  { id: 77, title: "sd-transforms — Tokens Studio GitHub", url: "https://github.com/tokens-studio/sd-transforms", part: 4, tags: ["tokens", "style-dictionary", "figma"], type: "github", desc: "Custom Style Dictionary transforms for Tokens Studio exports. Handles shadow, border, typography token types that standard SD doesn't. Required for complex morphism token pipelines." },
  { id: 78, title: "backdrop-filter: blur() — Tailwind CSS Docs", url: "https://tailwindcss.com/docs/backdrop-filter-blur", part: 4, tags: ["tailwind", "glassmorphism", "css"], type: "docs", desc: "Tailwind's first-class glassmorphism utilities: backdrop-blur-sm through backdrop-blur-3xl, arbitrary values via backdrop-blur-[8px]. No plugins needed. DVPE's styling approach." },
  { id: 79, title: "High Performance box-shadow — CodePen", url: "https://codepen.io/emanuelbaran/pen/gwYLYo", part: 4, tags: ["performance", "shadows", "technique"], type: "tool", desc: "Live demo of the ::after pseudo-element trick for performant shadow animation. Pre-renders target shadow, animates only opacity (compositing-only). Crucial for neon glow hover states." },
  { id: 80, title: "37 CSS backdrop-filter Examples — FreeFrontend", url: "https://freefrontend.com/css-backdrop-filter-examples/", part: 4, tags: ["glassmorphism", "examples", "inspiration"], type: "tool", desc: "Curated collection of 37 backdrop-filter CodePen demos. Frosted glass modals, morphing cards, progressive blur, cosmic effects. Excellent for visual inspiration and copy-study." },
  { id: 81, title: "CSS backdrop-filter for frosted glass — modern.css", url: "https://modern-css.com/frosted-glass-effect-without-opacity-hacks/", part: 4, tags: ["glassmorphism", "css", "modern"], type: "tutorial", desc: "Clean, modern approach to frosted glass without legacy hacks. Emphasizes: blur applies to everything rendered behind, not just static backgrounds. Baseline 2022+ browser support confirmed." },
  { id: 82, title: "CSS Backdrop-Filter Blur with Overflow Hidden Fix — 2026 Guide", url: "https://copyprogramming.com/howto/transitioning-backdrop-filter-blur-on-an-element-with-overflow-hidden-parent-is-not-working", part: 4, tags: ["glassmorphism", "debugging", "stacking-context"], type: "tutorial", desc: "Solves the #1 glassmorphism bug: blur disappears with overflow: hidden parent. Explains stacking context isolation, the zero-pixel filter workaround, and performance-safe animation patterns (animate opacity, not blur values)." },
];

const PARTS = {
  1: { label: "Core Morphisms", color: "#00E5FF", count: 0 },
  2: { label: "Emerging Trends", color: "#00FF88", count: 0 },
  3: { label: "AI Workflow", color: "#FFA000", count: 0 },
  4: { label: "Tools & Performance", color: "#B400FF", count: 0 },
};
SOURCES.forEach(s => { if (PARTS[s.part]) PARTS[s.part].count++; });

const TYPE_ICONS = {
  docs: "📘",
  tutorial: "🔧",
  article: "📝",
  tool: "⚡",
  github: "🔗",
};

const TYPE_LABELS = {
  docs: "Documentation",
  tutorial: "Tutorial",
  article: "Article",
  tool: "Tool / Generator",
  github: "GitHub / Issue",
};

const ALL_TAGS = [...new Set(SOURCES.flatMap(s => s.tags))].sort();

export default function App() {
  const [search, setSearch] = useState("");
  const [activePart, setActivePart] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    return SOURCES.filter(s => {
      if (activePart && s.part !== activePart) return false;
      if (activeType && s.type !== activeType) return false;
      if (activeTags.length > 0 && !activeTags.some(t => s.tags.includes(t))) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) ||
               s.desc.toLowerCase().includes(q) ||
               s.tags.some(t => t.includes(q));
      }
      return true;
    });
  }, [search, activePart, activeType, activeTags]);

  const toggleTag = (tag) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const clearAll = () => { setSearch(""); setActivePart(null); setActiveType(null); setActiveTags([]); };

  const hasFilters = search || activePart || activeType || activeTags.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", color: "rgba(255,255,255,0.92)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,14,26,0.95)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 600, color: "rgba(0,229,255,0.9)", letterSpacing: 0.5, margin: 0 }}>Morphism Theory</h1>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Sources &amp; Resources</span>
            <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{filtered.length} / {SOURCES.length}</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Every source referenced in the Vibecoders handbook — filterable, searchable, annotated with practical context.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search sources by title, description, or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 16px 10px 36px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "rgba(255,255,255,0.9)",
              fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(0,229,255,0.3)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.4 }}>⌕</span>
        </div>

        {/* Part filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {Object.entries(PARTS).map(([key, part]) => {
            const k = parseInt(key);
            const isActive = activePart === k;
            return (
              <button key={k} onClick={() => setActivePart(isActive ? null : k)} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.2s",
                background: isActive ? `${part.color}15` : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? part.color + "40" : "rgba(255,255,255,0.06)"}`,
                color: isActive ? part.color : "rgba(255,255,255,0.5)",
              }}>
                Part {key}: {part.label}
                <span style={{ marginLeft: 6, opacity: 0.5 }}>{part.count}</span>
              </button>
            );
          })}
          {hasFilters && (
            <button onClick={clearAll} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer",
              fontFamily: "inherit", background: "rgba(255,80,80,0.08)",
              border: "1px solid rgba(255,80,80,0.2)", color: "rgba(255,120,120,0.8)",
            }}>✕ Clear all</button>
          )}
        </div>

        {/* Type filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {Object.entries(TYPE_LABELS).map(([key, label]) => {
            const isActive = activeType === key;
            return (
              <button key={key} onClick={() => setActiveType(isActive ? null : key)} style={{
                padding: "4px 10px", borderRadius: 5, fontSize: 10, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", transition: "all 0.2s",
                background: isActive ? "rgba(0,229,255,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? "rgba(0,229,255,0.25)" : "rgba(255,255,255,0.05)"}`,
                color: isActive ? "rgba(0,229,255,0.85)" : "rgba(255,255,255,0.4)",
              }}>
                {TYPE_ICONS[key]} {label}
              </button>
            );
          })}
        </div>

        {/* Tag cloud */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 20 }}>
          {ALL_TAGS.map(tag => {
            const isActive = activeTags.includes(tag);
            return (
              <button key={tag} onClick={() => toggleTag(tag)} style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 9, cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s",
                background: isActive ? "rgba(255,160,0,0.1)" : "transparent",
                border: `1px solid ${isActive ? "rgba(255,160,0,0.3)" : "rgba(255,255,255,0.04)"}`,
                color: isActive ? "rgba(255,160,0,0.85)" : "rgba(255,255,255,0.3)",
              }}>
                {tag}
              </button>
            );
          })}
        </div>

        {/* Sources list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(source => {
            const part = PARTS[source.part];
            const isExpanded = expanded === source.id;
            return (
              <div key={source.id}
                onClick={() => setExpanded(isExpanded ? null : source.id)}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${isExpanded ? part.color + "30" : "rgba(255,255,255,0.04)"}`,
                  borderRadius: 10, padding: "12px 16px", cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isExpanded ? `0 0 20px ${part.color}08` : "none",
                }}>

                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{TYPE_ICONS[source.type]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.88)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isExpanded ? "normal" : "nowrap" }}>
                      {source.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: "1px 6px",
                        borderRadius: 3, background: part.color + "10", color: part.color, border: `1px solid ${part.color}20`,
                      }}>Part {source.part}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                        {TYPE_LABELS[source.type]}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>▼</span>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <p style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", margin: "0 0 12px" }}>
                      {source.desc}
                    </p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                      {source.tags.map(tag => (
                        <span key={tag} onClick={e => { e.stopPropagation(); toggleTag(tag); }} style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: "2px 6px",
                          borderRadius: 3, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                          color: activeTags.includes(tag) ? "rgba(255,160,0,0.85)" : "rgba(255,255,255,0.35)",
                          cursor: "pointer",
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "6px 14px",
                      borderRadius: 6, background: `${part.color}10`, border: `1px solid ${part.color}25`,
                      color: part.color, textDecoration: "none", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${part.color}20`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${part.color}10`; }}
                    >
                      Open resource →
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⌕</div>
            <div style={{ fontSize: 13 }}>No sources match the current filters</div>
            <button onClick={clearAll} style={{
              marginTop: 12, padding: "6px 16px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              fontFamily: "inherit", background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.2)", color: "rgba(0,229,255,0.8)",
            }}>Clear filters</button>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
            {SOURCES.length} sources curated from the Morphism Theory for Vibecoders handbook · Feb 2026
          </p>
        </div>
      </div>
    </div>
  );
}
