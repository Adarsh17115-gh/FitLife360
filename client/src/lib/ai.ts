import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

export async function getAIMealRecommendations(userId: number, preferences?: string, dietaryRestrictions?: string) {
  try {
    const response = await apiRequest("POST", "/api/ai/meal-recommendations", {
      userId,
      preferences,
      dietaryRestrictions
    });
    return await response.json();
  } catch (error) {
    console.error("Error getting meal recommendations:", error);
    throw error;
  }
}

export async function getAIWorkoutRecommendations(
  userId: number, 
  options: {
    fitnessLevel?: string;
    goals?: string;
    duration?: number;
    equipment?: string;
  }
) {
  try {
    const response = await apiRequest("POST", "/api/ai/workout-recommendations", {
      userId,
      ...options
    });
    return await response.json();
  } catch (error) {
    console.error("Error getting workout recommendations:", error);
    throw error;
  }
}

export async function sendMessageToAICoach(conversationId: number, message: string) {
  try {
    const response = await apiRequest("POST", `/api/ai-conversations/${conversationId}/messages`, {
      message
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending message to AI coach:", error);
    throw error;
  }
}

export async function createAIConversation(userId: number, initialMessage?: string) {
  try {
    const response = await apiRequest("POST", "/api/ai-conversations", {
      userId,
      messages: initialMessage ? [{ role: "user", content: initialMessage }] : []
    });
    
    if (initialMessage) {
      const conversation = await response.json();
      return await sendMessageToAICoach(conversation.id, initialMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating AI conversation:", error);
    throw error;
  }
}

// New direct AI chat function that doesn't require conversation storage
export async function chatWithAICoach(userId: number, message: string) {
  try {
    const response = await apiRequest("POST", "/api/ai/chat", {
      userId,
      message
    });
    return await response.json();
  } catch (error) {
    console.error("Error chatting with AI coach:", error);
    throw error;
  }
}
