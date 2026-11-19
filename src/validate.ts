import type { VideoPackage } from "./schema.js";
import { formatTime } from "./srt.js";

/**
 * YouTube only shows chapters if the first starts at 0:00, there are at least 3,
 * and each is at least 10 seconds long. The model sometimes gets this wrong, so we check in code.
 */
export function checkChapters(chapters: VideoPackage["chapters"], duration: number): string[] {
  const problems: string[] = [];
  if (chapters.length < 3) problems.push(`Need at least 3 chapters, got ${chapters.length}`);
  if (chapters[0]?.seconds !== 0) problems.push("First chapter must start at 0:00");
  chapters.forEach((c, i) => {
    const next = chapters[i + 1]?.seconds ?? duration;
    if (c.seconds >= duration) problems.push(`Chapter "${c.title}" starts after the video ends`);
    else if (next - c.seconds < 10) problems.push(`Chapter "${c.title}" at ${formatTime(c.seconds)} is shorter than 10s`);
    if (i > 0 && c.seconds <= chapters[i - 1].seconds) problems.push(`Chapter "${c.title}" is out of order`);
  });
  return problems;
}

export function checkShorts(shorts: VideoPackage["shorts"], duration: number): string[] {
  return shorts.flatMap((s) => {
    const len = s.end_seconds - s.start_seconds;
    const out: string[] = [];
    if (len < 15 || len > 60) out.push(`Short "${s.hook}" is ${Math.round(len)}s (want 15-60s)`);
    if (s.end_seconds > duration) out.push(`Short "${s.hook}" ends after the video`);
    return out;
  });
}
