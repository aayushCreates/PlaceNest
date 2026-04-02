import { Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import { getTextExtractor } from "office-text-extractor";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

const getModel = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    
    console.log("Initializing Gemini with API Key starting with:", apiKey.substring(0, 4) + "...");
    
    genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-flash which is the standard model name
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });  }
  return model;
};

const extractor = getTextExtractor();

export const getResumeReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user || user.role === "COMPANY") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined");
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured",
      });
    }

    const { userPromptText } = req.body;

    const resumeFilePath = req.file?.path;
    if (!resumeFilePath) {
      return res.status(400).json({
        success: false,
        message: "Resume file not provided",
      });
    }

    if (!fs.existsSync(resumeFilePath)) {
        return res.status(400).json({
            success: false,
            message: "Resume file not found on server",
        });
    }

    const fileBuffer = fs.readFileSync(resumeFilePath);

    let pdfText = "";
    try {
      pdfText = await extractor.extractText({
        input: fileBuffer,
        type: "buffer",
      });
    } catch (err) {
      console.error("Error extracting text from resume:", err);
      return res.status(400).json({
        success: false,
        message: "Error extracting text from resume",
        error: err,
      });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from the provided resume file. Please ensure it is a valid PDF/Docx and contains selectable text.",
      });
    }

    const geminiPrompt = `
      You are an expert technical recruiter and resume parser with 15+ years of experience.

      Your goal is to analyze resumes deeply, extract structured details, and optionally rewrite or format them according to a target role if provided.

      Rules:
      - Extract key details with high accuracy
      - Capture both summary-level insights and granular structured data
      - If a target role is mentioned, rewrite that part accordingly without inventing details
      - Only respond based on the user's request

      User prompt: ${userPromptText}

      Resume content:
      ${pdfText}

      Return the response with proper formatting and spacing.
      `;

    const currentModel = getModel();
    
    let geminiResult;
    try {
        geminiResult = await currentModel.generateContent(geminiPrompt);
    } catch (apiErr: any) {
        console.error("Gemini API Call Error:", apiErr);
        
        // If 404, suggest checking model name or API key permissions
        if (apiErr.status === 404) {
            return res.status(404).json({
                success: false,
                message: "Gemini model not found. Please verify your API key has access to 'gemini-1.5-flash' and that the model is available in your region.",
                error: apiErr.message
            });
        }
        throw apiErr;
    }
    
    if (!geminiResult || !geminiResult.response) {
      throw new Error("Empty response from Gemini API");
    }

    let geminiResponseText = "";
    try {
      geminiResponseText = geminiResult.response.text();
    } catch (err) {
      console.error("Error getting text from Gemini response:", err);
      const candidate = geminiResult.response.candidates?.[0];
      if (candidate?.finishReason === "SAFETY") {
        return res.status(400).json({
          success: false,
          message: "Response was blocked by safety filters. Please try a different prompt or resume.",
        });
      }
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Resume review generated successfully",
      data: geminiResponseText,
    });
  } catch (err: any) {
    console.error("Error in getting resume review:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error in getting response from server",
      error: err,
    });
  }
};
