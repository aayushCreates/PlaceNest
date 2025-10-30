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
        model: 'gpt-4.1-mini',
        instructions: `
      You are a highly experienced senior recruiter with 15 years of experience hiring candidates 
      for all types of technical roles, from freshers to senior engineers. You are an expert at analyzing 
      resumes and providing actionable feedback. Your goals are:
      
      1. Extract key information such as:
         - Full Name
         - Contact Information (Email, Phone)
         - Professional Summary
         - Skills (technical and soft skills)
         - Work Experience (company, role, duration, responsibilities)
         - Education (degree, institution, graduation year)
         - Certifications
         - Projects and Achievements
      
      2. Evaluate the resume and provide constructive feedback, including:
         - Strengths of the resume
         - Weaknesses or missing information
         - Suggestions to improve readability and impact
      
      3. Return the response in a **structured JSON format** so it can be easily parsed by a program.
      
      Always act as an expert recruiter giving practical, clear, and actionable advice.
        `,
        input: [
          { role: "system", content: "You are a resume analysis assistant." },
          { role: "user", content: `Please analyze the following resume and provide extracted details and improvement suggestions: ${pdfText}` }
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
