import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Menu, X, Home, Dumbbell, UtensilsCrossed, Target, UserCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileHeader() {
  const { user } = useAuth();
  
  return (
    <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center text-white font-bold text-lg">F</div>
          <h1 className="ml-2 text-xl font-bold">FitLife360</h1>
        </div>
        <MobileMenu />
      </div>
    </div>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Nutrition', href: '/nutrition', icon: UtensilsCrossed },
    { name: 'Challenges', href: '/challenges', icon: Target },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center text-white font-bold text-lg">F</div>
              <h1 className="ml-2 text-xl font-bold">FitLife360</h1>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          {user && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <img 
                  src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"} 
                  alt={`${user.displayName}'s avatar`} 
                  className="w-10 h-10 rounded-full" 
                />
                <div className="ml-3">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.isAdmin ? 'Family Admin' : 'Family Member'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-3">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a 
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
              <Link href="/ai-coach">
                <a 
                  className="flex items-center px-3 py-2 mb-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setOpen(false)}
                >
                  <MessageSquareIcon className="h-5 w-5 mr-3" />
                  AI Coach
                </a>
              </Link>
              <Link href="/settings">
                <a 
                  className="flex items-center px-3 py-2 mb-3 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setOpen(false)}
                >
                  <SettingsIcon className="h-5 w-5 mr-3" />
                  Settings
                </a>
              </Link>
              
              {user && (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <LogOutIcon className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              )}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageSquareIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogOutIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function MobileNavigation() {
  const [location] = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Nutrition', href: '/nutrition', icon: UtensilsCrossed },
    { name: 'Challenges', href: '/challenges', icon: Target },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-10">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a className={`flex flex-col items-center p-2 ${
                isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                <item.icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
