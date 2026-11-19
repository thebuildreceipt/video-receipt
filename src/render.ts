import type { VideoPackage } from "./schema.js";
import { formatTime } from "./srt.js";

export function renderMarkdown(pkg: VideoPackage, receipt: string, problems: string[]): string {
  const chapters = pkg.chapters.map((c) => `${formatTime(c.seconds)} ${c.title}`).join("\n");
  const fence = "```";
  return `# Video package

## Titles
${pkg.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

## Description (paste into YouTube)
${fence}
${pkg.description}

Chapters
${chapters}
${fence}

## Tags
${pkg.tags.join(", ")}

## Shorts to cut
${pkg.shorts.map((s) => `- ${formatTime(s.start_seconds)} → ${formatTime(s.end_seconds)}: ${s.hook}`).join("\n")}

## Newsletter
**Subject:** ${pkg.newsletter.subject}

${pkg.newsletter.body}

## Checks
${problems.length ? problems.map((p) => `- ⚠️ ${p}`).join("\n") : "- ✅ Chapters and Shorts pass YouTube's rules"}

## Receipt
${receipt}
`;
}
