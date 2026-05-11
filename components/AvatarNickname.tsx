interface AvatarNicknameProps {
  emoji: string | null;
  nickname: string | null;
}

export function AvatarNickname({ emoji, nickname }: AvatarNicknameProps) {
  if (!emoji && !nickname) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      {emoji && <span>{emoji}</span>}
      {nickname && <span>{nickname}</span>}
    </span>
  );
}
