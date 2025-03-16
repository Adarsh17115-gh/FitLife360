import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NutritionRecommendation {
  message: string;
  recommendations: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
    foods: string[];
  };
}

export interface WorkoutRecommendation {
  message: string;
  recommendations: {
    type: string;
    duration: number;
    exercises: {
      name: string;
      sets: number;
      reps: number;
      description: string;
    }[];
  };
}

/**
 * Generate meal recommendations based on user preferences and dietary restrictions
 */
export async function generateMealRecommendations(
  userName: string,
  recentMeals: string[],
  preferences?: string,
  dietaryRestrictions?: string
): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert. Generate personalized meal recommendations based on user preferences, dietary restrictions, and recent meal history. Format the response as JSON with 3 meal recommendations, each containing name, description, calories, protein, ingredients, and instructions."
        },
        {
          role: "user",
          content: `Generate meal recommendations for ${userName}. 
          ${preferences ? `Preferences: ${preferences}` : ''}
          ${dietaryRestrictions ? `Dietary restrictions: ${dietaryRestrictions}` : ''}
          Recent meals: ${JSON.stringify(recentMeals)}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

/**
 * Generate workout recommendations based on user fitness level, goals, and available equipment
 */
export async function generateWorkoutRecommendations(
  userName: string,
  options: {
    fitnessLevel?: string;
    goals?: string;
    duration?: number;
    equipment?: string;
  }
): Promise<any> {
  try {
    const { fitnessLevel, goals, duration, equipment } = options;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a fitness expert. Generate personalized workout recommendations based on user fitness level, goals, available time, and equipment. Format the response as JSON with workout title, description, duration, intensity, and exercises array (each with name, sets, reps, and rest)."
        },
        {
          role: "user",
          content: `Generate a workout for ${userName}.
          ${fitnessLevel ? `Fitness level: ${fitnessLevel}` : 'Fitness level: Intermediate'}
          ${goals ? `Goals: ${goals}` : 'Goals: General fitness'}
          ${duration ? `Duration: ${duration} minutes` : 'Duration: 30 minutes'}
          ${equipment ? `Equipment: ${equipment}` : 'Equipment: Minimal/bodyweight'}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

/**
 * Handle AI chat messages with the fitness coach
 */
export async function processAICoachMessage(messages: any[]): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a helpful fitness and wellness coach named FitLife AI. You provide personalized advice on fitness, nutrition, and general wellness. Keep responses concise, motivational, and actionable."
        },
        ...messages
      ],
      max_tokens: 500
    });
    
    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

export default openai;