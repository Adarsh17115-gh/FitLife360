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
    
    // Provide fallback meal recommendations when API fails
    const hasVeganRestriction = dietaryRestrictions?.toLowerCase().includes('vegan');
    const hasGlutenRestriction = dietaryRestrictions?.toLowerCase().includes('gluten');
    
    return {
      message: `Here are some nutritious meal ideas for you, ${userName}!`,
      recommendations: [
        {
          name: hasVeganRestriction ? "Vegan Buddha Bowl" : "Grilled Chicken Bowl",
          description: hasVeganRestriction 
            ? "A nutrient-packed bowl with quinoa, roasted vegetables, and tahini dressing" 
            : "Lean protein with mixed vegetables and whole grains",
          calories: hasVeganRestriction ? 450 : 520,
          protein: hasVeganRestriction ? 15 : 35,
          carbs: 55,
          fats: 18,
          ingredients: hasVeganRestriction 
            ? ["Quinoa", "Sweet potato", "Chickpeas", "Kale", "Avocado", "Tahini", "Lemon juice", "Spices"] 
            : ["Chicken breast", "Brown rice", "Broccoli", "Bell peppers", "Olive oil", "Lemon", "Herbs"],
          instructions: "Cook grains, prepare protein, roast vegetables, and assemble in a bowl with sauce/dressing."
        },
        {
          name: hasGlutenRestriction ? "Gluten-Free Veggie Omelet" : "Whole Grain Breakfast Bowl",
          description: "Protein-rich breakfast to fuel your morning",
          calories: 380,
          protein: 22,
          carbs: hasGlutenRestriction ? 12 : 38,
          fats: 24,
          ingredients: hasGlutenRestriction 
            ? ["Eggs", "Spinach", "Mushrooms", "Bell peppers", "Avocado", "Cheese", "Herbs"] 
            : ["Oats", "Greek yogurt", "Banana", "Berries", "Honey", "Almonds", "Cinnamon"],
          instructions: hasGlutenRestriction
            ? "Whisk eggs, sauté vegetables, pour eggs over, cook until set, fold and serve."
            : "Cook oats, top with yogurt, add fruit, nuts, and honey."
        },
        {
          name: "Mediterranean Salad" + (hasGlutenRestriction ? " (GF)" : ""),
          description: "Fresh and nutritious salad with " + (hasVeganRestriction ? "plant protein" : "lean protein"),
          calories: 420,
          protein: hasVeganRestriction ? 14 : 28,
          carbs: 30,
          fats: 22,
          ingredients: [
            hasGlutenRestriction ? "Gluten-free grains" : "Whole grain couscous", 
            "Cucumber", 
            "Cherry tomatoes", 
            "Red onion", 
            "Bell peppers",
            hasVeganRestriction ? "Chickpeas" : "Grilled chicken/fish", 
            "Olive oil",
            hasVeganRestriction ? "Lemon juice" : "Feta cheese",
            "Herbs"
          ],
          instructions: "Prepare grains, chop vegetables, add protein, dress with olive oil and lemon, season and serve."
        }
      ]
    };
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
    
    // Provide a fallback response if OpenAI API fails
    const lastUserMessage = messages.findLast(msg => msg.role === "user")?.content || "";
    
    if (lastUserMessage.toLowerCase().includes("workout")) {
      return "I'd be happy to suggest a workout! Here's a quick 15-minute routine you can do at home:\n\n- 2 minutes warm-up with light jogging in place\n- 30 seconds jumping jacks\n- 30 seconds push-ups (modified if needed)\n- 30 seconds bodyweight squats\n- 30 seconds plank\n- 30 seconds rest\n- Repeat 3 times\n\nFinish with 2 minutes of stretching. Would you like more specific exercises targeting certain muscle groups?";
    } else if (lastUserMessage.toLowerCase().includes("nutrition") || lastUserMessage.toLowerCase().includes("diet") || lastUserMessage.toLowerCase().includes("meal")) {
      return "Great question about nutrition! A balanced diet is key to fitness success. Try to include:\n\n- Lean proteins (chicken, fish, tofu)\n- Complex carbs (whole grains, sweet potatoes)\n- Healthy fats (avocados, nuts, olive oil)\n- Plenty of vegetables and fruits\n\nAim for balanced meals and stay hydrated throughout the day. Would you like some specific meal ideas?";
    } else {
      return "Thanks for your message! As your fitness coach, I'm here to help with workout plans, nutrition advice, and wellness strategies. Could you provide more details about your fitness goals so I can give you personalized guidance?";
    }
  }
}

export default openai;