/** Parse an .srt transcript into timestamped lines. No AI involved. */
export type Cue = { start: number; end: number; text: string };

const TIME = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{3})/;

export function toSeconds(stamp: string): number {
  const m = stamp.match(TIME);
  if (!m) throw new Error(`Bad timestamp: ${stamp}`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000;
}

export function formatTime(totalSeconds: number): string {
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function parseSrt(raw: string): Cue[] {
  return raw
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.trim().split("\n"))
    .filter((lines) => lines.length >= 2)
    .flatMap((lines) => {
      const timeLine = lines.find((l) => l.includes("-->"));
      if (!timeLine) return [];
      const [a, b] = timeLine.split("-->");
      const text = lines.slice(lines.indexOf(timeLine) + 1).join(" ").trim();
      return text ? [{ start: toSeconds(a), end: toSeconds(b), text }] : [];
    });
}

/** Compact form sent to the model: "[m:ss] text" per cue. */
export function toPromptTranscript(cues: Cue[]): string {
  return cues.map((c) => `[${formatTime(c.start)}] ${c.text}`).join("\n");
}
