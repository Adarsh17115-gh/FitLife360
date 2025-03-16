import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopBar from "@/components/layout/top-bar";
import FamilyProfileSwitcher from "@/components/layout/family-profile-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getFamilyMembers } from "@/lib/utils";
import {
  User,
  Users,
  Plus,
  Edit,
  BarChart,
  Activity,
  Trophy,
  Mail,
  Phone,
  Calendar,
  Cake
} from "lucide-react";

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string(),
  avatar: z.string().optional(),
  birthDate: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  phone: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function FamilyProfiles() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profiles");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get family members
  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ['/api/families/1/users'],
  });

  // Get family info
  const { data: family } = useQuery({
    queryKey: ['/api/families/1'],
  });

  const addForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      role: "member",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      birthDate: "",
      height: "",
      weight: "",
      phone: "",
    },
  });

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      role: "member",
      avatar: "",
      birthDate: "",
      height: "",
      weight: "",
      phone: "",
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (userData: UserFormValues) => {
      return await apiRequest("POST", "/api/users", {
        ...userData,
        password: "password", // Default password
        familyId: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families/1/users'] });
      setIsAddMemberOpen(false);
      addForm.reset();
      toast({
        title: "Member Added",
        description: "Family member has been added successfully",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<UserFormValues> }) => {
      return await apiRequest("PATCH", `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/families/1/users'] });
      setIsEditMemberOpen(false);
      editForm.reset();
      toast({
        title: "Member Updated",
        description: "Family member has been updated successfully",
      });
    },
  });

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    editForm.reset({
      name: member.name,
      username: member.username,
      email: member.email,
      role: member.role,
      avatar: member.avatar,
      birthDate: member.birthDate || "",
      height: member.height || "",
      weight: member.weight || "",
      phone: member.phone || "",
    });
    setIsEditMemberOpen(true);
  };

  const onAddSubmit = (data: UserFormValues) => {
    addMemberMutation.mutate(data);
  };

  const onEditSubmit = (data: UserFormValues) => {
    if (selectedMember) {
      updateMemberMutation.mutate({
        id: selectedMember.id,
        userData: data,
      });
    }
  };

  // Sample family members if none are returned
  const displayFamilyMembers = familyMembers?.length > 0 ? familyMembers : getFamilyMembers();

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
        <TopBar title="Family Profiles" toggleMobileMenu={toggleMobileMenu} />
        <FamilyProfileSwitcher />

        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Family Management</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage family members and their profiles
              </p>
            </div>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Family Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="John Doe" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="johndoe" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="john@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                {...field}
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="child">Child</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addForm.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Birth Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
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
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={addMemberMutation.isPending}>
                        {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Edit Member Dialog */}
            <Dialog open={isEditMemberOpen} onOpenChange={setIsEditMemberOpen}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Edit Family Member</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
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
                        control={editForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                {...field}
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="child">Child</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Birth Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={updateMemberMutation.isPending}>
                        {updateMemberMutation.isPending ? "Updating..." : "Update Member"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{family?.name || "The Taylors"}</CardTitle>
              <CardDescription>
                Family created {family?.createdAt ? new Date(family.createdAt).toLocaleDateString() : "January 15, 2024"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profiles" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profiles">Member Profiles</TabsTrigger>
                  <TabsTrigger value="stats">Family Stats</TabsTrigger>
                </TabsList>
                <TabsContent value="profiles" className="mt-6">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-[240px] w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayFamilyMembers.map((member) => (
                        <Card key={member.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-primary">
                                  <AvatarImage src={member.avatar} alt={member.name} />
                                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{member.name}</CardTitle>
                                  <CardDescription>
                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                  </CardDescription>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleEditMember(member)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-4 w-4 text-gray-500" />
                              <span>{member.email}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                            {member.birthDate && (
                              <div className="flex items-center text-sm">
                                <Cake className="mr-2 h-4 w-4 text-gray-500" />
                                <span>{new Date(member.birthDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between pt-2 text-sm">
                              <div className="text-center">
                                <span className="block font-medium">7.5K</span>
                                <span className="text-xs text-gray-500">Steps/day</span>
                              </div>
                              <div className="text-center">
                                <span className="block font-medium">45</span>
                                <span className="text-xs text-gray-500">Active min</span>
                              </div>
                              <div className="text-center">
                                <span className="block font-medium">3</span>
                                <span className="text-xs text-gray-500">Challenges</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t pt-4">
                            <Button variant="outline" className="w-full">
                              <BarChart className="mr-2 h-4 w-4" />
                              View Activity
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="stats" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Activity Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Average Steps</span>
                              </div>
                              <span className="font-bold">8,245</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '82.45%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Average Active Minutes</span>
                              </div>
                              <span className="font-bold">38</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '63.33%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Average Sleep</span>
                              </div>
                              <span className="font-bold">7.2 hrs</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '90%' }}></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Challenge Completion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Completed Challenges</span>
                            <span className="font-bold">7</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Sarah</span>
                              <span>5 challenges</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '71.4%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Mike</span>
                              <span>4 challenges</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '57.1%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Amy</span>
                              <span>3 challenges</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '42.9%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Jake</span>
                              <span>4 challenges</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '57.1%' }}></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Family Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                              <Trophy className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">First Mile Stone</p>
                              <p className="text-xs text-gray-500">All members completed a challenge</p>
                            </div>
                          </div>
                          
                          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                              <Trophy className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Step Masters</p>
                              <p className="text-xs text-gray-500">Reached 100,000 family steps</p>
                            </div>
                          </div>
                          
                          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
                            <div className="rounded-full bg-accent/10 p-2">
                              <Trophy className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium">Weekend Warriors</p>
                              <p className="text-xs text-gray-500">Completed weekend hike challenge</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Family Activity Feed</CardTitle>
              <CardDescription>
                Recent activities and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sarah" />
                      <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Sarah completed a workout</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">HIIT Training - 30 minutes</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Today, 6:45 AM</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Mike" />
                      <AvatarFallback>MT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Mike achieved a goal</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reached 10,000 steps today</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Yesterday, 8:30 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Amy" />
                      <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Amy joined a challenge</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">30-Day Fitness Challenge</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Jake" />
                      <AvatarFallback>JT</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Jake completed a workout</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Morning Run - 20 minutes</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
