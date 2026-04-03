import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import RoleBadge from './RoleBadge';
import { cn } from '../../lib/utils';
import { User as UserIcon } from 'lucide-react';

interface ProfileChipProps {
  className?: string;
  showDetails?: boolean;
}

const ProfileChip: React.FC<ProfileChipProps> = ({ className, showDetails = true }) => {
  const { profile } = useAuth();

  if (!profile) return null;

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className={cn("flex items-center gap-4 group", className)}>
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">{initials}</span>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
      </div>
      
      {showDetails && (
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors truncate max-w-[120px]">
              {profile.full_name}
            </span>
            <RoleBadge role={profile.role} className="scale-75 origin-left" />
          </div>
          <span className="text-[8px] font-medium text-on-surface-variant tracking-wider truncate max-w-[150px]">
            {profile.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfileChip;
