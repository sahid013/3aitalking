import { config } from '@/lib/config';
import { ConversationMessage } from '@/types';

/**
 * OpenAI Service
 * Handles conversation with ChatGPT API
 */
export class OpenAIService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = config.openai.apiKey;
    this.model = config.openai.model;

    if (!this.apiKey) {
      console.error('OpenAI API key is not configured');
    }
  }

  /**
   * Send a chat message and get response
   */
  async chat(
    messages: ConversationMessage[],
    systemPrompt?: string
  ): Promise<string> {
    if (!this.apiKey) {
      console.error('❌ OpenAI API key is not configured!');
      throw new Error('OpenAI API key is not configured');
    }

    console.log('🔄 Sending request to OpenAI...');
    console.log('Model:', this.model);
    console.log('Messages:', messages.length);

    try {
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              systemPrompt ||
              config.conversation.defaultPatientRole,
          },
          ...messages.map((msg) => ({
            role: msg.role === 'student' ? 'user' : 'assistant',
            content: msg.text,
          })),
        ],
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error response:', errorText);

        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || 'OpenAI API request failed';
        } catch {
          errorMessage = `OpenAI API request failed: ${response.status} ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ OpenAI response received:', data.choices[0].message.content);
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Stream chat response (for real-time UI updates)
   */
  async *chatStream(
    messages: ConversationMessage[],
    systemPrompt?: string
  ): AsyncGenerator<string, void, unknown> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                systemPrompt ||
                config.conversation.defaultPatientRole,
            },
            ...messages.map((msg) => ({
              role: msg.role === 'student' ? 'user' : 'assistant',
              content: msg.text,
            })),
          ],
          max_tokens: config.openai.maxTokens,
          temperature: config.openai.temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw error;
    }
  }

  /**
   * Generate text-to-speech audio using OpenAI TTS
   */
  async generateSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1', // or 'tts-1-hd' for higher quality
          input: text,
          voice: voice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI TTS request failed');
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw error;
    }
  }
}
