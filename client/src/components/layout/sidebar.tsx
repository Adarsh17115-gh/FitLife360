import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Trophy,
  MessageSquare,
  Users,
  Settings,
  ActivitySquare
} from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavLink = ({ href, icon, children }: NavLinkProps) => {
  const [isActive] = useRoute(href);
  
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center rounded-lg px-3 py-2 text-sm font-medium cursor-pointer",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-gray-900 dark:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
        )}
      >
        {icon}
        {children}
      </div>
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar dark:bg-gray-800 text-sidebar-foreground border-r border-gray-200 dark:border-gray-700 overflow-y-auto md:flex">
      <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ActivitySquare className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl">FitLife360</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4">
        <div className="space-y-1">
          <NavLink href="/dashboard" icon={<LayoutDashboard className="mr-2 h-4 w-4" />}>
            Dashboard
          </NavLink>
          <NavLink href="/workouts" icon={<ClipboardList className="mr-2 h-4 w-4" />}>
            Workouts
          </NavLink>
          <NavLink href="/nutrition" icon={<UtensilsCrossed className="mr-2 h-4 w-4" />}>
            Nutrition
          </NavLink>
          <NavLink href="/challenges" icon={<Trophy className="mr-2 h-4 w-4" />}>
            Challenges
          </NavLink>
          <NavLink href="/ai-coach" icon={<MessageSquare className="mr-2 h-4 w-4" />}>
            AI Coach
          </NavLink>
          <NavLink href="/family-profiles" icon={<Users className="mr-2 h-4 w-4" />}>
            Family Profiles
          </NavLink>
          <NavLink href="/settings" icon={<Settings className="mr-2 h-4 w-4" />}>
            Settings
          </NavLink>
        </div>
      </nav>

      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Sarah"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Sarah Taylor</p>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Family Admin
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
