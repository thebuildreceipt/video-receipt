import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { PackageSchema } from "./schema.js";

export const MODEL = "claude-opus-5-5";

const SYSTEM = `You package YouTube videos for a developer audience (channel: The Build Receipt, AI builds with real code and real costs, no hype).
Write titles that are specific and curiosity-driven, without clickbait words like INSANE or GAME CHANGER.
Base every chapter and Short timestamp on the [m:ss] markers in the transcript. Never invent content that is not in the transcript.`;

export async function generatePackage(transcript: string, durationSeconds: number) {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    // If the model declines, the API retries on a fallback model in the same call.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(PackageSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Video length: ${Math.round(durationSeconds)} seconds.\n\nTranscript:\n${transcript}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new Error("The model declined this transcript.");
  if (response.stop_reason === "max_tokens") throw new Error("Output was cut off; raise max_tokens.");
  const pkg = response.parsed_output;
  if (!pkg) throw new Error("Could not parse the model output.");
  return { pkg, usage: response.usage, model: response.model };
}
