
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ModelId } from "../types";

// Initialize the API client strictly using the environment variable as requested.
// NOTE: process.env.API_KEY is assumed to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (modelId: string = ModelId.FLASH): Chat => {
  return ai.chats.create({
    model: modelId,
    config: {
      temperature: 0.7,
      systemInstruction: "You are LandscaperAI, a specialized assistant for professional landscapers. Help users with plant selection, hardscape estimation, design ideas, and client communication.",
    },
  });
};

export const sendMessageStream = async (
  chat: Chat,
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    return await chat.sendMessageStream({ message });
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateLandscapeDesign = async (
  imageBase64: string, 
  mimeType: string, 
  prompt: string
): Promise<string | null> => {
  try {
    // Strip the data url prefix if present to get raw base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Act as a professional landscape architect. Transform this image according to the following request, ensuring the result looks photorealistic and maintains the perspective of the original photo: ${prompt}`,
          },
        ],
      },
    });

    // Iterate through parts to find the image output
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};
