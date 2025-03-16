import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Nutrition recommendation interface
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

// Workout recommendation interface
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

// Message interface
export interface AIMessage {
  id: number;
  userId: number;
  message: string;
  response: string | null;
  timestamp: string;
  category: string;
}

// Hook for AI coach message history
export function useAICoachMessages(userId: number) {
  return useQuery({
    queryKey: ["/api/users", userId, "ai-coach-messages"],
    queryFn: () => fetch(`/api/users/${userId}/ai-coach-messages`).then(res => res.json()),
  });
}

// Hook for sending messages to AI coach
export function useAICoach() {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async (message: { userId: number; message: string; category?: string }) => {
      setIsProcessing(true);
      try {
        return await apiRequest("POST", "/api/ai-coach-messages", {
          userId: message.userId,
          message: message.message,
          response: null, // Will be filled by the server
          timestamp: new Date().toISOString(),
          category: message.category || "general"
        });
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", variables.userId, "ai-coach-messages"] 
      });
    },
  });

  return {
    sendMessage,
    isProcessing
  };
}

// Hook for getting nutrition recommendations
export function useNutritionRecommendations(userId: number, data: { 
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  dietaryRestrictions: string[]; 
}) {
  return useQuery({
    queryKey: ["/api/users", userId, "nutrition-recommendations", data],
    queryFn: async () => {
      // This would normally call the OpenAI API through a backend endpoint
      // For now, we're using mock data with a delay to simulate an API call
      return new Promise<NutritionRecommendation>((resolve) => {
        setTimeout(() => {
          resolve({
            message: "Based on your recent activity, I recommend increasing your protein intake by 15g daily to support muscle recovery.",
            recommendations: {
              protein: 120,
              carbs: 200,
              fats: 60,
              calories: 1800,
              foods: ["Chicken breast", "Greek yogurt", "Lentils", "Quinoa", "Salmon"]
            }
          });
        }, 1000);
      });
    },
    enabled: false, // Don't run automatically
  });
}

// Hook for getting workout recommendations
export function useWorkoutRecommendations(userId: number, data: {
  age: number;
  fitnessLevel: string;
  goals: string[];
  timeAvailable: number;
  preferences: string[];
}) {
  return useQuery({
    queryKey: ["/api/users", userId, "workout-recommendations", data],
    queryFn: async () => {
      // This would normally call the OpenAI API through a backend endpoint
      // For now, we're using mock data with a delay to simulate an API call
      return new Promise<WorkoutRecommendation>((resolve) => {
        setTimeout(() => {
          resolve({
            message: "Based on your fitness level and goals, here's a customized HIIT workout plan.",
            recommendations: {
              type: "HIIT",
              duration: 30,
              exercises: [
                {
                  name: "Burpees",
                  sets: 3,
                  reps: 10,
                  description: "Full body exercise that builds strength and endurance."
                },
                {
                  name: "Mountain Climbers",
                  sets: 3,
                  reps: 20,
                  description: "Great for cardio and core strength."
                },
                {
                  name: "Squat Jumps",
                  sets: 3,
                  reps: 15,
                  description: "Lower body exercise that improves explosive power."
                }
              ]
            }
          });
        }, 1000);
      });
    },
    enabled: false, // Don't run automatically
  });
}
