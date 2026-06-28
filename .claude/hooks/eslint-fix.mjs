#!/usr/bin/env node
// PostToolUse hook: esegue `eslint --fix` sul file appena modificato.
// Non blocca mai il flusso (esce sempre 0): il lint è un aiuto, non un muro.
// ESLint è il gate di qualità del progetto (non c'è Prettier).
import { spawnSync } from "node:child_process";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    if (process.stdin.isTTY) resolve("");
  });
}

const raw = await readStdin();

let fp = "";
try {
  fp = JSON.parse(raw || "{}").tool_input?.file_path ?? "";
} catch {
  process.exit(0);
}

const LINTABLE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
if (!fp || !LINTABLE.test(fp)) process.exit(0);

// `--no-error-on-unmatched-pattern` evita rumore se il file è ignorato
// (es. dentro .next/). shell:true serve a risolvere npx su Windows.
spawnSync("npx", ["eslint", "--fix", "--no-error-on-unmatched-pattern", fp], {
  cwd: process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
  stdio: "inherit",
  shell: true,
});

// Sempre 0: gli errori non autofixabili non devono interrompere il lavoro.
process.exit(0);
