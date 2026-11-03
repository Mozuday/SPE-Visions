import type { LucideIcon } from "lucide-react";
import {
  Globe,
  Smartphone,
  Code2,
  Sparkles,
  Users,
  LifeBuoy,
  Zap,
  ShieldCheck,
  Cloud,
  Database,
  Server,
  Palette,
  Layers,
  GitBranch,
  Bug,
  Rocket,
  Settings,
  Briefcase,
  GraduationCap,
  BookOpen,
  Award,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Terminal,
  Cpu,
  Lock,
  BarChart3,
  Workflow,
  PenTool,
  Monitor,
  Boxes,
  Wrench,
  HelpCircle,
} from "lucide-react";

// Single source of truth: Supabase `icon` columns (services, etc.) store the
// KEY as a string (e.g. "globe"), and this map resolves it to the actual
// component. Keep keys lowercase, kebab-free — matches admin <select> values.
export const iconMap: Record<string, LucideIcon> = {
  globe: Globe,
  smartphone: Smartphone,
  code: Code2,
  sparkles: Sparkles,
  users: Users,
  support: LifeBuoy,
  zap: Zap,
  shield: ShieldCheck,
  cloud: Cloud,
  database: Database,
  server: Server,
  palette: Palette,
  layers: Layers,
  git: GitBranch,
  bug: Bug,
  rocket: Rocket,
  settings: Settings,
  briefcase: Briefcase,
  graduation: GraduationCap,
  book: BookOpen,
  award: Award,
  message: MessageSquare,
  mail: Mail,
  phone: Phone,
  location: MapPin,
  terminal: Terminal,
  cpu: Cpu,
  lock: Lock,
  chart: BarChart3,
  workflow: Workflow,
  design: PenTool,
  monitor: Monitor,
  boxes: Boxes,
  wrench: Wrench,
};

// Used by Services.tsx, ManageServices.tsx — always falls back instead of
// crashing if admin typed/selected an icon key that doesn't exist (yet).
export const getIcon = (key: string | null | undefined): LucideIcon => {
  if (!key) return HelpCircle;
  return iconMap[key.toLowerCase()] ?? HelpCircle;
};

// Drives the icon-picker dropdown in ManageServices.tsx — label is what the
// admin sees, value is what gets saved to the `icon` column.
export const iconOptions: { value: string; label: string }[] = Object.keys(iconMap).map(
  (key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  })
);