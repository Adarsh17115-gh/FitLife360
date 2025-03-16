import { useState } from "react";
import HealthSummary from "@/components/dashboard/health-summary";
import WeeklyActivityChart from "@/components/dashboard/weekly-activity-chart";
import FamilyChallenges from "@/components/dashboard/family-challenges";
import NutritionCard from "@/components/dashboard/nutrition-card";
import UpcomingWorkouts from "@/components/dashboard/upcoming-workouts";
import AICoachPreview from "@/components/dashboard/ai-coach-preview";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopBar from "@/components/layout/top-bar";
import FamilyProfileSwitcher from "@/components/layout/family-profile-switcher";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar - conditionally rendered */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
          <aside 
            className="fixed inset-y-0 left-0 w-64 z-50 bg-sidebar dark:bg-gray-800 text-sidebar-foreground overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64">
        <TopBar title="Dashboard" toggleMobileMenu={toggleMobileMenu} />
        <FamilyProfileSwitcher />

        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">Welcome to FitLife360!</h2>
            <p className="text-gray-600 dark:text-gray-300">Track your health, challenge your family, and achieve your fitness goals together.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Start Workout
              </button>
              <button className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary border border-primary font-medium py-2 px-4 rounded-md transition-colors">
                Log Nutrition
              </button>
            </div>
          </div>
          
          {/* Daily Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Today's Overview</h3>
            <HealthSummary />
          </div>

          {/* Weekly Activity Chart with better title */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Activity Trends</h3>
            <WeeklyActivityChart />
          </div>

          {/* Two Column Layout for Family Challenges and Nutrition */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Family Challenges</h3>
              <FamilyChallenges />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Nutrition Tracking</h3>
              <NutritionCard />
            </div>
          </div>

          {/* Upcoming Workouts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Upcoming Workouts</h3>
            <UpcomingWorkouts />
          </div>

          {/* AI Coach Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">AI Fitness Coach</h3>
            <AICoachPreview />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
