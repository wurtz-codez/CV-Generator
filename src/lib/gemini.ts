import { GoogleGenerativeAI } from "@google/generative-ai";
import { COVER_LETTER_PROMPT, PARSE_JD_METADATA_PROMPT } from "./prompts";

export async function streamCoverLetter(
  resume: string,
  jd: string,
  apiKey: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
  const prompt = COVER_LETTER_PROMPT(resume, jd);
  
  const result = await model.generateContentStream(prompt);
  
  let full = "";
  for await (const chunk of result.stream) {
    const text = chunk.text();
    full += text;
    onChunk(text);
  }
  
  return full;
}

export async function parseJDMetadata(
  jd: string,
  apiKey: string
): Promise<{ jobTitle: string; company: string }> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(PARSE_JD_METADATA_PROMPT(jd));
    
    // Parse the JSON string from the response
    let text = result.response.text();
    // Remove markdown code blocks if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JD metadata", err);
    return { jobTitle: "Unknown Role", company: "Unknown Company" };
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    await model.generateContent("hi");
    return true;
  } catch {
    return false;
  }
}