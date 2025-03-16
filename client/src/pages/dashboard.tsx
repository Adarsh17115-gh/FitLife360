import { Button } from "@/components/ui/button";
import HealthSummary from "@/components/dashboard/health-summary";
import ActivityChart from "@/components/dashboard/activity-chart";
import UpcomingActivities from "@/components/dashboard/upcoming-activities";
import FamilyProgress from "@/components/dashboard/family-progress";
import NutritionRecommendations from "@/components/dashboard/nutrition-recommendations";
import WorkoutRecommendations from "@/components/dashboard/workout-recommendations";
import { Link } from "wouter";
import { useState } from "react";
import { Share, Plus } from "lucide-react";

export default function Dashboard() {
  const [user] = useState({
    name: "Emma"
  });

  return (
    <>
      {/* Dashboard Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user.name}</p>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" className="hidden lg:inline-flex">
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Plus className="w-5 h-5 mr-2" />
            New Workout
          </Button>
          <Button asChild className="hidden lg:inline-flex">
            <Link href="/ai-coach">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Ask AI Coach
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto p-4 sm:px-6 lg:px-8">
        {/* Health Summary Section */}
        <HealthSummary />
        
        {/* Activity Trends & Upcoming Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Chart */}
          <ActivityChart />

          {/* Upcoming Workouts & Challenges */}
          <UpcomingActivities />
        </div>
        
        {/* Family Progress Section */}
        <FamilyProgress />

        {/* AI Nutrition & Workout Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Nutrition Recommendations */}
          <NutritionRecommendations />

          {/* AI Workout Recommendations */}
          <WorkoutRecommendations />
        </div>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 pt-6 pb-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} FitLife360. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link href="/settings" className="hover:text-gray-900 dark:hover:text-gray-200">Privacy Policy</Link>
            <Link href="/settings" className="hover:text-gray-900 dark:hover:text-gray-200">Terms of Use</Link>
            <Link href="/settings" className="hover:text-gray-900 dark:hover:text-gray-200">Contact Us</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
