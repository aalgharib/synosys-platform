import { createRequire } from "node:module";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const INPUT_CSS = `
@custom-variant dark (&:where(.dark, .dark *));
@import "tailwindcss";
@theme inline {
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-sidebar: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-glow: hsl(var(--glow-primary));
  --font-sans: "Inter", system-ui, sans-serif;
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
`;

const SOURCE_FILES = [
  "index.html",
  "src/App.tsx",
  "src/main.tsx",
  "src/index.css",
  "src/context/ThemeContext.tsx",
  "src/components/BrandLogo.tsx",
  "src/components/Dashboard.tsx",
  "src/components/PosterCreator.tsx",
  "src/components/ThemeToggle.tsx",
  "src/components/YoutubeThumbnailCreator.tsx",
];

const OUTPUT_FILE = path.join(projectRoot, "src", "tailwind.generated.css");

const extractCandidates = (source) => {
  const candidates = new Set();
  const stringMatches = source.match(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g) ?? [];

  for (const match of stringMatches) {
    const value = match.slice(1, -1);

    for (const token of value.split(/\s+/)) {
      if (!token || token.length < 2) {
        continue;
      }

      if (!/[\-:[\]\/]/.test(token)) {
        continue;
      }

      candidates.add(token.replace(/[`,]/g, ""));
    }
  }

  return candidates;
};

const loadStylesheet = async (id, base) => {
  const resolvedPath = id === "tailwindcss"
    ? require.resolve("tailwindcss/index.css")
    : path.isAbsolute(id)
      ? id
      : base.startsWith("file:")
        ? path.resolve(path.dirname(fileURLToPath(base)), id)
        : path.resolve(path.dirname(base), id);

  const content = await fs.readFile(resolvedPath, "utf8");

  return {
    path: resolvedPath,
    base: path.dirname(resolvedPath),
    content,
  };
};

const compiler = await compile(INPUT_CSS, {
  base: projectRoot,
  from: path.join(projectRoot, "src", "tailwind.input.css"),
  loadStylesheet,
});

const candidates = new Set();
for (const file of SOURCE_FILES) {
  const absolutePath = path.join(projectRoot, file);
  const content = await fs.readFile(absolutePath, "utf8");

  for (const candidate of extractCandidates(content)) {
    candidates.add(candidate);
  }
}

const css = compiler.build([...candidates].sort());
await fs.writeFile(OUTPUT_FILE, css, "utf8");
console.log(`Generated ${path.relative(projectRoot, OUTPUT_FILE)} with ${candidates.size} candidates.`);
