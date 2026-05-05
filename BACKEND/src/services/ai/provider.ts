import { LocalAiProvider } from "./local-ai.provider.js";
import { OpenAiVisionProvider } from "./openai-vision.provider.js";
import { TesseractAiProvider } from "./tesseract-ai.provider.js";
import { env } from "../../env.js";
import { AiProvider } from "./provider.types.js";

// Factory keeps provider switching obvious and env-driven.
export const createAiProvider = (): AiProvider => {
  const provider = env.aiProvider;

  if (provider === "openai" && env.openAiApiKey) {
    return new OpenAiVisionProvider();
  }

  if (provider === "tesseract") {
    return new TesseractAiProvider();
  }

  return new LocalAiProvider();
};
