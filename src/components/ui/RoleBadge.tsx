import React from 'react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  const isAdmin = role === 'admin';
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border",
      isAdmin 
        ? "bg-secondary/10 border-secondary/30 text-secondary shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
        : "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(0,163,153,0.1)]",
      className
    )}>
      {isAdmin ? 'Elite Tier Admin' : 'Elite Member'}
    </span>
  );
};

export default RoleBadge;
