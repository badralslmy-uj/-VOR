import React from 'react';
import { HappyFace } from './icons/avatar/HappyFace';
import { SadFace } from './icons/avatar/SadFace';
import { AngryFace } from './icons/avatar/AngryFace';
import { LaughingFace } from './icons/avatar/LaughingFace';
import { WinkFace } from './icons/avatar/WinkFace';
import { SurprisedFace } from './icons/avatar/SurprisedFace';
import { NeutralFace } from './icons/avatar/NeutralFace';
import { ThinkingFace } from './icons/avatar/ThinkingFace';
import { CoolFace } from './icons/avatar/CoolFace';
import { CryingFace } from './icons/avatar/CryingFace';
import { StarStruckFace } from './icons/avatar/StarStruckFace';
import { SleepingFace } from './icons/avatar/SleepingFace';

export const avatarFaces: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  happy: HappyFace,
  laughing: LaughingFace,
  wink: WinkFace,
  starStruck: StarStruckFace,
  cool: CoolFace,
  surprised: SurprisedFace,
  thinking: ThinkingFace,
  neutral: NeutralFace,
  sad: SadFace,
  crying: CryingFace,
  angry: AngryFace,
  sleeping: SleepingFace,
};

export const avatarColors = [
    '#8b5cf6', // purple-500
    '#6366f1', // indigo-500
    '#3b82f6', // blue-500
    '#06b6d4', // cyan-500
    '#14b8a6', // teal-500
    '#22c55e', // green-500
    '#eab308', // yellow-500
    '#f97316', // orange-500
    '#ef4444', // red-500
    '#ec4899', // pink-500
];

interface SelectableAvatarProps {
  avatarId?: string; // e.g., "happy_#8b5cf6"
  className?: string;
}

export const defaultAvatarId = 'happy_#8b5cf6';

export const SelectableAvatar: React.FC<SelectableAvatarProps> = ({ avatarId, className }) => {
  const [faceKey, color] = (avatarId || defaultAvatarId).split('_');
  const FaceComponent = avatarFaces[faceKey] || avatarFaces.happy;
  const bgColor = color || '#8b5cf6';

  return (
    <div
      className={`w-full h-full rounded-lg flex items-center justify-center ${className || ''}`}
      style={{ backgroundColor: bgColor }}
    >
      <FaceComponent className="w-3/4 h-3/4 text-black/70" />
    </div>
  );
};
