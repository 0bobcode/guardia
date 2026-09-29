import { Avatar } from "@/components/Avatar";

export function StudentAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return <Avatar name={name} size={size} />;
}
