'use client';

/**
 * Renders a lucide icon by name.
 *
 * Education content stores its icon as a string (`"Award"`, `"Laptop"`) because
 * it comes from the database, where a component reference cannot live. Names
 * are resolved against an explicit map rather than a namespace import so the
 * bundle only carries the icons the module can actually use; an unknown name
 * falls back to `fallback` instead of rendering nothing.
 */

import React from 'react';
import {
  Award,
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Compass,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  Info,
  Landmark,
  Laptop,
  Library,
  Lightbulb,
  Mail,
  Map,
  MessageCircle,
  Newspaper,
  PenTool,
  Phone,
  School,
  ShieldCheck,
  Smartphone,
  Star,
  Target,
  Trophy,
  Tv,
  Users,
  Utensils,
  Video,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const EDUCATION_ICONS: Record<string, LucideIcon> = {
  Award,
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Compass,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  Info,
  Landmark,
  Laptop,
  Library,
  Lightbulb,
  Mail,
  Map,
  MessageCircle,
  Newspaper,
  PenTool,
  Phone,
  School,
  ShieldCheck,
  Smartphone,
  Star,
  Target,
  Trophy,
  Tv,
  Users,
  Utensils,
  Video,
  Wrench,
};

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  /** Icon name as stored on the record, e.g. "GraduationCap". */
  name?: string | null;
  /** Name to use when `name` is empty or unknown. Defaults to "BookOpen". */
  fallbackIcon?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  fallbackIcon = 'BookOpen',
  ...props
}) => {
  const Icon: LucideIcon =
    (name && EDUCATION_ICONS[name]) || EDUCATION_ICONS[fallbackIcon] || BookOpen;
  return <Icon {...props} />;
};
