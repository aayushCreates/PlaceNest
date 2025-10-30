import { Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import { getTextExtractor } from 'office-text-extractor';
import fs from 'fs';

const cilent = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY
});

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

    const { userPromptText } = req.body;

    const resumeFilePath = req.file?.path;
    if (!resumeFilePath) {
        return res.status(400).json({
          success: false,
          message: "Resume file not provided",
        });
      }

      const fileBuffer = fs.readFileSync(resumeFilePath as string);  

    const pdfText = await extractor.extractText({ input: fileBuffer, type:"buffer" });

    const response = await cilent.responses.create({
        model: "gpt-4.1-mini",
        instructions: `
          You are an expert technical recruiter and resume parser with 15+ years of experience.
          Your goal is to analyze resumes deeply, extract structured details, and optionally rewrite or format them according to a target role if provided.
          
          When parsing resumes:
          - Extract all key details with high accuracy.
          - Capture both summary-level insights and granular structured data.
          - If a target role or job title is mentioned by the user, rewrite or format that specific part of
            the resume accordingly (without inventing details).
          - you only do thing which user said to you and which are valid input not give out of context output.
      
          Response should be precise, comprehensive, and structured as well as proper format and spacing.
        `,
        input: [
          {
            role: "system",
            content: "You are a professional resume parser and formatter."
          },
          {
            role: "user",
            content: `The user has requested detailed parsing and optional role-based formatting.`
          },
          {
            role: "user",
            content: `User prompt: ${userPromptText}. Resume content: ${pdfText}`
          }
        ]
      });
      

    console.log("response: ", response.output_text);

    res.status(200).json({ 
        success: true,
        message: "response reivew got successfully",
        data: response.output_text
     });
  } catch (err) {
    console.log("Error in getting resume review");
    return res.status(500).json({
      success: false,
      message: "Error in getting response from server",
      error: err
    });
  }
};
