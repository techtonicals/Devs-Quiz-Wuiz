
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Difficulty } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AiQuizResponse {
  topic: string;
  questions: QuizQuestion[];
}

export async function getTopicsForSubject(subject: string, grade: number): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 10 specific academic topics for a ${grade}th-grade student in Houston ISD for the subject of '${subject}'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.topics || [];
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw new Error("Failed to generate topics. The model might be busy. Please try again.");
  }
}

export async function generateQuiz(subject: string, topic: string, numQuestions: number, grade: number, difficulty: Difficulty): Promise<QuizQuestion[]> {
  try {
    const topicPrompt = topic === 'All' ? `covering a comprehensive range of topics` : `about '${topic}'`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a ${numQuestions}-question, ${grade}th-grade level, multiple-choice quiz ${topicPrompt} within the subject of '${subject}' for a student in Houston ISD. 
      The difficulty level should be '${difficulty}'. 
      Ensure all questions are unique and no question is repeated within the quiz.
      Each question must have exactly 4 options, and only one is correct. 
      IMPORTANT: For every question, provide a detailed, encouraging, and educational 'explanation' (max 2-3 sentences) explaining WHY the correct answer is right and why other common misconceptions might be wrong.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The quiz question."
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "An array of 4 possible answers."
              },
              correctAnswer: {
                type: Type.STRING,
                description: "The correct answer, which must be one of the options."
              },
              explanation: {
                type: Type.STRING,
                description: "A detailed explanation of why the answer is correct."
              }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    
    const jsonString = response.text.trim();
    const quizData = JSON.parse(jsonString);

    if (!Array.isArray(quizData) || quizData.some(q => !q.question || !q.options || !q.correctAnswer || !q.explanation)) {
      throw new Error("Received malformed quiz data from the API.");
    }

    return quizData as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate the quiz. Please check your configuration and try again.");
  }
}

export async function generateQuizFromPrompt(prompt: string, numQuestions: number, grade: number, difficulty: Difficulty): Promise<AiQuizResponse> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following request from a ${grade}th-grade student, identify the core academic topic and generate a quiz.
      Request: "${prompt}"
      
      Generate a ${numQuestions}-question, ${grade}th-grade level, multiple-choice quiz about the identified topic.
      The difficulty level should be '${difficulty}'.
      Ensure all questions are unique.
      Each question must have exactly 4 options, and only one is correct.
      IMPORTANT: For every question, provide a detailed, encouraging, and educational 'explanation' explaining why the correct answer is right.
      
      Return the result as a JSON object containing the identified 'topic' and an array of 'questions'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: {
              type: Type.STRING,
              description: "The academic topic identified from the user's request."
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The quiz question."
                  },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                    description: "An array of 4 possible answers."
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "The correct answer, which must be one of the options."
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A detailed explanation of why the answer is correct."
                  }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["topic", "questions"]
        }
      }
    });

    const jsonString = response.text.trim();
    const quizData = JSON.parse(jsonString);

    if (!quizData.topic || !Array.isArray(quizData.questions)) {
      throw new Error("Received malformed quiz data from the API.");
    }
    
    return quizData as AiQuizResponse;
  } catch (error) {
    console.error("Error generating quiz from prompt:", error);
    throw new Error("Failed to generate the quiz from your request. The model might be busy. Please try again with a clearer topic.");
  }
}
