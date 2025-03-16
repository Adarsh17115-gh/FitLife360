import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import FamilyProfiles from "@/pages/family-profiles";
import HealthMetrics from "@/pages/health-metrics";
import Workouts from "@/pages/workouts";
import Nutrition from "@/pages/nutrition";
import Challenges from "@/pages/challenges";
import AiCoach from "@/pages/ai-coach";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-full flex-col lg:flex-row">
        <Sidebar />
        <MobileNav />
        
        <main className="flex-1 lg:pl-64">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/family-profiles" component={FamilyProfiles} />
            <Route path="/health-metrics" component={HealthMetrics} />
            <Route path="/workouts" component={Workouts} />
            <Route path="/nutrition" component={Nutrition} />
            <Route path="/challenges" component={Challenges} />
            <Route path="/ai-coach" component={AiCoach} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
