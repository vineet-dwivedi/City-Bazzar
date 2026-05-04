import { ProductCategory } from "../../types.js";

export interface AiAnalyzeInput {
  imageUrl: string;
  rawText?: string;
  manualHint?: string;
}

export interface AiExtractedFields {
  name: string;
  brand: string;
  category: ProductCategory;
  mrp: number | null;
  price: number | null;
}

export interface AiAnalysisDraft {
  provider: string;
  model: string;
  combinedText: string;
  confidence: number;
  extracted: AiExtractedFields;
  keywords: string[];
  notes: string[];
}

export interface AiProvider {
  analyze(input: AiAnalyzeInput): Promise<AiAnalysisDraft>;
}
