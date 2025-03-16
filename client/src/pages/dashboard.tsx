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
        <TopBar title="Dashboard" toggleMobileMenu={toggleMobileMenu} />
        <FamilyProfileSwitcher />

        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          {/* Health Summary */}
          <HealthSummary />

          {/* Weekly Activity Chart */}
          <WeeklyActivityChart />

          {/* Two Column Layout for Family Challenges and Nutrition */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FamilyChallenges />
            <NutritionCard />
          </div>

          {/* Upcoming Workouts */}
          <UpcomingWorkouts />

          {/* AI Coach Preview */}
          <AICoachPreview />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
