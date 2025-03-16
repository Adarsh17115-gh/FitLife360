import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';

type FamilyMember = {
  id: number;
  userId: number;
  familyId: number;
  relationshipType: string;
  user: {
    id: number;
    displayName: string;
    avatar?: string;
  };
};

interface UserProfileSelectorProps {
  onSelect: (userId: number) => void;
  selectedUserId: number;
  className?: string;
}

export function UserProfileSelector({ onSelect, selectedUserId, className = '' }: UserProfileSelectorProps) {
  // Fetch family members for the current user's family
  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ['/api/families/1/members'], // Assuming the user belongs to family with ID 1
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0] as string);
      if (!response.ok) {
        throw new Error('Failed to fetch family members');
      }
      return response.json() as Promise<FamilyMember[]>;
    },
  });

  const handleSelect = (userId: number) => {
    onSelect(userId);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className={`mb-6 ${className}`}>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse flex flex-col items-center justify-center p-3 rounded-lg bg-gray-200 dark:bg-gray-700 min-w-[80px]">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mb-1"></div>
              <div className="h-3 w-14 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-sm font-medium mb-2">Family Member</label>
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {familyMembers?.map((member) => (
          <button
            key={member.userId}
            className={`flex flex-col items-center justify-center p-3 rounded-lg ${
              selectedUserId === member.userId
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-2 border-primary-500'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            } min-w-[80px]`}
            onClick={() => handleSelect(member.userId)}
          >
            <Avatar className="w-10 h-10 mb-1">
              <AvatarImage src={member.user.avatar} alt={member.user.displayName} />
              <AvatarFallback>{getInitials(member.user.displayName)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{member.user.displayName.split(' ')[0]}</span>
          </button>
        ))}
        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-dashed min-w-[80px]">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-1">
            <PlusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-xs font-medium">Add</span>
        </button>
      </div>
    </div>
  );
}
