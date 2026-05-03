// Local OCR provider is a stub that turns owner hints into text until real OCR is plugged in.
export class LocalOcrProvider {
  async readText(input: {
    imageUrl: string;
    rawText?: string;
    manualHint?: string;
  }) {
    const imageHint = input.imageUrl
      .split("/")
      .pop()
      ?.replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]/g, " ") ?? "";

    return [input.rawText, input.manualHint, imageHint].filter(Boolean).join(" ").trim();
  }
}
