import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import Dashboard from "@/pages/dashboard";
import Workouts from "@/pages/workouts";
import Nutrition from "@/pages/nutrition";
import Challenges from "@/pages/challenges";
import AICoach from "@/pages/ai-coach";
import FamilyProfiles from "@/pages/family-profiles";
import Settings from "@/pages/settings";

function Router() {
  // Initialize theme from localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/nutrition" component={Nutrition} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/ai-coach" component={AICoach} />
      <Route path="/family-profiles" component={FamilyProfiles} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
