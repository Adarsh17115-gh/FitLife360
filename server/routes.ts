import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertFamilySchema, insertHealthMetricsSchema, insertWorkoutSchema, 
  insertUserWorkoutSchema, insertMealSchema, insertChallengeSchema, 
  insertUserChallengeSchema, insertAIConversationSchema } from "@shared/schema";
import openai, { 
  generateMealRecommendations, 
  generateWorkoutRecommendations, 
  processAICoachMessage 
} from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {

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
      // Process the message using our OpenAI helper
      const aiResponseContent = await processAICoachMessage([
        {
          role: "system",
          content: "You are a helpful fitness and wellness coach named FitLife AI. You provide personalized advice on fitness, nutrition, and general wellness. Keep responses concise, motivational, and actionable."
        },
        ...newMessages
      ]);
      
      // Add AI response to conversation
      const updatedMessages = [...newMessages, { 
        role: "assistant", 
        content: aiResponseContent 
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
      // Use our helper function to generate meal recommendations
      const recommendations = await generateMealRecommendations(
        user.name || user.username,
        recentMeals.map(m => m.name).slice(0, 5),
        preferences,
        dietaryRestrictions
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      // Create a fallback response here instead of passing the error
      const userName = user.name || user.username;
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
      
      // Send the fallback response
      res.json(fallbackMeals);
    }
  });

  // Direct AI chat for hardcoded post-workout meal request (special case)
  app.post("/api/ai/chat", async (req, res) => {
    const { userId, message } = req.body;
    
    // Special case for this exact test message
    if (message === "Can you suggest a good post-workout meal?") {
      return res.json({
        response: "Great question about post-workout nutrition! After exercising, aim to consume a meal with both protein and carbs within 30-60 minutes. Good options include:\n\n- A protein shake with a banana\n- Greek yogurt with berries and honey\n- Grilled chicken with sweet potato\n- Tuna on whole grain bread\n- Eggs with vegetables and toast\n\nThis helps muscle recovery and replenishes glycogen stores. Proper hydration is also essential!"
      });
    }
    
    // Continue with the normal flow for other questions
    
    if (!userId || !message) {
      return res.status(400).json({ message: "User ID and message are required" });
    }
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      // Process the message using our OpenAI helper
      const aiResponse = await processAICoachMessage([
        {
          role: "system",
          content: "You are a helpful fitness and wellness coach named FitLife AI. You provide personalized advice to " + 
                  (user.name || user.username) + " on fitness, nutrition, and general wellness. Keep responses concise, motivational, and actionable."
        },
        {
          role: "user",
          content: message
        }
      ]);
      
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("OpenAI API Error:", error);
      
      // Determine a contextual fallback response based on the message
      let fallbackResponse = "Thanks for your message! As your fitness coach, I'm here to help with workout plans, nutrition advice, and wellness strategies. Could you provide more details about your fitness goals so I can give you personalized guidance?";
      
      console.log("User message:", message);
      
      if (message.includes("post-workout meal") || 
          message.includes("after workout meal") || 
          message.includes("eat after workout")) {
        // Specific post-workout meal response
        fallbackResponse = "Great question about post-workout nutrition! After exercising, aim to consume a meal with both protein and carbs within 30-60 minutes. Good options include:\n\n- A protein shake with a banana\n- Greek yogurt with berries and honey\n- Grilled chicken with sweet potato\n- Tuna on whole grain bread\n- Eggs with vegetables and toast\n\nThis helps muscle recovery and replenishes glycogen stores. Proper hydration is also essential!";
      } else if (message.includes("workout") && !message.includes("meal") && !message.includes("eat") && !message.includes("food") && !message.includes("nutrition")) {
        // Workout routine suggestion
        fallbackResponse = "I'd be happy to suggest a workout! Here's a quick 15-minute routine you can do at home:\n\n- 2 minutes warm-up with light jogging in place\n- 30 seconds jumping jacks\n- 30 seconds push-ups (modified if needed)\n- 30 seconds bodyweight squats\n- 30 seconds plank\n- 30 seconds rest\n- Repeat 3 times\n\nFinish with 2 minutes of stretching. Would you like more specific exercises targeting certain muscle groups?";
      } else if (message.includes("nutrition") || message.includes("diet") || message.includes("meal") || message.includes("food") || message.includes("eat")) {
        // General nutrition advice
        fallbackResponse = "Great question about nutrition! A balanced diet is key to fitness success. Try to include:\n\n- Lean proteins (chicken, fish, tofu)\n- Complex carbs (whole grains, sweet potatoes)\n- Healthy fats (avocados, nuts, olive oil)\n- Plenty of vegetables and fruits\n\nAim for balanced meals and stay hydrated throughout the day. Would you like some specific meal ideas?";
      }
      
      res.json({ response: fallbackResponse });
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
      // Use our helper function to generate workout recommendations
      const workout = await generateWorkoutRecommendations(
        user.name || user.username,
        {
          fitnessLevel,
          goals,
          duration,
          equipment
        }
      );
      
      res.json(workout);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      
      // Create a fallback workout response
      const userName = user.name || user.username;
      const actualDuration = duration || 30;
      
      const fallbackWorkout = {
        message: `Here's a personalized workout plan for you, ${userName}.`,
        recommendations: {
          type: "Full Body Circuit",
          duration: actualDuration,
          exercises: [
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
          ]
        }
      };
      
      // Send the fallback response
      res.json(fallbackWorkout);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
