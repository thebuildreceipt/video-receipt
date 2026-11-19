# video-receipt

Turn a video transcript (`.srt`) into everything you need to publish: **10 titles, a description, chapters, tags, 3 Shorts cuts and a newsletter draft**, plus a cost receipt for the run.

Built in the video **"I Automated My YouTube Workflow With Claude (Repo Included)"** from The Build Receipt.

## How it works

```
transcript.srt
   │  parse (code, free)
   ▼
[m:ss] timestamped text
   │  one Claude call, structured JSON output
   ▼
titles · description · chapters · shorts · tags · newsletter
   │  validate in code: YouTube's chapter rules, Short lengths
   ▼
transcript.package.md  +  receipt (tokens, $, seconds)
```

The AI does the writing. **Code does the checking.** YouTube silently drops chapters if the first isn't at 0:00, there are fewer than 3, or any is under 10 seconds, so those rules are enforced in `src/validate.ts`, not in the prompt.

## Try it free (no API key)

```bash
npm install
npm test        # 6 unit tests
npm run demo    # dry run on examples/mcp-explained.srt using a saved output
```

## Run it for real

1. Get a transcript: in YouTube Studio → Subtitles, download your auto-captions as `.srt` (or use any transcription tool).
2. Authenticate with the Anthropic API (`ANTHROPIC_API_KEY`, or `ant auth login`).
3. Run:

```bash
npm run build
node dist/src/cli.js path/to/your-video.srt
```

It writes `your-video.package.md` and prints a receipt like:
`claude-opus-5-5 · 4210 in / 1630 out tokens · $0.0495 · 21.4 s` (example format, not a measured result).

**Cost control:** set a monthly spend limit in the Anthropic Console before running anything on a schedule.

## Files

| File | What it does |
|---|---|
| `src/srt.ts` | Parses `.srt` into `[m:ss] text` |
| `src/schema.ts` | The output shape (Zod), sent to Claude as a structured-output schema |
| `src/generate.ts` | The single Claude call (with refusal fallback) |
| `src/validate.ts` | YouTube chapter rules and Short length checks |
| `src/cost.ts` | Token prices → dollar receipt |
| `src/render.ts` | Markdown output |

MIT License
