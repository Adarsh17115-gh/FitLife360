import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopBar from "@/components/layout/top-bar";
import FamilyProfileSwitcher from "@/components/layout/family-profile-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { sendMessageToAICoach, createAIConversation } from "@/lib/ai";
import { formatRelativeTime } from "@/lib/utils";
import { MessageSquare, Send, FileText, Plus, ChevronRight } from "lucide-react";

export default function AICoach() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [newConversationTopic, setNewConversationTopic] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['/api/users/1/ai-conversations'],
  });

  useEffect(() => {
    if (conversations?.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const { data: activeConversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['/api/ai-conversations', activeConversationId],
    enabled: !!activeConversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (activeConversationId) {
        return await sendMessageToAICoach(activeConversationId, message);
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-conversations', activeConversationId] });
      setMessage("");
      
      // Scroll to the bottom of the messages
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (initialMessage: string) => {
      return await createAIConversation(1, initialMessage);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/ai-conversations'] });
      setActiveConversationId(data.id);
      setIsCreatingNew(false);
      setNewConversationTopic("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleCreateNewConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversationTopic.trim()) {
      createConversationMutation.mutate(newConversationTopic);
    }
  };

  const renderMessageContent = (content: string) => {
    // Split content by newlines and render lists properly
    return content.split('\n').map((line, i) => {
      // Check if line starts with a list marker
      if (line.match(/^[-*]\s/)) {
        return <li key={i} className="ml-4">{line.replace(/^[-*]\s/, '')}</li>;
      }
      return <p key={i}>{line}</p>;
    });
  };

  // Sample conversations if none are returned from API
  const displayConversations = conversations?.length > 0 ? conversations : [
    {
      id: 1,
      userId: 1,
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
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      userId: 1,
      messages: [
        {
          role: "user",
          content: "I'm looking for nutrition advice for my family. We want to eat healthier but have two picky eaters."
        },
        {
          role: "assistant",
          content: "I'd be happy to help with family nutrition! Dealing with picky eaters can be challenging. Here are some strategies:\n\n1. Involve the picky eaters in meal planning and preparation\n2. Start with small changes rather than drastic ones\n3. Make healthy foods fun with creative presentations\n4. Try \"food bridges\" - modifications of foods they already like\n\nWould you like specific meal ideas that typically work well with picky eaters?"
        }
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ];

  const activeMessages = activeConversation?.messages || 
    (activeConversationId && displayConversations.find(c => c.id === activeConversationId)?.messages) || 
    [];

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
        <TopBar title="AI Health Coach" toggleMobileMenu={toggleMobileMenu} />
        <FamilyProfileSwitcher />

        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Conversations</CardTitle>
                    <Button 
                      size="sm" 
                      onClick={() => setIsCreatingNew(true)}
                      className={isCreatingNew ? "hidden" : ""}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Chat
                    </Button>
                  </div>
                  
                  {isCreatingNew && (
                    <form onSubmit={handleCreateNewConversation} className="mt-2">
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="What would you like to discuss?"
                          value={newConversationTopic}
                          onChange={(e) => setNewConversationTopic(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsCreatingNew(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            size="sm"
                            disabled={!newConversationTopic.trim() || createConversationMutation.isPending}
                          >
                            {createConversationMutation.isPending ? "Creating..." : "Start Chat"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoadingConversations ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {displayConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                            activeConversationId === conversation.id
                              ? "bg-primary/10 border border-primary/20"
                              : "border border-gray-200 dark:border-gray-700"
                          }`}
                          onClick={() => setActiveConversationId(conversation.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${
                              activeConversationId === conversation.id
                                ? "bg-primary/20"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}>
                              <MessageSquare className={`h-4 w-4 ${
                                activeConversationId === conversation.id
                                  ? "text-primary"
                                  : "text-gray-500 dark:text-gray-400"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {conversation.messages[0]?.content.split(' ').slice(0, 4).join(' ')}...
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatRelativeTime(conversation.updatedAt)}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Topics</CardTitle>
                  <CardDescription>
                    Suggested health topics to explore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      "Meal planning for a busy week",
                      "Home workout routines",
                      "Improving sleep quality",
                      "Family-friendly healthy recipes",
                      "Managing stress with exercise"
                    ].map((topic, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        className="w-full justify-start text-left"
                        onClick={() => {
                          setIsCreatingNew(true);
                          setNewConversationTopic(topic);
                        }}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Chat Area */}
            <div className="md:col-span-2">
              <Card className="h-[calc(100vh-12rem)]">
                <CardHeader className="pb-3">
                  <CardTitle>Health Coach Chat</CardTitle>
                  <CardDescription>
                    Get personalized advice and guidance for your fitness journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100%-8rem)]">
                  {isLoadingConversation ? (
                    <div className="flex-1 p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-20 w-2/3 rounded-md" />
                      </div>
                      <div className="flex items-start justify-end gap-3">
                        <Skeleton className="h-16 w-1/2 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-24 w-2/3 rounded-md" />
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-4">
                        {activeMessages.map((msg, index) => (
                          <div 
                            key={index} 
                            className={`flex items-start gap-3 ${
                              msg.role === "user" ? "justify-end" : ""
                            }`}
                          >
                            {msg.role === "assistant" && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                                <FileText size={16} />
                              </div>
                            )}
                            
                            <div 
                              className={`${
                                msg.role === "user"
                                  ? "rounded-lg rounded-tr-none bg-primary/10 p-3"
                                  : "rounded-lg rounded-tl-none bg-gray-100 dark:bg-gray-700 p-3"
                              }`}
                            >
                              {renderMessageContent(msg.content)}
                            </div>
                            
                            {msg.role === "user" && (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                <img
                                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                  alt="Sarah"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={messageEndRef} />
                      </div>
                    </ScrollArea>
                  )}
                  
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1"
                        disabled={!activeConversationId || sendMessageMutation.isPending}
                      />
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={!message.trim() || !activeConversationId || sendMessageMutation.isPending}
                      >
                        <Send size={16} />
                        <span className="sr-only">Send</span>
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
