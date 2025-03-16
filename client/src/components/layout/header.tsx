import { useTheme } from "@/components/ui/theme-provider";
import { Link } from "wouter";

interface HeaderProps {
  user?: {
    profileImage?: string;
    notificationCount?: number;
  };
}

export default function Header({ user = { notificationCount: 3 } }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-neutral-800 shadow-sm z-30 flex items-center px-4 justify-between">
      <div className="flex items-center">
        <span className="font-heading font-bold text-primary text-xl">FitLife<span className="text-secondary">360</span></span>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="text-neutral-500 dark:text-neutral-300"
        >
          <i className="fa-solid fa-moon dark:hidden"></i>
          <i className="fa-solid fa-sun hidden dark:block"></i>
        </button>
        <button className="relative">
          <i className="fa-solid fa-bell text-neutral-500 dark:text-neutral-300"></i>
          {user.notificationCount && user.notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {user.notificationCount}
            </span>
          )}
        </button>
        <Link href="/profile">
          <div className="rounded-full overflow-hidden h-8 w-8 border-2 border-primary">
            <img 
              src={user.profileImage || "https://ui-avatars.com/api/?name=User"} 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
