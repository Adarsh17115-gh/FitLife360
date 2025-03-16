import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { askAiCoach } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Bot, Send, Dumbbell, Apple, Scale, Calendar, SearchIcon } from "lucide-react";

type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export default function AiCoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your AI fitness coach. How can I help you today? You can ask me about workouts, nutrition, health goals, or anything fitness related.",
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [suggested, setSuggested] = useState<string[]>([
    "What's a good workout for beginners?",
    "How can I improve my nutrition?",
    "What's the best way to track my progress?",
    "How much protein should I eat daily?",
    "Can you recommend a post-workout meal?"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const askAiMutation = useMutation({
    mutationFn: (question: string) => askAiCoach(question),
    onSuccess: (data) => {
      addMessage({
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to get a response: ${error}`,
        variant: "destructive",
      });
      addMessage({
        id: Date.now().toString(),
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        role: 'assistant',
        timestamp: new Date(),
      });
    },
  });

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };
    addMessage(userMessage);
    
    // Clear input
    setInputValue('');
    
    // Send to AI
    askAiMutation.mutate(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: suggestion,
      role: 'user',
      timestamp: new Date(),
    };
    addMessage(userMessage);
    
    // Send to AI
    askAiMutation.mutate(suggestion);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Page Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold">AI Coach</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get personalized fitness and nutrition advice</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <SearchIcon className="h-4 w-4 mr-2" />
            Search History
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setMessages([{
              id: '1',
              content: "Hello! I'm your AI fitness coach. How can I help you today? You can ask me about workouts, nutrition, health goals, or anything fitness related.",
              role: 'assistant',
              timestamp: new Date(),
            }]);
          }}>
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 h-[calc(100vh-64px-66px)]">
        {/* Left Sidebar - Topics */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Topics</CardTitle>
              <CardDescription>Get specialized advice</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 p-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Workouts
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Apple className="mr-2 h-4 w-4" />
                  Nutrition
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Scale className="mr-2 h-4 w-4" />
                  Weight Loss
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Meal Planning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary-500" />
                <CardTitle>AI Fitness Coach</CardTitle>
              </div>
              <CardDescription>Powered by advanced AI technology</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <Tabs defaultValue="chat" className="h-full flex flex-col">
                <TabsList className="px-4 pt-2 border-b">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="workout">Workout Plans</TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition Plans</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col p-0 m-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`flex max-w-[80%] ${
                              message.role === 'assistant'
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                : 'bg-primary-500 text-white'
                            } rounded-lg px-4 py-3`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2 mb-1">
                                {message.role === 'assistant' ? (
                                  <Bot className="h-5 w-5" />
                                ) : (
                                  <UserCircle className="h-5 w-5" />
                                )}
                                <span className="text-xs opacity-70">
                                  {message.role === 'assistant' ? 'AI Coach' : 'You'} • {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  {/* Suggestions */}
                  {messages.length <= 2 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                      <h3 className="text-sm font-medium mb-2">Suggested questions</h3>
                      <div className="flex flex-wrap gap-2">
                        {suggested.map((suggestion, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            disabled={askAiMutation.isPending}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask your AI coach anything..."
                        disabled={askAiMutation.isPending}
                      />
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={!inputValue.trim() || askAiMutation.isPending}
                      >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                      </Button>
                    </form>
                  </div>
                </TabsContent>
                
                <TabsContent value="workout" className="p-6 text-center">
                  <div className="py-12">
                    <Dumbbell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium mb-2">Personalized Workout Plans</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-lg mx-auto">
                      Chat with the AI coach to get customized workout plans tailored to your fitness level and goals.
                    </p>
                    <Button>Start Creating a Plan</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="nutrition" className="p-6 text-center">
                  <div className="py-12">
                    <Apple className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium mb-2">Nutrition Guidance</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-lg mx-auto">
                      Get meal plans and nutritional advice customized to your dietary needs and preferences.
                    </p>
                    <Button>Get Nutrition Advice</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
