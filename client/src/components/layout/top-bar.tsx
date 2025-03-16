import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  toggleMobileMenu: () => void;
}

export default function TopBar({ title, toggleMobileMenu }: TopBarProps) {
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 sm:px-6">
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <Menu size={20} />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Profile Switcher for mobile/tablet */}
      <div className="md:hidden flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Sarah"
            className="w-full h-full object-cover"
          />
        </div>
        <button className="text-sm font-medium flex items-center gap-1">
          Sarah
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-4">
        {/* Theme Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary"></span>
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
