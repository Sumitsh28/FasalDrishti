import type { Plant } from "../types";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface AIAnalysisResult {
  plantName: string;
  healthStatus: Plant["healthStatus"] | "error";
  confidence: number;
  diagnosis: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const analyzePlantWithAI = async (
  file: File
): Promise<AIAnalysisResult> => {
  if (!API_KEY) {
    throw new Error("OpenAI API Key is missing");
  }

  const base64Image = await fileToBase64(file);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert agronomist. Analyze the plant image provided.
          Return ONLY a valid JSON object (no markdown, no backticks) with this structure:
          {
            "plantName": "string (e.g. Tomato, Corn)",
            "healthStatus": "string (strictly one of: 'healthy', 'pest', 'disease', 'water-stress')",
            "confidence": number (0-100),
            "diagnosis": "string (short 1 sentence explanation)"
          }
          If the image is not a plant, return "healthStatus": "error".`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this plant.",
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.1,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "AI Analysis Failed");
  }

  const content = data.choices[0].message.content;

  const cleanContent = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanContent);
};
