"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeIdImage(formData: FormData) {
  try {
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) {
      return { success: false, message: "No image provided" };
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return { success: false, message: "OCR API Key not configured" };
    }

    // Use highly stable version to avoid 503
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `Analyze this ID document image (Thai ID Card, Thai Driver's License, or Passport).
Extract the following information and output ONLY a valid JSON object.
Required Keys:
"cardType": "บัตรประชาชน" for Thai ID Card, "ใบขับขี่" for Thai Driver's License, "พาสปอร์ต" for Passport, or "อื่นๆ" if unknown.
"idNumber": The identification number (e.g. 13-digit Thai ID, or Passport number). DO NOT include spaces or dashes.
"fullName": The full name in Thai if available, otherwise in English. For Thai ID/Driver License, format as "Title Name Lastname" (e.g., นาย สมชาย ใจดี หรือ น.ส. สมหญิง ใจดี).
Do not guess, extract from the image exactly.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: { data: base64Data, mimeType: imageFile.type },
      },
    ]);

    const text = result.response.text();
    console.log("OCR Raw Output:", text);
    try {
      const data = JSON.parse(text);
      return { success: true, data };
    } catch (e: any) {
      console.error("JSON Parse Error:", text);
      return { success: false, message: "Response is not valid JSON" };
    }
  } catch (err: any) {
    console.error("OCR Error:", err);
    return { success: false, message: "OCR Failed: " + err.message };
  }
}
