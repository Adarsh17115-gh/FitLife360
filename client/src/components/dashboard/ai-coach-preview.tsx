import { useState, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { sendMessageToAICoach, createAIConversation } from "@/lib/ai";
import { FileText, Send } from "lucide-react";

export default function AICoachPreview() {
  const [message, setMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['/api/users/1/ai-conversations'],
  });
  
  // Get the most recent conversation or create a sample one
  const conversation = conversations?.length > 0 ? conversations[0] : {
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
    ]
  };
  
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (conversations?.length > 0) {
        return await sendMessageToAICoach(conversation.id, message);
      } else {
        return await createAIConversation(1, message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/ai-conversations'] });
      setMessage("");
      
      // Scroll to the bottom of the messages
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
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
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>AI Health Coach</CardTitle>
            <Link href="/ai-coach" className="text-sm font-medium text-primary hover:underline">
              View all conversations
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>AI Health Coach</CardTitle>
          <Link href="/ai-coach" className="text-sm font-medium text-primary hover:underline">
            View all conversations
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="mb-4 space-y-4 max-h-[300px] overflow-y-auto">
            {conversation.messages.map((msg, index) => (
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
          
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Ask something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send size={16} />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
