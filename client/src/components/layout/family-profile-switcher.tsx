import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFamilyMembers } from "@/lib/utils";

export default function FamilyProfileSwitcher() {
  const [activeUser, setActiveUser] = useState(1); // ID of the active user
  const familyMembers = getFamilyMembers();

  return (
    <div className="flex items-center gap-2 overflow-x-auto p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Family Members:</span>
      </div>
      
      {familyMembers.map((member) => (
        <button
          key={member.id}
          className={cn(
            "flex items-center justify-center rounded-full p-0.5",
            member.id === activeUser ? "ring-2 ring-primary" : ""
          )}
          onClick={() => setActiveUser(member.id)}
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="sr-only">{member.name} {member.id === activeUser ? "(Active)" : ""}</span>
        </button>
      ))}
      
      <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600">
        <Plus size={16} />
        <span className="sr-only">Add family member</span>
      </button>
    </div>
  );
}
