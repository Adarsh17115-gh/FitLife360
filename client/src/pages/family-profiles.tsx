import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { FamilyMember } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, TrashIcon, User, UserPlus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  relationship: z.string().min(1, "Relationship is required"),
});

export default function FamilyProfiles() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: familyMembers, isLoading, error } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family/members'],
  });

  const addMemberMutation = useMutation({
    mutationFn: async (newMember: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/family/members", newMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/members'] });
      toast({
        title: "Success",
        description: "Family member added successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add family member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: undefined,
      relationship: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addMemberMutation.mutate(values);
  };

  return (
    <>
      {/* Page Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold">Family Profiles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your family members and track progress together</p>
        </div>
        <div className="ml-auto">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Family Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                    <DialogDescription>
                      Add a new family member to track their fitness journey together.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="35" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input placeholder="Spouse, Child, Parent, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={addMemberMutation.isPending}>
                      {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="adults">Adults</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
          </TabsList>

          {/* All Members Tab */}
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(4)].map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                Failed to load family members. Please try again later.
              </div>
            ) : familyMembers && familyMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyMembers.map((member) => (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={`${member.name}'s avatar`} 
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary-500" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-md">
                            {member.name} {member.isCurrentUser && "(You)"}
                          </CardTitle>
                          <CardDescription>{member.relationship} • {member.age} years old</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Daily Goal Progress</span>
                            <span className="font-medium">{member.dailyGoalPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div 
                              className="bg-primary-500 h-full rounded-full" 
                              style={{ width: `${member.dailyGoalPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Streak</span>
                            <span className="font-medium">{member.streak} days</span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(7)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`h-2 flex-1 rounded-full ${i < member.streak ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Last Active</span>
                            <span className="font-medium">{member.status === 'online' ? 'Now' : member.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {!member.isCurrentUser && (
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">No family members yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add your family members to track their fitness journey together.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Family Member
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Adults Tab */}
          <TabsContent value="adults" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(2)].map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                Failed to load family members. Please try again later.
              </div>
            ) : familyMembers && familyMembers.filter(m => m.age >= 18).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyMembers.filter(m => m.age >= 18).map((member) => (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={`${member.name}'s avatar`} 
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary-500" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-md">
                            {member.name} {member.isCurrentUser && "(You)"}
                          </CardTitle>
                          <CardDescription>{member.relationship} • {member.age} years old</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Daily Goal Progress</span>
                            <span className="font-medium">{member.dailyGoalPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div 
                              className="bg-primary-500 h-full rounded-full" 
                              style={{ width: `${member.dailyGoalPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Streak</span>
                            <span className="font-medium">{member.streak} days</span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(7)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`h-2 flex-1 rounded-full ${i < member.streak ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Last Active</span>
                            <span className="font-medium">{member.status === 'online' ? 'Now' : member.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {!member.isCurrentUser && (
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">No adult members found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add adult family members to track their fitness journey together.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Adult Member
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Children Tab */}
          <TabsContent value="children" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(2)].map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                Failed to load family members. Please try again later.
              </div>
            ) : familyMembers && familyMembers.filter(m => m.age < 18).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyMembers.filter(m => m.age < 18).map((member) => (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={`${member.name}'s avatar`} 
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary-500" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-md">
                            {member.name}
                          </CardTitle>
                          <CardDescription>{member.relationship} • {member.age} years old</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Daily Goal Progress</span>
                            <span className="font-medium">{member.dailyGoalPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div 
                              className="bg-primary-500 h-full rounded-full" 
                              style={{ width: `${member.dailyGoalPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Streak</span>
                            <span className="font-medium">{member.streak} days</span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(7)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`h-2 flex-1 rounded-full ${i < member.streak ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Last Active</span>
                            <span className="font-medium">{member.status === 'online' ? 'Now' : member.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">No children found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add children to track their fitness journey together.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
