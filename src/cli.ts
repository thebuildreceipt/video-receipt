#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseSrt, toPromptTranscript } from "./srt.js";
import { checkChapters, checkShorts } from "./validate.js";
import { costUsd } from "./cost.js";
import { renderMarkdown } from "./render.js";
import type { VideoPackage } from "./schema.js";

const [file, ...flags] = process.argv.slice(2);
if (!file) {
  console.error("Usage: video-receipt <transcript.srt> [--dry-run]");
  process.exit(1);
}
const dryRun = flags.includes("--dry-run");
const started = Date.now();

const cues = parseSrt(await readFile(file, "utf8"));
if (!cues.length) throw new Error("No captions found in the file.");
const duration = cues[cues.length - 1].end;
const transcript = toPromptTranscript(cues);

let pkg: VideoPackage;
let receipt: string;
if (dryRun) {
  // No API call: load the saved example output so the pipeline can be tested for free.
  const sample = path.join(path.dirname(file), "sample-output.json");
  pkg = JSON.parse(await readFile(sample, "utf8"));
  receipt = `Dry run · 0 tokens · $0.00 · ${Date.now() - started} ms`;
} else {
  const { generatePackage } = await import("./generate.js");
  const { pkg: out, usage, model } = await generatePackage(transcript, duration);
  pkg = out;
  const cost = costUsd(model, usage.input_tokens, usage.output_tokens);
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  receipt = `${model} · ${usage.input_tokens} in / ${usage.output_tokens} out tokens · ${
    cost === null ? "price unknown" : `$${cost.toFixed(4)}`
  } · ${seconds} s`;
}

const problems = [...checkChapters(pkg.chapters, duration), ...checkShorts(pkg.shorts, duration)];
const outFile = file.replace(/\.srt$/i, "") + ".package.md";
await writeFile(outFile, renderMarkdown(pkg, receipt, problems));
console.log(`Wrote ${outFile}\n${receipt}`);
if (problems.length) console.log(`${problems.length} check(s) need attention; see the Checks section.`);
