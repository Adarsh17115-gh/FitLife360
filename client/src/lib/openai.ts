import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export interface AiNutritionRecommendation {
  insight: string;
  suggestions: Array<{
    name: string;
    image: string;
    protein: number;
    calories: number;
  }>;
}

export interface AiWorkoutRecommendation {
  insight: string;
  workouts: Array<{
    name: string;
    image: string;
    duration: number;
    calories: number;
  }>;
}

export async function getAiNutritionRecommendations(): Promise<AiNutritionRecommendation> {
  try {
    const response = await apiRequest("POST", "/api/ai/nutrition", {
      model: MODEL,
      goal: "balanced diet"
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting AI nutrition recommendations:", error);
    throw error;
  }
}

export async function getAiWorkoutRecommendations(): Promise<AiWorkoutRecommendation> {
  try {
    const response = await apiRequest("POST", "/api/ai/workout", {
      model: MODEL,
      goal: "strength and cardio"
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting AI workout recommendations:", error);
    throw error;
  }
}

export async function askAiCoach(question: string): Promise<{response: string}> {
  try {
    const response = await apiRequest("POST", "/api/ai/coach", {
      model: MODEL,
      question
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error asking AI coach:", error);
    throw error;
  }
}
