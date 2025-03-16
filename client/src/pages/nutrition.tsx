import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MealPlan, NutritionGoals, MealEntry } from "@/types";
import { getAiNutritionRecommendations } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Apple, Calendar, Plus, Search, UtensilsCrossed } from "lucide-react";

const mealFormSchema = z.object({
  name: z.string().min(2, "Meal name must be at least 2 characters long"),
  calories: z.coerce.number().min(1, "Calories must be at least 1"),
  protein: z.coerce.number().min(0, "Protein cannot be negative"),
  carbs: z.coerce.number().min(0, "Carbs cannot be negative"),
  fat: z.coerce.number().min(0, "Fat cannot be negative"),
  notes: z.string().optional(),
});

export default function Nutrition() {
  const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: nutritionGoals, isLoading: isGoalsLoading } = useQuery<NutritionGoals>({
    queryKey: ['/api/nutrition/goals'],
  });

  const { data: mealPlan, isLoading: isMealPlanLoading } = useQuery<MealPlan>({
    queryKey: ['/api/nutrition/meal-plan'],
  });

  const { data: aiRecommendations, isLoading: isAiLoading } = useQuery({
    queryKey: ['/api/ai/nutrition'],
    queryFn: getAiNutritionRecommendations,
  });

  const addMealMutation = useMutation({
    mutationFn: async (newMeal: z.infer<typeof mealFormSchema>) => {
      return apiRequest("POST", "/api/nutrition/meals", newMeal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition/meal-plan'] });
      toast({
        title: "Success",
        description: "Meal added successfully",
      });
      setIsAddMealDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add meal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof mealFormSchema>>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof mealFormSchema>) => {
    addMealMutation.mutate(values);
  };

  const isLoading = isGoalsLoading || isMealPlanLoading;

  const getMacroPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const macrosData = nutritionGoals && [
    { name: 'Protein', value: nutritionGoals.currentProtein, color: '#0891b2' },
    { name: 'Carbs', value: nutritionGoals.currentCarbs, color: '#22c55e' },
    { name: 'Fat', value: nutritionGoals.currentFat, color: '#f59e0b' },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold">Nutrition</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your meals and nutrition goals</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search meals..."
              className="pl-8 w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddMealDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Meal
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
            <TabsTrigger value="food-log">Food Log</TabsTrigger>
            <TabsTrigger value="ai-recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, idx) => (
                        <Skeleton key={idx} className="h-[100px]" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[200px] rounded-lg" />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Nutrition Summary */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Today's Nutrition Summary</CardTitle>
                    <CardDescription>Your daily nutrition progress and goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Calories */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Calories</h3>
                          <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full">
                            {getMacroPercentage(nutritionGoals?.currentCalories || 0, nutritionGoals?.goalCalories || 0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{nutritionGoals?.currentCalories}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ {nutritionGoals?.goalCalories}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                          <div 
                            className="bg-orange-500 h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (nutritionGoals?.currentCalories || 0) / (nutritionGoals?.goalCalories || 1) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Protein */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Protein</h3>
                          <span className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-full">
                            {getMacroPercentage(nutritionGoals?.currentProtein || 0, nutritionGoals?.goalProtein || 0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{nutritionGoals?.currentProtein}g</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ {nutritionGoals?.goalProtein}g</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                          <div 
                            className="bg-cyan-500 h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (nutritionGoals?.currentProtein || 0) / (nutritionGoals?.goalProtein || 1) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Carbs */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Carbs</h3>
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                            {getMacroPercentage(nutritionGoals?.currentCarbs || 0, nutritionGoals?.goalCarbs || 0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{nutritionGoals?.currentCarbs}g</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ {nutritionGoals?.goalCarbs}g</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                          <div 
                            className="bg-green-500 h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (nutritionGoals?.currentCarbs || 0) / (nutritionGoals?.goalCarbs || 1) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Fat */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Fat</h3>
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            {getMacroPercentage(nutritionGoals?.currentFat || 0, nutritionGoals?.goalFat || 0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{nutritionGoals?.currentFat}g</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ {nutritionGoals?.goalFat}g</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                          <div 
                            className="bg-amber-500 h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (nutritionGoals?.currentFat || 0) / (nutritionGoals?.goalFat || 1) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Water */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Water</h3>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            {getMacroPercentage(nutritionGoals?.currentWater || 0, nutritionGoals?.goalWater || 0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{nutritionGoals?.currentWater}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ {nutritionGoals?.goalWater} glasses</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (nutritionGoals?.currentWater || 0) / (nutritionGoals?.goalWater || 1) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Fiber */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Fiber</h3>
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                            {getMacroPercentage(nutritionGoals?.currentFiber || 0, nutritionGoals?.goalFiber || 0)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{nutritionGoals?.currentFiber}g</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ {nutritionGoals?.goalFiber}g</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                          <div 
                            className="bg-purple-500 h-full rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (nutritionGoals?.currentFiber || 0) / (nutritionGoals?.goalFiber || 1) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Macronutrient Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Macronutrient Distribution</CardTitle>
                    <CardDescription>Breakdown of your macros</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {macrosData && (
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={macrosData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {macrosData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value}g`, 'Amount']}
                              contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Today's Meals */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Today's Meals</CardTitle>
                    <CardDescription>Log of meals eaten today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mealPlan?.meals && mealPlan.meals.length > 0 ? (
                      <div className="space-y-4">
                        {mealPlan.meals.map((meal: MealEntry) => (
                          <div key={meal.id} className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                              <UtensilsCrossed className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-medium">{meal.name}</h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</span>
                              </div>
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                <div className="text-xs">
                                  <span className="block text-gray-500 dark:text-gray-400">Calories</span>
                                  <span className="font-medium">{meal.calories} kcal</span>
                                </div>
                                <div className="text-xs">
                                  <span className="block text-gray-500 dark:text-gray-400">Protein</span>
                                  <span className="font-medium">{meal.protein}g</span>
                                </div>
                                <div className="text-xs">
                                  <span className="block text-gray-500 dark:text-gray-400">Carbs</span>
                                  <span className="font-medium">{meal.carbs}g</span>
                                </div>
                                <div className="text-xs">
                                  <span className="block text-gray-500 dark:text-gray-400">Fat</span>
                                  <span className="font-medium">{meal.fat}g</span>
                                </div>
                              </div>
                              {meal.notes && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{meal.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Apple className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium mb-2">No meals logged today</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Start tracking your nutrition by adding meals.
                        </p>
                        <Button onClick={() => setIsAddMealDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Meal
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Meal Plan Tab */}
          <TabsContent value="meal-plan">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Meal planning coming soon</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Plan your meals ahead of time to stay on track with your nutrition goals.
              </p>
              <Button variant="outline">Subscribe for Updates</Button>
            </div>
          </TabsContent>

          {/* Food Log Tab */}
          <TabsContent value="food-log">
            <div className="text-center py-12">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Your food history will appear here</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Keep track of your eating habits over time.
              </p>
              <Button variant="outline">View Sample Report</Button>
            </div>
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="ai-recommendations">
            {isAiLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  
                  <Skeleton className="h-5 w-32 mb-2" />
                  
                  {[...Array(2)].map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20 rounded-full" />
                          <Skeleton className="h-4 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : aiRecommendations ? (
              <Card>
                <CardHeader>
                  <CardTitle>AI Nutrition Recommendations</CardTitle>
                  <CardDescription>Personalized meal suggestions based on your health goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/50 p-3 rounded-lg">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Macronutrient Balance</h4>
                      </div>
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{aiRecommendations.insight}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Today's Suggestions</h4>
                    
                    {aiRecommendations.suggestions.map((meal, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                          <img 
                            src={meal.image} 
                            alt={meal.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{meal.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full">{meal.protein}g protein</span>
                            <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full">{meal.calories} cal</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          form.setValue("name", meal.name);
                          form.setValue("calories", meal.calories);
                          form.setValue("protein", meal.protein);
                          setIsAddMealDialogOpen(true);
                        }}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Get More Recommendations</Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                Failed to load AI recommendations. Please try again later.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Meal Dialog */}
        <Dialog open={isAddMealDialogOpen} onOpenChange={setIsAddMealDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Add Meal</DialogTitle>
                  <DialogDescription>
                    Log a meal to track your nutrition intake.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Grilled Chicken Salad" {...field} />
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
                            <Input type="number" placeholder="e.g. 350" {...field} />
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
                            <Input type="number" placeholder="e.g. 30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="carbs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbs (g)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 25" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fat (g)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g. 15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. Pre-workout meal, restaurant name, etc." 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addMealMutation.isPending}>
                    {addMealMutation.isPending ? "Adding..." : "Add Meal"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
