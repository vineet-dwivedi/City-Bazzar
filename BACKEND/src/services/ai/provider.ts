import { LocalAiProvider } from "./local-ai.provider.js";
import { OpenAiVisionProvider } from "./openai-vision.provider.js";
import { AiProvider } from "./provider.types.js";

// Factory keeps provider switching obvious and env-driven.
export const createAiProvider = (): AiProvider => {
  if ((process.env.AI_PROVIDER ?? "local").toLowerCase() === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAiVisionProvider();
  }

  return new LocalAiProvider();
};
