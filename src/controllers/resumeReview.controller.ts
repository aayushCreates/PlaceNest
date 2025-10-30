import { Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import fs from 'fs';
import { PDFParse } from "pdf-parse";

const cilent = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

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

    const dataBuffer = fs.readFileSync(resumeFilePath as string);
    const parsedPdf = await new PDFParse(dataBuffer);
    const pdfText = parsedPdf.getText();

    fs.unlinkSync(resumeFilePath);

    const response = await cilent.responses.create({
      model: "gpt-4.1-mini",
      instructions:
        "You are a senior recruiter which selects the candidates for the all types of tech role and having alot of experience which is 15 years and you have hired freshers, experience techs.",
      input: [
        {
          role: "system",
          content: "You are a resume parser. Extract key details from resumes.",
        },
        {
          role: "user",
          content: "Please extract information from this resume:",
        },
        {
          role: "user",
          content: `${userPromptText}. I am giving you my resume content ${pdfText}`,
        },
      ],
    });

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
    });
  }
};
