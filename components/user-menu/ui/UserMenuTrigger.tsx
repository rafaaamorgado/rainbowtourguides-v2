import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserMenuTriggerProps {
  displayName: string;
  initials: string;
  avatarUrl: string | null;
}

export function UserMenuTrigger({
  displayName,
  initials,
  avatarUrl,
}: UserMenuTriggerProps) {
  return (
    <Avatar className="h-9 w-9">
      <AvatarImage src={avatarUrl || undefined} alt={displayName} />
      <AvatarFallback className="bg-brand text-white text-sm font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
