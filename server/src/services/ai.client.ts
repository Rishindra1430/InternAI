import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/response.utils.js';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  systemInstruction?: {
    parts: {
      text: string;
    }[];
  };
}

interface GeminiResponse {
  candidates?: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Wrapper for Gemini API calls via REST.
 * Handles retries, JSON parsing, and error handling.
 */
export const aiClient = {
  /**
   * Call Gemini API with user prompt and system instruction.
   * Enforces JSON-only responses for structured parsing.
   */
  async callGemini(
    userPrompt: string,
    systemPrompt: string,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `${GEMINI_API_ENDPOINT}/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

        const payload: GeminiRequest = {
          contents: [
            {
              parts: [
                {
                  text: userPrompt,
                },
              ],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as GeminiResponse;
          throw new Error(
            `Gemini API error: ${errorData.error?.message || response.statusText}`
          );
        }

        const data = (await response.json()) as GeminiResponse;

        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No candidates in Gemini response');
        }

        const firstCandidate = data.candidates[0];
        if (!firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
          throw new Error('No text content in Gemini response');
        }

        return firstCandidate.content.parts[0].text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          logger.warn(
            `Gemini API attempt ${attempt} failed: ${lastError.message}. Retrying in ${backoffMs}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    if (lastError) {
      logger.error(`Gemini API failed after ${maxRetries} attempts: ${lastError.message}`);
      throw new AppError(
        `AI service unavailable: ${lastError.message}`,
        502
      );
    }

    throw new AppError('AI service error', 502);
  },
};
