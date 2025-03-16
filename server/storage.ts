import { 
  User, InsertUser, Family, InsertFamily, HealthMetric, InsertHealthMetric,
  Workout, InsertWorkout, UserWorkout, InsertUserWorkout, Meal, InsertMeal,
  Challenge, InsertChallenge, UserChallenge, InsertUserChallenge,
  AIConversation, InsertAIConversation
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByFamilyId(familyId: number): Promise<User[]>;
  
  // Family operations
  getFamily(id: number): Promise<Family | undefined>;
  createFamily(family: InsertFamily): Promise<Family>;
  updateFamily(id: number, family: Partial<InsertFamily>): Promise<Family | undefined>;
  
  // Health metrics operations
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  getHealthMetricsForUser(userId: number, limit?: number): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  
  // Workout operations
  getWorkout(id: number): Promise<Workout | undefined>;
  getAllWorkouts(): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // UserWorkout operations
  getUserWorkout(id: number): Promise<UserWorkout | undefined>;
  getWorkoutsForUser(userId: number): Promise<UserWorkout[]>;
  getUpcomingWorkoutsForUser(userId: number): Promise<UserWorkout[]>;
  createUserWorkout(userWorkout: InsertUserWorkout): Promise<UserWorkout>;
  completeUserWorkout(id: number): Promise<UserWorkout | undefined>;
  
  // Meal operations
  getMeal(id: number): Promise<Meal | undefined>;
  getMealsForUser(userId: number, date?: Date): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  
  // Challenge operations
  getChallenge(id: number): Promise<Challenge | undefined>;
  getAllChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // UserChallenge operations
  getUserChallenge(id: number): Promise<UserChallenge | undefined>;
  getUserChallengesForUser(userId: number): Promise<UserChallenge[]>;
  getUserChallengesForChallenge(challengeId: number): Promise<UserChallenge[]>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateUserChallengeProgress(id: number, progress: number): Promise<UserChallenge | undefined>;
  
  // AI Conversation operations
  getAIConversation(id: number): Promise<AIConversation | undefined>;
  getAIConversationsForUser(userId: number): Promise<AIConversation[]>;
  createAIConversation(conversation: InsertAIConversation): Promise<AIConversation>;
  updateAIConversation(id: number, messages: any[]): Promise<AIConversation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private families: Map<number, Family>;
  private healthMetrics: Map<number, HealthMetric>;
  private workouts: Map<number, Workout>;
  private userWorkouts: Map<number, UserWorkout>;
  private meals: Map<number, Meal>;
  private challenges: Map<number, Challenge>;
  private userChallenges: Map<number, UserChallenge>;
  private aiConversations: Map<number, AIConversation>;
  
  private userCounter = 1;
  private familyCounter = 1;
  private healthMetricCounter = 1;
  private workoutCounter = 1;
  private userWorkoutCounter = 1;
  private mealCounter = 1;
  private challengeCounter = 1;
  private userChallengeCounter = 1;
  private aiConversationCounter = 1;

  constructor() {
    this.users = new Map();
    this.families = new Map();
    this.healthMetrics = new Map();
    this.workouts = new Map();
    this.userWorkouts = new Map();
    this.meals = new Map();
    this.challenges = new Map();
    this.userChallenges = new Map();
    this.aiConversations = new Map();
    
    // Create initial data
    this.initializeData();
  }

  private initializeData() {
    // Create a sample family
    const family = this.createFamily({ name: "The Taylors" });
    
    // Create users
    const sarah = this.createUser({ 
      username: "sarah", 
      password: "password", 
      name: "Sarah Taylor", 
      email: "sarah@example.com", 
      role: "admin", 
      familyId: family.id 
    });
    
    const mike = this.createUser({ 
      username: "mike", 
      password: "password", 
      name: "Mike Taylor", 
      email: "mike@example.com", 
      role: "member", 
      familyId: family.id 
    });
    
    const amy = this.createUser({ 
      username: "amy", 
      password: "password", 
      name: "Amy Taylor", 
      email: "amy@example.com", 
      role: "member", 
      familyId: family.id 
    });
    
    const jake = this.createUser({ 
      username: "jake", 
      password: "password", 
      name: "Jake Taylor", 
      email: "jake@example.com", 
      role: "member", 
      familyId: family.id 
    });
    
    // Create health metrics for Sarah
    this.createHealthMetric({
      userId: sarah.id,
      date: new Date(),
      steps: 7342,
      activeMinutes: 42,
      caloriesBurned: 1875,
      sleep: 450 // 7.5 hours in minutes
    });
    
    // Create sample workouts
    const hiitWorkout = this.createWorkout({
      title: "HIIT Training",
      description: "High intensity interval training",
      duration: 30,
      intensity: "High",
      imageUrl: "https://images.unsplash.com/photo-1536922246289-88c42f957773",
      scheduledAt: new Date(Date.now() + 86400000) // Tomorrow
    });
    
    const yogaWorkout = this.createWorkout({
      title: "Family Yoga",
      description: "Low intensity flexibility training",
      duration: 45,
      intensity: "Low",
      imageUrl: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776",
      scheduledAt: new Date(Date.now() + 86400000 * 3) // 3 days from now
    });
    
    const runningWorkout = this.createWorkout({
      title: "Morning Run",
      description: "Medium intensity cardio",
      duration: 20,
      intensity: "Medium",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
      scheduledAt: new Date(Date.now() + 86400000 * 4) // 4 days from now
    });
    
    // Assign workouts to users
    this.createUserWorkout({
      userId: sarah.id,
      workoutId: hiitWorkout.id,
      scheduledAt: hiitWorkout.scheduledAt,
      completed: false
    });
    
    this.createUserWorkout({
      userId: sarah.id,
      workoutId: yogaWorkout.id,
      scheduledAt: yogaWorkout.scheduledAt,
      completed: false
    });
    
    this.createUserWorkout({
      userId: mike.id,
      workoutId: yogaWorkout.id,
      scheduledAt: yogaWorkout.scheduledAt,
      completed: false
    });
    
    this.createUserWorkout({
      userId: amy.id,
      workoutId: yogaWorkout.id,
      scheduledAt: yogaWorkout.scheduledAt,
      completed: false
    });
    
    this.createUserWorkout({
      userId: jake.id,
      workoutId: yogaWorkout.id,
      scheduledAt: yogaWorkout.scheduledAt,
      completed: false
    });
    
    this.createUserWorkout({
      userId: mike.id,
      workoutId: runningWorkout.id,
      scheduledAt: runningWorkout.scheduledAt,
      completed: false
    });
    
    this.createUserWorkout({
      userId: jake.id,
      workoutId: runningWorkout.id,
      scheduledAt: runningWorkout.scheduledAt,
      completed: false
    });
    
    // Create sample meals for Sarah
    this.createMeal({
      userId: sarah.id,
      name: "Oatmeal with berries",
      calories: 320,
      protein: 12,
      timestamp: new Date(new Date().setHours(7, 45, 0, 0)),
      mealType: "breakfast"
    });
    
    this.createMeal({
      userId: sarah.id,
      name: "Grilled chicken salad",
      calories: 450,
      protein: 35,
      timestamp: new Date(new Date().setHours(12, 30, 0, 0)),
      mealType: "lunch"
    });
    
    this.createMeal({
      userId: sarah.id,
      name: "Greek yogurt with nuts",
      calories: 180,
      protein: 15,
      timestamp: new Date(new Date().setHours(15, 15, 0, 0)),
      mealType: "snack"
    });
    
    // Create sample challenges
    const stepsChallenge = this.createChallenge({
      title: "10K Steps Challenge",
      description: "Complete 10,000 steps each day for a week",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 7),
      goalType: "steps",
      goalValue: 10000
    });
    
    const hikeChallenge = this.createChallenge({
      title: "Weekend Hike",
      description: "Complete a family hike together",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 3),
      goalType: "activity",
      goalValue: 1
    });
    
    // Assign challenges to users
    this.createUserChallenge({
      userId: sarah.id,
      challengeId: stepsChallenge.id,
      progress: 7500,
      completed: false
    });
    
    this.createUserChallenge({
      userId: mike.id,
      challengeId: stepsChallenge.id,
      progress: 8000,
      completed: false
    });
    
    this.createUserChallenge({
      userId: jake.id,
      challengeId: stepsChallenge.id,
      progress: 7000,
      completed: false
    });
    
    this.createUserChallenge({
      userId: sarah.id,
      challengeId: hikeChallenge.id,
      progress: 1,
      completed: true
    });
    
    this.createUserChallenge({
      userId: mike.id,
      challengeId: hikeChallenge.id,
      progress: 1,
      completed: true
    });
    
    this.createUserChallenge({
      userId: amy.id,
      challengeId: hikeChallenge.id,
      progress: 1,
      completed: true
    });
    
    this.createUserChallenge({
      userId: jake.id,
      challengeId: hikeChallenge.id,
      progress: 1,
      completed: true
    });
    
    // Create AI conversation
    this.createAIConversation({
      userId: sarah.id,
      messages: [
        {
          role: "assistant",
          content: "Hello Sarah! Based on your recent activity, I've noticed your workouts have been less intense. Is everything okay? Would you like some suggestions for quick, effective exercises to fit your busy schedule?"
        },
        {
          role: "user",
          content: "Yes, I've been feeling a bit tired lately. I'd love some quick workout suggestions that I can do at home."
        },
        {
          role: "assistant",
          content: "I understand! Fatigue can affect workout motivation. Here's a 15-minute HIIT routine you can do at home without equipment:\n- 30 seconds jumping jacks\n- 30 seconds push-ups (modified if needed)\n- 30 seconds squats\n- 30 seconds rest\n- Repeat 5 times\n\nWould you like me to add this to your schedule for tomorrow morning?"
        }
      ]
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByFamilyId(familyId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.familyId === familyId
    );
  }

  // Family operations
  async getFamily(id: number): Promise<Family | undefined> {
    return this.families.get(id);
  }

  async createFamily(family: InsertFamily): Promise<Family> {
    const id = this.familyCounter++;
    const newFamily: Family = { ...family, id, createdAt: new Date() };
    this.families.set(id, newFamily);
    return newFamily;
  }

  async updateFamily(id: number, familyData: Partial<InsertFamily>): Promise<Family | undefined> {
    const family = await this.getFamily(id);
    if (!family) return undefined;
    
    const updatedFamily = { ...family, ...familyData };
    this.families.set(id, updatedFamily);
    return updatedFamily;
  }

  // Health metrics operations
  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.get(id);
  }

  async getHealthMetricsForUser(userId: number, limit?: number): Promise<HealthMetric[]> {
    const metrics = Array.from(this.healthMetrics.values())
      .filter((metric) => metric.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? metrics.slice(0, limit) : metrics;
  }

  async createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.healthMetricCounter++;
    const newMetric: HealthMetric = { ...metric, id };
    this.healthMetrics.set(id, newMetric);
    return newMetric;
  }

  // Workout operations
  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async getAllWorkouts(): Promise<Workout[]> {
    return Array.from(this.workouts.values());
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.workoutCounter++;
    const newWorkout: Workout = { ...workout, id };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  // UserWorkout operations
  async getUserWorkout(id: number): Promise<UserWorkout | undefined> {
    return this.userWorkouts.get(id);
  }

  async getWorkoutsForUser(userId: number): Promise<UserWorkout[]> {
    return Array.from(this.userWorkouts.values()).filter(
      (userWorkout) => userWorkout.userId === userId
    );
  }

  async getUpcomingWorkoutsForUser(userId: number): Promise<UserWorkout[]> {
    const now = new Date();
    return Array.from(this.userWorkouts.values())
      .filter((userWorkout) => {
        return userWorkout.userId === userId && 
               userWorkout.scheduledAt !== null && 
               userWorkout.scheduledAt > now &&
               !userWorkout.completed;
      })
      .sort((a, b) => {
        if (!a.scheduledAt || !b.scheduledAt) return 0;
        return a.scheduledAt.getTime() - b.scheduledAt.getTime();
      });
  }

  async createUserWorkout(userWorkout: InsertUserWorkout): Promise<UserWorkout> {
    const id = this.userWorkoutCounter++;
    const newUserWorkout: UserWorkout = { ...userWorkout, id, completedAt: null };
    this.userWorkouts.set(id, newUserWorkout);
    return newUserWorkout;
  }

  async completeUserWorkout(id: number): Promise<UserWorkout | undefined> {
    const userWorkout = await this.getUserWorkout(id);
    if (!userWorkout) return undefined;
    
    const completedWorkout: UserWorkout = { 
      ...userWorkout, 
      completed: true, 
      completedAt: new Date() 
    };
    
    this.userWorkouts.set(id, completedWorkout);
    return completedWorkout;
  }

  // Meal operations
  async getMeal(id: number): Promise<Meal | undefined> {
    return this.meals.get(id);
  }

  async getMealsForUser(userId: number, date?: Date): Promise<Meal[]> {
    let meals = Array.from(this.meals.values()).filter(
      (meal) => meal.userId === userId
    );
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      meals = meals.filter(
        (meal) => meal.timestamp >= startOfDay && meal.timestamp <= endOfDay
      );
    }
    
    return meals.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const id = this.mealCounter++;
    const newMeal: Meal = { ...meal, id };
    this.meals.set(id, newMeal);
    return newMeal;
  }

  // Challenge operations
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return Array.from(this.challenges.values()).filter(
      (challenge) => challenge.startDate <= now && challenge.endDate >= now
    );
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeCounter++;
    const newChallenge: Challenge = { ...challenge, id };
    this.challenges.set(id, newChallenge);
    return newChallenge;
  }

  // UserChallenge operations
  async getUserChallenge(id: number): Promise<UserChallenge | undefined> {
    return this.userChallenges.get(id);
  }

  async getUserChallengesForUser(userId: number): Promise<UserChallenge[]> {
    return Array.from(this.userChallenges.values()).filter(
      (userChallenge) => userChallenge.userId === userId
    );
  }

  async getUserChallengesForChallenge(challengeId: number): Promise<UserChallenge[]> {
    return Array.from(this.userChallenges.values()).filter(
      (userChallenge) => userChallenge.challengeId === challengeId
    );
  }

  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const id = this.userChallengeCounter++;
    const newUserChallenge: UserChallenge = { ...userChallenge, id };
    this.userChallenges.set(id, newUserChallenge);
    return newUserChallenge;
  }

  async updateUserChallengeProgress(id: number, progress: number): Promise<UserChallenge | undefined> {
    const userChallenge = await this.getUserChallenge(id);
    if (!userChallenge) return undefined;
    
    // Get the challenge to check if progress meets goal
    const challenge = await this.getChallenge(userChallenge.challengeId);
    if (!challenge) return undefined;
    
    const completed = progress >= challenge.goalValue;
    
    const updatedUserChallenge: UserChallenge = { 
      ...userChallenge, 
      progress,
      completed
    };
    
    this.userChallenges.set(id, updatedUserChallenge);
    return updatedUserChallenge;
  }

  // AI Conversation operations
  async getAIConversation(id: number): Promise<AIConversation | undefined> {
    return this.aiConversations.get(id);
  }

  async getAIConversationsForUser(userId: number): Promise<AIConversation[]> {
    return Array.from(this.aiConversations.values())
      .filter((conversation) => conversation.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async createAIConversation(conversation: InsertAIConversation): Promise<AIConversation> {
    const id = this.aiConversationCounter++;
    const now = new Date();
    const newConversation: AIConversation = { 
      ...conversation, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    
    this.aiConversations.set(id, newConversation);
    return newConversation;
  }

  async updateAIConversation(id: number, messages: any[]): Promise<AIConversation | undefined> {
    const conversation = await this.getAIConversation(id);
    if (!conversation) return undefined;
    
    const updatedConversation: AIConversation = { 
      ...conversation, 
      messages,
      updatedAt: new Date()
    };
    
    this.aiConversations.set(id, updatedConversation);
    return updatedConversation;
  }
}

export const storage = new MemStorage();
