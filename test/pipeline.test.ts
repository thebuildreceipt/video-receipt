import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSrt, formatTime, toPromptTranscript } from "../src/srt.js";
import { checkChapters, checkShorts } from "../src/validate.js";
import { costUsd } from "../src/cost.js";

const SRT = `1
00:00:00,000 --> 00:00:04,500
My AI just found four bugs.

2
00:01:05,250 --> 00:01:09,000
MCP is a standard plug.
Like USB-C for AI.
`;

test("parses cues, multi-line text and timestamps", () => {
  const cues = parseSrt(SRT);
  assert.equal(cues.length, 2);
  assert.equal(cues[1].start, 65.25);
  assert.equal(cues[1].text, "MCP is a standard plug. Like USB-C for AI.");
  assert.equal(toPromptTranscript(cues).split("\n")[1], "[1:05] MCP is a standard plug. Like USB-C for AI.");
});

test("formats times like YouTube chapters", () => {
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(65.9), "1:05");
  assert.equal(formatTime(3725), "1:02:05");
});

test("accepts valid chapters", () => {
  const ok = [
    { seconds: 0, title: "Result" },
    { seconds: 30, title: "Problem" },
    { seconds: 90, title: "Build" },
  ];
  assert.deepEqual(checkChapters(ok, 300), []);
});

test("flags chapters YouTube would reject", () => {
  const bad = [
    { seconds: 5, title: "Intro" },
    { seconds: 10, title: "Too short" },
  ];
  const problems = checkChapters(bad, 300);
  assert.ok(problems.some((p) => p.includes("at least 3")));
  assert.ok(problems.some((p) => p.includes("0:00")));
  assert.ok(problems.some((p) => p.includes("shorter than 10s")));
});

test("flags Shorts that are too long or past the end", () => {
  const problems = checkShorts([{ start_seconds: 250, end_seconds: 320, hook: "x" }], 300);
  assert.equal(problems.length, 2);
});

test("computes cost receipts", () => {
  assert.equal(costUsd("claude-opus-5-5", 10_000, 2_000), 0.08);
  assert.equal(costUsd("unknown-model", 1, 1), null);
});
