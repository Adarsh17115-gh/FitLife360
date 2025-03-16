import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { useQuery } from "@tanstack/react-query";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Sample user data - in a real app, this would come from an API call
  const { data: user } = useQuery({
    queryKey: ["/api/users/1"],
    queryFn: () => ({
      id: 1,
      name: "Sarah Johnson",
      role: "Family Admin",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop",
      notificationCount: 3
    }),
    staleTime: Infinity,
  });

  return (
    <div className="bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50 min-h-screen flex flex-col">
      <Header user={user} />
      <Sidebar user={user} />
      
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0">
        {children}
      </main>
      
      <MobileNav />
    </div>
  );
}
