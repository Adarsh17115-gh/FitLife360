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
    
    // Fallback recommendations
    const fallbackMeals = {
      message: `Here are some balanced meal recommendations for you, ${userName}.`,
      recommendations: [
        {
          name: "High-Protein Breakfast Bowl",
          description: "A nutritious breakfast bowl packed with protein and healthy fats to start your day.",
          calories: 450,
          protein: 25,
          carbs: 35,
          fats: 20,
          foods: ["Greek yogurt", "Berries", "Granola", "Nuts", "Honey"]
        },
        {
          name: "Mediterranean Lunch Plate",
          description: "A balanced lunch with lean protein, complex carbs, and healthy fats.",
          calories: 550,
          protein: 30,
          carbs: 45,
          fats: 25,
          foods: ["Grilled chicken", "Quinoa", "Cucumber", "Cherry tomatoes", "Feta cheese", "Olive oil"]
        },
        {
          name: "Vegetable Stir-Fry with Tofu",
          description: "A nutrient-dense dinner high in protein and fiber.",
          calories: 500,
          protein: 25,
          carbs: 40,
          fats: 20,
          foods: ["Tofu", "Broccoli", "Bell peppers", "Carrots", "Brown rice", "Low-sodium soy sauce"]
        }
      ]
    };
    
    // Apply dietary restrictions if specified
    if (dietaryRestrictions && dietaryRestrictions.toLowerCase().includes("vegetarian")) {
      fallbackMeals.recommendations[1].name = "Mediterranean Vegetarian Plate";
      fallbackMeals.recommendations[1].description = "A balanced vegetarian lunch with plant protein, complex carbs, and healthy fats.";
      fallbackMeals.recommendations[1].foods = ["Chickpeas", "Quinoa", "Cucumber", "Cherry tomatoes", "Feta cheese", "Olive oil"];
    }
    
    return fallbackMeals;
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
    
    // Fallback workout recommendations
    const actualFitnessLevel = options.fitnessLevel || "Intermediate";
    const actualGoals = options.goals || "General fitness";
    const actualDuration = options.duration || 30;
    const actualEquipment = options.equipment || "Minimal/bodyweight";
    
    // Create a general workout routine that fits most scenarios
    const fallbackWorkout = {
      message: `Here's a personalized workout plan for you, ${userName}.`,
      recommendations: {
        type: "Full Body Circuit",
        duration: actualDuration,
        exercises: []
      }
    };
    
    // Base exercises for bodyweight workouts
    const bodyweightExercises = [
      {
        name: "Push-ups",
        sets: 3,
        reps: 10,
        description: "Standard push-ups targeting chest, shoulders, and triceps."
      },
      {
        name: "Bodyweight Squats",
        sets: 3,
        reps: 15,
        description: "Standing squats targeting quadriceps, hamstrings, and glutes."
      },
      {
        name: "Plank",
        sets: 3,
        reps: 30,
        description: "Hold plank position for 30 seconds, targeting core and shoulders."
      },
      {
        name: "Mountain Climbers",
        sets: 3,
        reps: 20,
        description: "Dynamic exercise targeting core, shoulders, and increasing heart rate."
      },
      {
        name: "Lunges",
        sets: 3,
        reps: 12,
        description: "Alternating lunges targeting legs and improving balance."
      }
    ];
    
    // Equipment-specific exercises
    const dumbellExercises = [
      {
        name: "Dumbbell Rows",
        sets: 3,
        reps: 12,
        description: "Bent-over rows with dumbbells targeting back muscles."
      },
      {
        name: "Dumbbell Shoulder Press",
        sets: 3,
        reps: 10,
        description: "Overhead press with dumbbells targeting shoulders."
      }
    ];
    
    // Adjust based on fitness level
    if (actualFitnessLevel && actualFitnessLevel.toLowerCase().includes("beginner")) {
      bodyweightExercises.forEach(ex => {
        ex.sets = 2;
        ex.reps = Math.round(ex.reps * 0.7);
      });
    } else if (actualFitnessLevel && actualFitnessLevel.toLowerCase().includes("advanced")) {
      bodyweightExercises.forEach(ex => {
        ex.sets = 4;
        ex.reps = Math.round(ex.reps * 1.3);
      });
    }
    
    // Add exercises based on equipment
    if (actualEquipment && (actualEquipment.toLowerCase().includes("dumbbell") || 
        actualEquipment.toLowerCase().includes("weights"))) {
      fallbackWorkout.recommendations.exercises = [...bodyweightExercises, ...dumbellExercises];
    } else {
      fallbackWorkout.recommendations.exercises = bodyweightExercises;
    }
    
    return fallbackWorkout;
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