import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFamilyMemberSchema, 
  insertHealthMetricSchema, 
  insertNutritionGoalSchema,
  insertMealSchema,
  insertWorkoutSchema,
  insertChallengeSchema
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-demo-key" });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

export async function registerRoutes(app: Express): Promise<Server> {
  // User Routes
  app.get("/api/user/profile", async (req, res) => {
    try {
      // For demo purposes, we'll use a static user ID 1
      const userId = 1;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile", error: (error as Error).message });
    }
  });

  app.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const userData = req.body;
      
      const updatedUser = await storage.updateUser(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user profile", error: (error as Error).message });
    }
  });

  // Family Member Routes
  app.get("/api/family/members", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const familyMembers = await storage.getFamilyMembers(userId);
      res.json(familyMembers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch family members", error: (error as Error).message });
    }
  });

  app.post("/api/family/members", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const validation = insertFamilyMemberSchema.safeParse({...req.body, userId});
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.format() });
      }
      
      const newMember = await storage.addFamilyMember(validation.data);
      res.status(201).json(newMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to add family member", error: (error as Error).message });
    }
  });

  // Health Metrics Routes
  app.get("/api/health/summary", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const healthData = await storage.getHealthSummary(userId);
      res.json(healthData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health summary", error: (error as Error).message });
    }
  });

  app.get("/api/health/metrics", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const timeRange = req.query.timeRange as string || "week";
      const metricType = req.query.metricType as string || "all";
      
      const metricsData = await storage.getHealthMetrics(userId, timeRange, metricType);
      res.json(metricsData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health metrics", error: (error as Error).message });
    }
  });

  app.post("/api/health/metrics", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const validation = insertHealthMetricSchema.safeParse({...req.body, userId});
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.format() });
      }
      
      const newMetric = await storage.addHealthMetric(validation.data);
      res.status(201).json(newMetric);
    } catch (error) {
      res.status(500).json({ message: "Failed to add health metric", error: (error as Error).message });
    }
  });

  // Activity Routes
  app.get("/api/activity/weekly", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const activityData = await storage.getWeeklyActivity(userId);
      res.json(activityData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly activity", error: (error as Error).message });
    }
  });

  app.get("/api/activities/upcoming", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const upcomingActivities = await storage.getUpcomingActivities(userId);
      res.json(upcomingActivities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming activities", error: (error as Error).message });
    }
  });

  // Nutrition Routes
  app.get("/api/nutrition/goals", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const nutritionGoals = await storage.getNutritionGoals(userId);
      res.json(nutritionGoals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nutrition goals", error: (error as Error).message });
    }
  });

  app.patch("/api/nutrition/goals", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const validation = insertNutritionGoalSchema.partial().safeParse({...req.body, userId});
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.format() });
      }
      
      const updatedGoals = await storage.updateNutritionGoals(userId, validation.data);
      res.json(updatedGoals);
    } catch (error) {
      res.status(500).json({ message: "Failed to update nutrition goals", error: (error as Error).message });
    }
  });

  app.get("/api/nutrition/meal-plan", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      const mealPlan = await storage.getMealPlan(userId, date);
      res.json(mealPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plan", error: (error as Error).message });
    }
  });

  app.post("/api/nutrition/meals", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const validation = insertMealSchema.safeParse({
        ...req.body, 
        userId,
        time: new Date().toISOString()
      });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.format() });
      }
      
      const newMeal = await storage.addMeal(validation.data);
      res.status(201).json(newMeal);
    } catch (error) {
      res.status(500).json({ message: "Failed to add meal", error: (error as Error).message });
    }
  });

  // Workout Routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const workouts = await storage.getWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts", error: (error as Error).message });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const validation = insertWorkoutSchema.safeParse({...req.body, userId});
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.format() });
      }
      
      const newWorkout = await storage.addWorkout(validation.data);
      res.status(201).json(newWorkout);
    } catch (error) {
      res.status(500).json({ message: "Failed to add workout", error: (error as Error).message });
    }
  });

  // Challenge Routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const challenges = await storage.getChallenges(userId);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch challenges", error: (error as Error).message });
    }
  });

  app.post("/api/challenges", async (req, res) => {
    try {
      const userId = 1; // Static user ID for demo
      const validation = insertChallengeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.format() });
      }
      
      const newChallenge = await storage.addChallenge(validation.data, userId);
      res.status(201).json(newChallenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to add challenge", error: (error as Error).message });
    }
  });

  // AI Integration Routes
  app.post("/api/ai/nutrition", async (req, res) => {
    try {
      // Example nutrition recommendation using OpenAI
      const prompt = `
        Generate personalized nutrition recommendations based on the following profile:
        - Goal: ${req.body.goal || "balanced diet"}
        - Current macros: protein 120g, carbs 180g, fat 60g
        - Activity level: moderate
        
        Return a JSON object with the following structure:
        {
          "insight": "brief advice about improving macronutrient balance",
          "suggestions": [
            {
              "name": "meal name",
              "image": "image URL from unsplash.com",
              "protein": protein in grams (number),
              "calories": calories (number)
            }
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseData = JSON.parse(response.choices[0].message.content);
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI nutrition recommendations", error: (error as Error).message });
    }
  });

  app.post("/api/ai/workout", async (req, res) => {
    try {
      // Example workout recommendation using OpenAI
      const prompt = `
        Generate personalized workout recommendations based on the following profile:
        - Goal: ${req.body.goal || "strength and cardio"}
        - Fitness level: intermediate
        - Available equipment: minimal
        
        Return a JSON object with the following structure:
        {
          "insight": "brief advice about exercise selection for the user's goals",
          "workouts": [
            {
              "name": "workout name",
              "image": "image URL from unsplash.com",
              "duration": duration in minutes (number),
              "calories": estimated calories burned (number)
            }
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseData = JSON.parse(response.choices[0].message.content);
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI workout recommendations", error: (error as Error).message });
    }
  });

  app.post("/api/ai/coach", async (req, res) => {
    try {
      const questionSchema = z.object({
        question: z.string().min(1, "Question is required"),
        model: z.string().optional(),
      });
      
      const validation = questionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.format() });
      }
      
      const { question, model } = validation.data;
      
      const systemPrompt = `
        You are a knowledgeable, supportive fitness and nutrition coach. Provide helpful advice based on proven science.
        Keep responses concise (under 150 words) but informative. Be encouraging and motivational.
        When discussing exercise, prioritize safety and proper form. For nutrition, focus on balanced approaches.
        Answer based on general best practices. If a question requires medical advice, recommend consulting a healthcare professional.
      `;
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
      });
      
      res.json({ response: response.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ message: "Failed to get response from AI coach", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
