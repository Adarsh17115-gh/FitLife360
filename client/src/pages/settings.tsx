import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, NutritionGoals } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { SaveIcon, UserCircle, Server, Bell, Database, Shield, Smartphone, Moon, MoonStar, SunMedium } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  height: z.coerce.number().min(50, "Height must be at least 50cm.").max(250, "Height must be less than 250cm."),
  weight: z.coerce.number().min(20, "Weight must be at least 20kg.").max(300, "Weight must be less than 300kg."),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
});

const nutritionFormSchema = z.object({
  goalCalories: z.coerce.number().min(1000, "Daily calorie goal must be at least 1000.").max(5000, "Daily calorie goal must be less than 5000."),
  goalProtein: z.coerce.number().min(20, "Protein goal must be at least 20g.").max(300, "Protein goal must be less than 300g."),
  goalCarbs: z.coerce.number().min(50, "Carbs goal must be at least 50g.").max(500, "Carbs goal must be less than 500g."),
  goalFat: z.coerce.number().min(20, "Fat goal must be at least 20g.").max(200, "Fat goal must be less than 200g."),
  goalWater: z.coerce.number().min(1, "Water goal must be at least 1 glass.").max(20, "Water goal must be less than 20 glasses."),
  goalFiber: z.coerce.number().min(5, "Fiber goal must be at least 5g.").max(100, "Fiber goal must be less than 100g.")
});

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthIntegrationEnabled, setHealthIntegrationEnabled] = useState(false);

  // User Profile Data
  const { data: userData, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/user/profile'],
  });

  // Nutrition Goals Data
  const { data: nutritionData, isLoading: isNutritionLoading } = useQuery<NutritionGoals>({
    queryKey: ['/api/nutrition/goals'],
  });

  // Profile form setup
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      height: userData?.height || 170,
      weight: userData?.weight || 70,
      gender: userData?.gender || "other",
      dateOfBirth: userData?.dateOfBirth || "1990-01-01",
    },
    values: {
      name: userData?.name || "",
      email: userData?.email || "",
      height: userData?.height || 170,
      weight: userData?.weight || 70,
      gender: userData?.gender || "other",
      dateOfBirth: userData?.dateOfBirth || "1990-01-01",
    }
  });

  // Nutrition form setup
  const nutritionForm = useForm<z.infer<typeof nutritionFormSchema>>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      goalCalories: nutritionData?.goalCalories || 2000,
      goalProtein: nutritionData?.goalProtein || 150,
      goalCarbs: nutritionData?.goalCarbs || 200,
      goalFat: nutritionData?.goalFat || 70,
      goalWater: nutritionData?.goalWater || 8,
      goalFiber: nutritionData?.goalFiber || 30,
    },
    values: {
      goalCalories: nutritionData?.goalCalories || 2000,
      goalProtein: nutritionData?.goalProtein || 150,
      goalCarbs: nutritionData?.goalCarbs || 200,
      goalFat: nutritionData?.goalFat || 70,
      goalWater: nutritionData?.goalWater || 8,
      goalFiber: nutritionData?.goalFiber || 30,
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      return apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Update nutrition goals mutation
  const updateNutritionGoalsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof nutritionFormSchema>) => {
      return apiRequest("PATCH", "/api/nutrition/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition/goals'] });
      toast({
        title: "Nutrition goals updated",
        description: "Your nutrition goals have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update nutrition goals",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Profile form submission handler
  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(data);
  };

  // Nutrition form submission handler
  const onNutritionSubmit = (data: z.infer<typeof nutritionFormSchema>) => {
    updateNutritionGoalsMutation.mutate(data);
  };

  return (
    <>
      {/* Page Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure your account and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-3xl font-medium text-gray-500 dark:text-gray-400">
                        {userData?.avatar ? (
                          <img 
                            src={userData.avatar} 
                            alt={userData.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircle className="h-12 w-12" />
                        )}
                      </div>
                      <div>
                        <Button variant="outline" size="sm">Change Picture</Button>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          JPG, GIF or PNG. 1MB max.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending || isUserLoading}
                    >
                      {updateProfileMutation.isPending && (
                        <SaveIcon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and account security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Change Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Goals</CardTitle>
                <CardDescription>Set your daily nutrition targets.</CardDescription>
              </CardHeader>
              <Form {...nutritionForm}>
                <form onSubmit={nutritionForm.handleSubmit(onNutritionSubmit)}>
                  <CardContent className="space-y-6">
                    <FormField
                      control={nutritionForm.control}
                      name="goalCalories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Calorie Goal</FormLabel>
                          <div className="space-y-2">
                            <FormControl>
                              <Slider
                                min={1000}
                                max={5000}
                                step={50}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <div className="flex justify-between">
                              <FormDescription>
                                Current: {field.value} kcal
                              </FormDescription>
                              <Input
                                type="number"
                                className="w-20 h-8"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nutritionForm.control}
                      name="goalProtein"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protein Goal (g)</FormLabel>
                          <div className="space-y-2">
                            <FormControl>
                              <Slider
                                min={20}
                                max={300}
                                step={5}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <div className="flex justify-between">
                              <FormDescription>
                                Current: {field.value}g
                              </FormDescription>
                              <Input
                                type="number"
                                className="w-20 h-8"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nutritionForm.control}
                      name="goalCarbs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carbohydrates Goal (g)</FormLabel>
                          <div className="space-y-2">
                            <FormControl>
                              <Slider
                                min={50}
                                max={500}
                                step={5}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <div className="flex justify-between">
                              <FormDescription>
                                Current: {field.value}g
                              </FormDescription>
                              <Input
                                type="number"
                                className="w-20 h-8"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nutritionForm.control}
                      name="goalFat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fat Goal (g)</FormLabel>
                          <div className="space-y-2">
                            <FormControl>
                              <Slider
                                min={20}
                                max={200}
                                step={5}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <div className="flex justify-between">
                              <FormDescription>
                                Current: {field.value}g
                              </FormDescription>
                              <Input
                                type="number"
                                className="w-20 h-8"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={nutritionForm.control}
                        name="goalWater"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Water Goal (glasses)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={nutritionForm.control}
                        name="goalFiber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiber Goal (g)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateNutritionGoalsMutation.isPending || isNutritionLoading}
                    >
                      {updateNutritionGoalsMutation.isPending && (
                        <SaveIcon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Nutrition Goals
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Activity Goals</CardTitle>
                <CardDescription>Set your daily and weekly activity targets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Daily Steps Goal</Label>
                  <div className="space-y-2">
                    <Slider
                      defaultValue={[10000]}
                      max={20000}
                      step={500}
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Current: 10,000 steps
                      </span>
                      <Input
                        type="number"
                        className="w-20 h-8"
                        defaultValue={10000}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Weekly Exercise Goal (minutes)</Label>
                  <div className="space-y-2">
                    <Slider
                      defaultValue={[150]}
                      max={600}
                      step={10}
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Current: 150 minutes
                      </span>
                      <Input
                        type="number"
                        className="w-20 h-8"
                        defaultValue={150}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sleep Goal (hours per night)</Label>
                  <div className="space-y-2">
                    <Slider
                      defaultValue={[8]}
                      min={5}
                      max={12}
                      step={0.5}
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Current: 8 hours
                      </span>
                      <Input
                        type="number"
                        className="w-20 h-8"
                        defaultValue={8}
                        step={0.5}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Activity Goals</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="flex-1"
                    >
                      <SunMedium className="mr-2 h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="flex-1"
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                      className="flex-1"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      System
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduce-motion">Reduce Motion</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Minimize animations throughout the app.
                    </p>
                  </div>
                  <Switch id="reduce-motion" />
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Increase contrast for better readability.
                    </p>
                  </div>
                  <Switch id="high-contrast" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-notifications">Enable Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive reminders and updates about your fitness journey.
                    </p>
                  </div>
                  <Switch 
                    id="enable-notifications" 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <div className={!notificationsEnabled ? "opacity-50 pointer-events-none" : ""}>
                  <div className="space-y-2">
                    <Label>Notification Types</Label>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="workout-reminders" className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4 text-gray-500" />
                          Workout Reminders
                        </Label>
                        <Switch id="workout-reminders" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="nutrition-alerts" className="flex items-center gap-2">
                          <Apple className="h-4 w-4 text-gray-500" />
                          Nutrition Alerts
                        </Label>
                        <Switch id="nutrition-alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="challenge-updates" className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-gray-500" />
                          Challenge Updates
                        </Label>
                        <Switch id="challenge-updates" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="family-activity" className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          Family Activity
                        </Label>
                        <Switch id="family-activity" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Health Data Integrations</CardTitle>
                <CardDescription>Connect to external health services to sync your data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="health-integration">Enable Health Integrations</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Connect to services like Google Fit or Apple Health.
                    </p>
                  </div>
                  <Switch 
                    id="health-integration" 
                    checked={healthIntegrationEnabled}
                    onCheckedChange={setHealthIntegrationEnabled}
                  />
                </div>

                <div className={!healthIntegrationEnabled ? "opacity-50 pointer-events-none" : ""}>
                  <div className="space-y-2">
                    <Label>Available Integrations</Label>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                              <circle cx="20" cy="10" r="2" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Google Fit</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sync activities and health data</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>

                      <div className="flex items-center justify-between border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                              <path d="M10 2c1 .5 2 2 2 5" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Apple Health</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sync activities and health data</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>

                      <div className="flex items-center justify-between border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                              <circle cx="12" cy="12" r="2" />
                              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Fitbit</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sync activities and sleep data</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Privacy and Data</CardTitle>
                <CardDescription>Manage your data and privacy settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-collection">Allow Data Collection</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      We use this data to improve the app and your experience.
                    </p>
                  </div>
                  <Switch id="data-collection" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing">Allow Data Sharing</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Share your fitness data with family members.
                    </p>
                  </div>
                  <Switch id="data-sharing" defaultChecked />
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
