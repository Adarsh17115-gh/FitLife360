import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  MessageSquare
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavItem = ({ href, icon, children }: NavItemProps) => {
  const [isActive] = useRoute(href);
  
  return (
    <Link href={href}>
      <div className={cn(
        "flex flex-col items-center py-3 px-4 cursor-pointer",
        isActive 
          ? "text-primary" 
          : "text-gray-500 dark:text-gray-400"
      )}>
        {icon}
        <span className="mt-1 text-xs">{children}</span>
      </div>
    </Link>
  );
};

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 md:hidden">
      <div className="flex items-center justify-around">
        <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />}>
          Dashboard
        </NavItem>
        <NavItem href="/workouts" icon={<ClipboardList size={20} />}>
          Workouts
        </NavItem>
        <NavItem href="/nutrition" icon={<UtensilsCrossed size={20} />}>
          Nutrition
        </NavItem>
        <NavItem href="/ai-coach" icon={<MessageSquare size={20} />}>
          AI Coach
        </NavItem>
      </div>
    </nav>
  );
}
