import { z } from "zod";

export const PackageSchema = z.object({
  titles: z.array(z.string()).describe("10 title options, best first, under 70 characters each"),
  description: z.string().describe("YouTube description: 2-3 sentence summary, no chapters, no links"),
  chapters: z
    .array(z.object({ seconds: z.number(), title: z.string() }))
    .describe("Chapters in order; the first must start at 0"),
  shorts: z
    .array(z.object({ start_seconds: z.number(), end_seconds: z.number(), hook: z.string() }))
    .describe("3 self-contained moments of 20-55 seconds that work as Shorts"),
  tags: z.array(z.string()).describe("8-12 search tags"),
  newsletter: z.object({ subject: z.string(), body: z.string() }),
});

export type VideoPackage = z.infer<typeof PackageSchema>;
