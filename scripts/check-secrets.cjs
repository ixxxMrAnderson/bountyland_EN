const { execFileSync } = require("node:child_process");
const fs = require("node:fs");

const trackedFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" }
)
  .split("\0")
  .filter(Boolean);

const forbiddenEnvFiles = trackedFiles.filter((file) => {
  const name = file.split("/").at(-1);
  return name?.startsWith(".env") && name !== ".env.example";
});

const keyPatterns = [
  { name: "OpenAI-style key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { name: "Google API key", regex: /\bAIza[A-Za-z0-9_-]{20,}\b/g },
  {
    name: "private key environment value",
    regex: /(?:SEPOLIA_PRIVATE_KEY|RESULT_ORACLE_PRIVATE_KEY)\s*=\s*0x[a-fA-F0-9]{64}\b/g
  }
];

const findings = forbiddenEnvFiles.map((file) => `${file}: tracked environment file`);

for (const file of trackedFiles) {
  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const pattern of keyPatterns) {
    if (pattern.regex.test(content)) {
      findings.push(`${file}: ${pattern.name}`);
    }
    pattern.regex.lastIndex = 0;
  }

  for (const match of content.matchAll(/^[ \t]*ZAI_API_KEY[ \t]*=[ \t]*([^\r\n]*)$/gm)) {
    const value = match[1].trim().replace(/^["']|["']$/g, "");
    if (value && !/^(your_|YOUR_|example|test-|<)/.test(value)) {
      findings.push(`${file}: non-empty ZAI_API_KEY assignment`);
    }
  }
}

if (findings.length) {
  console.error("Potential secrets found:\n" + findings.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Secret check passed for ${trackedFiles.length} tracked files.`);
