import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, "MMM d, yyyy");
}

export function formatTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, "h:mm a");
}

export function formatDateTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}.${mins < 10 ? '0' : ''}${mins}`;
}

export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function calculateProgress(current: number, target: number): number {
  return Math.round((current / target) * 100);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getWeekDates(): Date[] {
  // Get current date
  const now = new Date();
  
  // Find the current day of the week (0-6, where 0 is Sunday)
  const currentDay = now.getDay();
  
  // Calculate how many days to go back to Monday
  // If today is Sunday (0), we need to go back 6 days
  // If today is Monday (1), we go back 0 days, etc.
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  // Create array to hold the 7 dates
  const weekDates: Date[] = [];
  
  // Start with Monday
  for (let i = 0; i < 7; i++) {
    // Create a new date object for each day to avoid reference issues
    const date = new Date(now);
    
    // Set date to Monday (today - daysToMonday) + current iteration
    // This ensures we start with Monday and go forward
    date.setDate(now.getDate() - daysToMonday + i);
    
    // Reset time to midnight
    date.setHours(0, 0, 0, 0);
    
    // Add to week dates array
    weekDates.push(date);
  }
  
  return weekDates;
}

export function getDayName(date: Date, short = false): string {
  return format(date, short ? 'EEE' : 'EEEE');
}

export function getCurrentUser() {
  // In a real app, this would get the user from a context or global state
  // For now, we'll just return a dummy user
  return {
    id: 1,
    name: "Sarah Taylor",
    username: "sarah",
    email: "sarah@example.com",
    role: "admin",
    familyId: 1,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };
}

export function getFamilyMembers() {
  // In a real app, this would get data from the API
  return [
    {
      id: 1,
      name: "Sarah Taylor",
      username: "sarah",
      email: "sarah@example.com",
      role: "admin",
      familyId: 1,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 2,
      name: "Mike Taylor",
      username: "mike",
      email: "mike@example.com",
      role: "member",
      familyId: 1,
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 3,
      name: "Amy Taylor",
      username: "amy",
      email: "amy@example.com",
      role: "member",
      familyId: 1,
      avatar: "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 4,
      name: "Jake Taylor",
      username: "jake",
      email: "jake@example.com",
      role: "member",
      familyId: 1,
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];
}
