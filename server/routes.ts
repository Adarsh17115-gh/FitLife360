import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertFamilySchema, insertHealthMetricsSchema, insertWorkoutSchema, 
  insertUserWorkoutSchema, insertMealSchema, insertChallengeSchema, 
  insertUserChallengeSchema, insertAIConversationSchema } from "@shared/schema";
import OpenAI from 'openai';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize OpenAI API client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key",
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get("/api/users/byUsername/:username", async (req, res) => {
    const username = req.params.username;
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/families/:familyId/users", async (req, res) => {
    const familyId = parseInt(req.params.familyId);
    const users = await storage.getUsersByFamilyId(familyId);
    
    // Don't return passwords
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  });

  // Family routes
  app.get("/api/families/:id", async (req, res) => {
    const familyId = parseInt(req.params.id);
    const family = await storage.getFamily(familyId);
    
    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }
    
    res.json(family);
  });

  app.post("/api/families", async (req, res) => {
    try {
      const familyData = insertFamilySchema.parse(req.body);
      const family = await storage.createFamily(familyData);
      res.status(201).json(family);
    } catch (error) {
      res.status(400).json({ message: "Invalid family data", error });
    }
  });

  // Health metrics routes
  app.get("/api/users/:userId/health-metrics", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const metrics = await storage.getHealthMetricsForUser(userId, limit);
    res.json(metrics);
  });

  app.post("/api/health-metrics", async (req, res) => {
    try {
      const metricData = insertHealthMetricsSchema.parse(req.body);
      const metric = await storage.createHealthMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ message: "Invalid health metric data", error });
    }
  });

  // Workout routes
  app.get("/api/workouts", async (req, res) => {
    const workouts = await storage.getAllWorkouts();
    res.json(workouts);
  });

  app.get("/api/workouts/:id", async (req, res) => {
    const workoutId = parseInt(req.params.id);
    const workout = await storage.getWorkout(workoutId);
    
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    res.json(workout);
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout data", error });
    }
  });

  // User Workout routes
  app.get("/api/users/:userId/workouts", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const userWorkouts = await storage.getWorkoutsForUser(userId);
    
    // Fetch full workout details for each user workout
    const workoutsWithDetails = await Promise.all(
      userWorkouts.map(async (userWorkout) => {
        const workout = await storage.getWorkout(userWorkout.workoutId);
        return { ...userWorkout, workout };
      })
    );
    
    res.json(workoutsWithDetails);
  });

  app.get("/api/users/:userId/workouts/upcoming", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const upcomingWorkouts = await storage.getUpcomingWorkoutsForUser(userId);
    
    // Fetch full workout details for each user workout
    const workoutsWithDetails = await Promise.all(
      upcomingWorkouts.map(async (userWorkout) => {
        const workout = await storage.getWorkout(userWorkout.workoutId);
        return { ...userWorkout, workout };
      })
    );
    
    res.json(workoutsWithDetails);
  });

  app.post("/api/user-workouts", async (req, res) => {
    try {
      const userWorkoutData = insertUserWorkoutSchema.parse(req.body);
      const userWorkout = await storage.createUserWorkout(userWorkoutData);
      res.status(201).json(userWorkout);
    } catch (error) {
      res.status(400).json({ message: "Invalid user workout data", error });
    }
  });

  app.put("/api/user-workouts/:id/complete", async (req, res) => {
    const userWorkoutId = parseInt(req.params.id);
    const completedWorkout = await storage.completeUserWorkout(userWorkoutId);
    
    if (!completedWorkout) {
      return res.status(404).json({ message: "User workout not found" });
    }
    
    res.json(completedWorkout);
  });

  // Meal routes
  app.get("/api/users/:userId/meals", async (req, res) => {
    const userId = parseInt(req.params.userId);
    let date = undefined;
    
    if (req.query.date) {
      date = new Date(req.query.date as string);
    }
    
    const meals = await storage.getMealsForUser(userId, date);
    res.json(meals);
  });

  app.post("/api/meals", async (req, res) => {
    try {
      const mealData = insertMealSchema.parse(req.body);
      const meal = await storage.createMeal(mealData);
      res.status(201).json(meal);
    } catch (error) {
      res.status(400).json({ message: "Invalid meal data", error });
    }
  });

  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    const active = req.query.active === "true";
    
    const challenges = active 
      ? await storage.getActiveChallenges()
      : await storage.getAllChallenges();
    
    res.json(challenges);
  });

  app.get("/api/challenges/:id", async (req, res) => {
    const challengeId = parseInt(req.params.id);
    const challenge = await storage.getChallenge(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }
    
    res.json(challenge);
  });

  app.post("/api/challenges", async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(400).json({ message: "Invalid challenge data", error });
    }
  });

  // User Challenge routes
  app.get("/api/users/:userId/challenges", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const userChallenges = await storage.getUserChallengesForUser(userId);
    
    // Fetch full challenge details for each user challenge
    const challengesWithDetails = await Promise.all(
      userChallenges.map(async (userChallenge) => {
        const challenge = await storage.getChallenge(userChallenge.challengeId);
        return { ...userChallenge, challenge };
      })
    );
    
    res.json(challengesWithDetails);
  });

  app.get("/api/challenges/:challengeId/participants", async (req, res) => {
    const challengeId = parseInt(req.params.challengeId);
    const userChallenges = await storage.getUserChallengesForChallenge(challengeId);
    
    // Fetch user details for each participant
    const participantsWithDetails = await Promise.all(
      userChallenges.map(async (userChallenge) => {
        const user = await storage.getUser(userChallenge.userId);
        if (!user) return userChallenge;
        
        const { password, ...userWithoutPassword } = user;
        return { ...userChallenge, user: userWithoutPassword };
      })
    );
    
    res.json(participantsWithDetails);
  });

  app.post("/api/user-challenges", async (req, res) => {
    try {
      const userChallengeData = insertUserChallengeSchema.parse(req.body);
      const userChallenge = await storage.createUserChallenge(userChallengeData);
      res.status(201).json(userChallenge);
    } catch (error) {
      res.status(400).json({ message: "Invalid user challenge data", error });
    }
  });

  app.put("/api/user-challenges/:id/progress", async (req, res) => {
    const userChallengeId = parseInt(req.params.id);
    const { progress } = req.body;
    
    if (typeof progress !== "number") {
      return res.status(400).json({ message: "Progress must be a number" });
    }
    
    const updatedUserChallenge = await storage.updateUserChallengeProgress(userChallengeId, progress);
    
    if (!updatedUserChallenge) {
      return res.status(404).json({ message: "User challenge not found" });
    }
    
    res.json(updatedUserChallenge);
  });

  // AI conversation routes
  app.get("/api/users/:userId/ai-conversations", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const conversations = await storage.getAIConversationsForUser(userId);
    res.json(conversations);
  });

  app.get("/api/ai-conversations/:id", async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const conversation = await storage.getAIConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    res.json(conversation);
  });

  app.post("/api/ai-conversations", async (req, res) => {
    try {
      const conversationData = insertAIConversationSchema.parse(req.body);
      const conversation = await storage.createAIConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data", error });
    }
  });

  app.post("/api/ai-conversations/:id/messages", async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    const conversation = await storage.getAIConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    
    // Add user message to conversation
    const newMessages = [
      ...conversation.messages,
      { role: "user", content: message }
    ];
    
    // Get AI response
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a helpful fitness and wellness coach named FitLife AI. You provide personalized advice on fitness, nutrition, and general wellness. Keep responses concise, motivational, and actionable."
          },
          ...newMessages
        ],
        max_tokens: 500
      });
      
      // Add AI response to conversation
      const aiResponse = completion.choices[0].message;
      const updatedMessages = [...newMessages, { 
        role: aiResponse.role, 
        content: aiResponse.content 
      }];
      
      // Update conversation in storage
      const updatedConversation = await storage.updateAIConversation(conversationId, updatedMessages);
      
      if (!updatedConversation) {
        return res.status(500).json({ message: "Error updating conversation" });
      }
      
      res.json(updatedConversation);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      res.status(500).json({ message: "Error getting AI response", error });
    }
  });

  // AI meal recommendations route
  app.post("/api/ai/meal-recommendations", async (req, res) => {
    const { userId, preferences, dietaryRestrictions } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get recent meals
    const recentMeals = await storage.getMealsForUser(userId);
    
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
            content: `Generate meal recommendations for ${user.name}. 
            ${preferences ? `Preferences: ${preferences}` : ''}
            ${dietaryRestrictions ? `Dietary restrictions: ${dietaryRestrictions}` : ''}
            Recent meals: ${JSON.stringify(recentMeals.map(m => m.name).slice(0, 5))}`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const recommendations = JSON.parse(completion.choices[0].message.content);
      res.json(recommendations);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      res.status(500).json({ message: "Error getting meal recommendations", error });
    }
  });

  // AI workout recommendations route
  app.post("/api/ai/workout-recommendations", async (req, res) => {
    const { userId, fitnessLevel, goals, duration, equipment } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a fitness expert. Generate personalized workout recommendations based on user fitness level, goals, available time, and equipment. Format the response as JSON with workout title, description, duration, intensity, and exercises array (each with name, sets, reps, and rest)."
          },
          {
            role: "user",
            content: `Generate a workout for ${user.name}.
            ${fitnessLevel ? `Fitness level: ${fitnessLevel}` : 'Fitness level: Intermediate'}
            ${goals ? `Goals: ${goals}` : 'Goals: General fitness'}
            ${duration ? `Duration: ${duration} minutes` : 'Duration: 30 minutes'}
            ${equipment ? `Equipment: ${equipment}` : 'Equipment: None (bodyweight)'}`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const workout = JSON.parse(completion.choices[0].message.content);
      res.json(workout);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      res.status(500).json({ message: "Error getting workout recommendations", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
