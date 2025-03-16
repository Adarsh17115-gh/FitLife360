import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  Home,
  UserCircle,
  Dumbbell,
  UtensilsCrossed,
  Target,
  MessageSquareText,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Nutrition', href: '/nutrition', icon: UtensilsCrossed },
    { name: 'Challenges', href: '/challenges', icon: Target },
    { name: 'AI Coach', href: '/ai-coach', icon: MessageSquareText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className={`md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:flex flex-col hidden h-screen ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center text-white font-bold text-lg">F</div>
          <h1 className="ml-2 text-xl font-bold">FitLife360</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={`flex items-center px-3 py-2 rounded-md ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}>
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img 
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"} 
              alt={`${user.displayName}'s avatar`} 
              className="w-8 h-8 rounded-full" 
            />
            <div className="ml-3">
              <p className="text-sm font-medium">{user.displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.isAdmin ? 'Family Admin' : 'Family Member'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-2 justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}
    </aside>
  );
}
