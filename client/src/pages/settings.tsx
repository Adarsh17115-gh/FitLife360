import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopBar from "@/components/layout/top-bar";
import FamilyProfileSwitcher from "@/components/layout/family-profile-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getCurrentUser } from "@/lib/utils";
import {
  User,
  Lock,
  Bell,
  Moon,
  Shield,
  Globe,
  RefreshCcw,
  Save,
  Trash2,
  Smartphone,
  ExternalLink
} from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  avatar: z.string().url({ message: "Please enter a valid URL" }).optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Settings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = getCurrentUser();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await apiRequest("PATCH", `/api/users/${currentUser.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      return await apiRequest("PATCH", `/api/users/${currentUser.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
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
        <TopBar title="Settings" toggleMobileMenu={toggleMobileMenu} />
        <FamilyProfileSwitcher />

        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          <Tabs defaultValue="account">
            <div className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User size={16} />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell size={16} />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Moon size={16} />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="account" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="avatar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Avatar URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://example.com/avatar.jpg" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="mt-4"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                      Preview your profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 text-xl font-bold">{currentUser.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                    </p>
                    <p className="mt-2 text-sm">{currentUser.email}</p>
                    
                    <div className="mt-6 w-full">
                      <div className="flex justify-between text-sm">
                        <span>Username</span>
                        <span className="font-medium">{currentUser.username}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-sm">
                        <span>Family ID</span>
                        <span className="font-medium">{currentUser.familyId}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="mt-4"
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </Form>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-gray-500" />
                        <span>Two-factor authentication</span>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Actions that can't be undone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-destructive/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          This will permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose which notifications you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">App Notifications</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="workout-reminders" className="flex flex-1 items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <span>Workout Reminders</span>
                        </Label>
                        <Switch id="workout-reminders" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="challenge-updates" className="flex flex-1 items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <span>Challenge Updates</span>
                        </Label>
                        <Switch id="challenge-updates" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="family-activity" className="flex flex-1 items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <span>Family Member Activity</span>
                        </Label>
                        <Switch id="family-activity" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ai-coach" className="flex flex-1 items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <span>AI Coach Messages</span>
                        </Label>
                        <Switch id="ai-coach" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Email Notifications</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weekly-summary" className="flex flex-1 items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>Weekly Activity Summary</span>
                        </Label>
                        <Switch id="weekly-summary" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="new-challenges" className="flex flex-1 items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>New Family Challenges</span>
                        </Label>
                        <Switch id="new-challenges" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="account-updates" className="flex flex-1 items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>Account Updates</span>
                        </Label>
                        <Switch id="account-updates" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="promotional-emails" className="flex flex-1 items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>Promotional Emails</span>
                        </Label>
                        <Switch id="promotional-emails" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>App Preferences</CardTitle>
                  <CardDescription>
                    Customize your app experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Appearance</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode" className="flex flex-1 items-center gap-2">
                          <Moon className="h-4 w-4 text-gray-500" />
                          <span>Dark Mode</span>
                        </Label>
                        <Switch 
                          id="dark-mode" 
                          defaultChecked={localStorage.getItem("darkMode") === "true"}
                          onCheckedChange={(checked) => {
                            document.documentElement.classList.toggle("dark", checked);
                            localStorage.setItem("darkMode", checked.toString());
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Units & Measurements</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="distance-unit">Distance</Label>
                          <select
                            id="distance-unit"
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            defaultValue="miles"
                          >
                            <option value="miles">Miles</option>
                            <option value="kilometers">Kilometers</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="weight-unit">Weight</Label>
                          <select
                            id="weight-unit"
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            defaultValue="pounds"
                          >
                            <option value="pounds">Pounds (lbs)</option>
                            <option value="kilograms">Kilograms (kg)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="height-unit">Height</Label>
                          <select
                            id="height-unit"
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            defaultValue="feetInches"
                          >
                            <option value="feetInches">Feet & Inches</option>
                            <option value="centimeters">Centimeters</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="calories-goal">Daily Calorie Goal</Label>
                          <Input id="calories-goal" type="number" defaultValue="2000" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Connected Accounts</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Google Fit</p>
                            <p className="text-xs text-gray-500">Connect to sync your activity data</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Connect
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-black dark:text-white" />
                          <div>
                            <p className="font-medium">Apple Health</p>
                            <p className="text-xs text-gray-500">Connect to sync your activity data</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>
                    Manage your data and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Export Your Data</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Download a copy of all your FitLife360 data
                      </p>
                    </div>
                    <Button variant="outline">
                      Export Data
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Data Sharing</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Control how your data is used for personalization
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
