import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  FolderKanban,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { supabase } from "../../lib/supabase";
import useAuth from "../../hooks/useAuth";

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  badgeKey?: "messages" | "applications";
};

const inbox: NavItem[] = [
  {
    name: "Messages",
    path: "/admin/messages",
    icon: MessageSquare,
    badgeKey: "messages",
  },
  {
    name: "Applications",
    path: "/admin/applications",
    icon: ClipboardList,
    badgeKey: "applications",
  },
];

const students: NavItem[] = [
  { name: "Students", path: "/admin/students", icon: Users },
  { name: "Enrolments", path: "/admin/enrollments", icon: KeyRound },
  { name: "Certificates", path: "/admin/certificates", icon: Award },
];

const management: NavItem[] = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Services", path: "/admin/services", icon: Wrench },
  { name: "Portfolio", path: "/admin/portfolio", icon: FolderKanban },
  { name: "Courses", path: "/admin/courses", icon: GraduationCap },
  { name: "Internships", path: "/admin/internships", icon: UserCheck },
  { name: "Jobs", path: "/admin/jobs", icon: BriefcaseBusiness },
  { name: "Blogs", path: "/admin/blogs", icon: FileText },
];

const linkClass = (isActive: boolean) =>
  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
  }`;

const sectionTitleClass =
  "mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400";

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const [badges, setBadges] = useState({ messages: 0, applications: 0 });

  /*
   * Refresh the unread counts whenever the admin navigates, so
   * the badges update after reading messages or reviewing applications.
   */
  useEffect(() => {
    let mounted = true;

    const loadBadges = async () => {
      const [messagesRes, applicationsRes] = await Promise.all([
        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("internship_applications")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      if (!mounted) return;

      setBadges({
        messages: messagesRes.count ?? 0,
        applications: applicationsRes.count ?? 0,
      });
    };

    void loadBadges();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  const renderLink = (item: NavItem) => {
    const Icon = item.icon;
    const count = item.badgeKey ? badges[item.badgeKey] : 0;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/admin"}
        onClick={onClose}
        className={({ isActive }) => linkClass(isActive)}
      >
        <Icon size={19} />
        <span className="flex-1">{item.name}</span>

        {count > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <NavLink
            to="/admin"
            onClick={onClose}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            SPE <span className="text-cyan-500">Visions</span>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <p className={sectionTitleClass}>Inbox</p>
          <div className="space-y-1">{inbox.map(renderLink)}</div>

          <p className={`${sectionTitleClass} mt-8`}>Students</p>
          <div className="space-y-1">{students.map(renderLink)}</div>

          <p className={`${sectionTitleClass} mt-8`}>Management</p>
          <div className="space-y-1">{management.map(renderLink)}</div>

          <div className="mt-8">
            <p className={sectionTitleClass}>System</p>

            <NavLink
              to="/admin/settings"
              onClick={onClose}
              className={({ isActive }) => linkClass(isActive)}
            >
              <Settings size={19} />
              Settings
            </NavLink>
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;