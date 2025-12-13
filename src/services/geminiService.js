// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Configure the model with system prompt to act as a supportive companion
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.9,
    topP: 1,
    maxOutputTokens: 2048,
  },
});

// System prompt to set AI personality as a supportive mental health companion
const systemPrompt = `You are a caring and supportive virtual friend helping users manage stress, anxiety, and emotions. 

Your role:
- Listen empathetically to users' feelings and concerns
- Provide gentle encouragement and emotional support
- Suggest helpful coping strategies when appropriate
- When relevant, mention app features that might help:
  * "Volcano" exercise for releasing stress and anger
  * "Self-Care" activities for relaxation and wellness
  * "Mood Garden" for tracking emotional patterns
  * "Community" for connecting with others

Keep responses:
- Warm, friendly, and conversational (not clinical)
- Concise (2-4 sentences usually)
- Validating of their feelings
- Hopeful and encouraging

Remember: You're a supportive friend, not a therapist. For serious mental health concerns, encourage professional help.`;

// Chat history to maintain conversation context
let conversationHistory = [];

/**
 * Initialize or reset the conversation with system prompt
 */
export function initializeConversation() {
  conversationHistory = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [{ text: "I understand. I'm here as a supportive friend to listen and help." }],
    },
  ];
}

/**
 * Send a message to Gemini AI and get response
 * @param {string} userMessage - The message from the user
 * @returns {Promise<string>} - The AI's response
 */
export async function sendMessage(userMessage) {
  try {
    // Initialize conversation if empty
    if (conversationHistory.length === 0) {
      initializeConversation();
    }

    // Add user message to history
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All except the last message
    });

    // Send message and get response
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    // Add AI response to history
    conversationHistory.push({
      role: "model",
      parts: [{ text: response }],
    });

    return response;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get response from AI. Please try again.");
  }
}

/**
 * Load existing conversation history (e.g., from Firebase)
 * @param {Array} messages - Array of message objects with {sender, message}
 */
export function loadConversationHistory(messages) {
  initializeConversation();
  
  messages.forEach((msg) => {
    if (msg.sender === "user") {
      conversationHistory.push({
        role: "user",
        parts: [{ text: msg.message }],
      });
    } else if (msg.sender === "ai") {
      conversationHistory.push({
        role: "model",
        parts: [{ text: msg.message }],
      });
    }
  });
}

/**
 * Clear conversation history
 */
export function clearConversation() {
  conversationHistory = [];
}
