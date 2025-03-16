import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopBar from "@/components/layout/top-bar";
import FamilyProfileSwitcher from "@/components/layout/family-profile-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { formatTime, formatDate, calculateProgress } from "@/lib/utils";
import { getAIMealRecommendations } from "@/lib/ai";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import {
  Apple,
  Coffee,
  MessageSquare,
  Plus,
  Search,
  Soup,
  Utensils,
  Droplet,
  PieChart,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const mealFormSchema = z.object({
  name: z.string().min(3, { message: "Meal name must be at least 3 characters" }),
  calories: z.number().min(1, { message: "Calories must be at least 1" }),
  protein: z.number().min(0, { message: "Protein must be a positive number" }),
  mealType: z.string(),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

export default function Nutrition() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [mealRecommendations, setMealRecommendations] = useState<any>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get meals for today
  const { data: todayMeals, isLoading: isLoadingTodayMeals } = useQuery({
    queryKey: ['/api/users/1/meals', { date: new Date().toISOString().split('T')[0] }],
  });

  // Get meals for the week
  const { data: weekMeals, isLoading: isLoadingWeekMeals } = useQuery({
    queryKey: ['/api/users/1/meals'],
  });

  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      mealType: "breakfast",
    },
  });

  const addMealMutation = useMutation({
    mutationFn: async (meal: MealFormValues) => {
      return await apiRequest("POST", "/api/meals", {
        ...meal,
        userId: 1,
        timestamp: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/meals'] });
      setIsAddMealOpen(false);
      form.reset();
      toast({
        title: "Meal Added",
        description: "Your meal has been added successfully",
      });
    },
  });

  const onSubmit = (data: MealFormValues) => {
    addMealMutation.mutate(data);
  };

  const getAIRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    try {
      const recommendations = await getAIMealRecommendations(1, "Balanced, high-protein meals", "None");
      setMealRecommendations(recommendations);
    } catch (error) {
      console.error("Error getting meal recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to get meal recommendations",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  // Handle adding a recommended meal
  const addRecommendedMeal = async (meal: any) => {
    try {
      await apiRequest("POST", "/api/meals", {
        userId: 1,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein || 0,
        timestamp: new Date(),
        mealType: "lunch", // Default to lunch for recommendations
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/meals'] });
      toast({
        title: "Meal Added",
        description: `${meal.name} has been added to your meals`,
      });
    } catch (error) {
      console.error("Error adding recommended meal:", error);
      toast({
        title: "Error",
        description: "Failed to add meal",
        variant: "destructive",
      });
    }
  };

  // Sample meals if none are returned
  const displayTodayMeals = todayMeals?.length > 0 ? todayMeals : [
    {
      id: 1,
      userId: 1,
      name: "Oatmeal with berries",
      calories: 320,
      protein: 12,
      timestamp: new Date(new Date().setHours(7, 45, 0, 0)),
      mealType: "breakfast"
    },
    {
      id: 2,
      userId: 1,
      name: "Grilled chicken salad",
      calories: 450,
      protein: 35,
      timestamp: new Date(new Date().setHours(12, 30, 0, 0)),
      mealType: "lunch"
    },
    {
      id: 3,
      userId: 1,
      name: "Greek yogurt with nuts",
      calories: 180,
      protein: 15,
      timestamp: new Date(new Date().setHours(15, 15, 0, 0)),
      mealType: "snack"
    }
  ];

  // Calculate totals
  const totalCalories = displayTodayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = displayTodayMeals.reduce((sum, meal) => sum + meal.protein, 0);
  
  // Goals
  const calorieGoal = 2000;
  const proteinGoal = 120;
  const waterGoal = 2.5; // liters
  
  // Current water intake (hardcoded for now)
  const waterIntake = 1.2;

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return <Coffee className="h-4 w-4 text-primary" />;
      case "lunch":
      case "dinner":
        return <Utensils className="h-4 w-4 text-primary" />;
      case "snack":
        return <Soup className="h-4 w-4 text-primary" />;
      default:
        return <Apple className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar - conditionally rendered */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
          <aside 
            className="fixed inset-y-0 left-0 w-64 bg-sidebar dark:bg-gray-800 text-sidebar-foreground overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64">
        <TopBar title="Nutrition" toggleMobileMenu={toggleMobileMenu} />
        <FamilyProfileSwitcher />

        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Nutrition Tracker</h2>
            <div className="flex items-center gap-2">
              <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Meal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Meal</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meal Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Grilled Chicken Salad" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="calories"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calories</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="protein"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Protein (g)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="mealType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meal Type</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                {...field}
                              >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={addMealMutation.isPending}>
                          {addMealMutation.isPending ? "Adding..." : "Add Meal"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={getAIRecommendations} disabled={isGeneratingRecommendations}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {isGeneratingRecommendations ? "Generating..." : "AI Recommendations"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>AI Meal Recommendations</DialogTitle>
                  </DialogHeader>
                  {mealRecommendations ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Here are some meal recommendations based on your nutritional goals and preferences.
                      </p>
                      <div className="space-y-4">
                        {mealRecommendations.recommendations?.map((meal: any, index: number) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{meal.name}</CardTitle>
                              <CardDescription>{meal.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-4 text-sm mb-3">
                                <div className="flex items-center">
                                  <PieChart className="mr-1 h-4 w-4 text-primary" />
                                  {meal.calories} calories
                                </div>
                                <div className="flex items-center">
                                  <Droplet className="mr-1 h-4 w-4 text-primary" />
                                  {meal.protein}g protein
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => addRecommendedMeal(meal)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add to My Meals
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6">
                      <Skeleton className="h-[200px] w-full" />
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Nutrition Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="week">This Week</TabsTrigger>
                  </TabsList>
                  <TabsContent value="today" className="mt-6 space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Calories</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{totalCalories}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">/ {calorieGoal} kcal</div>
                          <Progress 
                            value={calculateProgress(totalCalories, calorieGoal)} 
                            className="h-1 mt-2" 
                          />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Protein</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{totalProtein}g</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">/ {proteinGoal}g</div>
                          <Progress 
                            value={calculateProgress(totalProtein, proteinGoal)} 
                            className="h-1 mt-2" 
                          />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Water</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{waterIntake}L</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">/ {waterGoal}L</div>
                          <Progress 
                            value={calculateProgress(waterIntake, waterGoal)} 
                            className="h-1 mt-2" 
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Today's Meals</h3>
                      <div className="space-y-3">
                        {isLoadingTodayMeals ? (
                          <>
                            <Skeleton className="h-[60px] w-full" />
                            <Skeleton className="h-[60px] w-full" />
                            <Skeleton className="h-[60px] w-full" />
                          </>
                        ) : (
                          displayTodayMeals.map((meal) => (
                            <div key={meal.id} className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 p-3">
                              <div className="flex items-center gap-3">
                                <div className="rounded-md bg-primary/10 p-2">
                                  {getMealIcon(meal.mealType)}
                                </div>
                                <div>
                                  <h4 className="font-medium">{meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{meal.name}</p>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="font-medium">{meal.calories} kcal</div>
                                <div className="text-gray-500 dark:text-gray-400">{formatTime(meal.timestamp)}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="week" className="mt-6">
                    {isLoadingWeekMeals ? (
                      <Skeleton className="h-[400px] w-full" />
                    ) : (
                      <div className="space-y-4">
                        {/* Sample weekly view */}
                        {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                          const date = new Date();
                          date.setDate(date.getDate() - dayOffset);
                          
                          // Filter meals for this day
                          const dayMeals = displayTodayMeals.filter(meal => {
                            const mealDate = new Date(meal.timestamp);
                            return mealDate.toDateString() === date.toDateString();
                          });
                          
                          if (dayMeals.length === 0 && dayOffset > 3) return null;
                          
                          const dayTotal = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
                          
                          return (
                            <Card key={dayOffset}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">
                                    {dayOffset === 0 ? "Today" : dayOffset === 1 ? "Yesterday" : formatDate(date)}
                                  </CardTitle>
                                  <span className="text-sm font-medium">
                                    {dayTotal} / {calorieGoal} kcal
                                  </span>
                                </div>
                                <Progress 
                                  value={calculateProgress(dayTotal, calorieGoal)} 
                                  className="h-1 mt-2" 
                                />
                              </CardHeader>
                              <CardContent className="pb-3">
                                {dayMeals.length > 0 ? (
                                  <div className="space-y-2">
                                    {dayMeals.map((meal) => (
                                      <div key={meal.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            {getMealIcon(meal.mealType)}
                                          </div>
                                          <span>{meal.name}</span>
                                        </div>
                                        <span>{meal.calories} kcal</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">No meals recorded</p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Add</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search foods..."
                    className="w-full pl-8"
                  />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Frequent Foods</h3>
                  
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <Coffee className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Oatmeal with berries</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Breakfast</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">320 kcal</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <Utensils className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Grilled chicken salad</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Lunch</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">450 kcal</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <Soup className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Greek yogurt with nuts</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Snack</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">180 kcal</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full" variant="outline">
                    Scan Food Label
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
