import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { formatRelativeTime } from "../../utils/formatters";
import { statusColorMap } from "../../utils/helpers";
import type { StatusVariant } from "../../utils/helpers";

type Totals = {
  published: number;
  total: number;
};

type Stats = {
  services: Totals;
  portfolio: Totals;
  courses: Totals;
  internships: Totals;
  jobs: Totals;
  blogs: Totals;
  users: number;
  newMessages: number;
  pendingApplications: number;
};

type RecentMessage = {
  id: string;
  name: string;
  subject: string | null;
  status: StatusVariant;
  created_at: string;
};

type RecentApplication = {
  id: string;
  full_name: string;
  status: StatusVariant;
  created_at: string;
  internships: { title: string } | null;
};

type ContentTable =
  | "services"
  | "portfolio_projects"
  | "courses"
  | "internships"
  | "jobs"
  | "blogs";

const countRows = (table: ContentTable, publishedOnly: boolean) => {
  const query = supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  return publishedOnly ? query.eq("is_published", true) : query;
};

const contentCards: {
  key: keyof Pick<
    Stats,
    "services" | "portfolio" | "courses" | "internships" | "jobs" | "blogs"
  >;
  title: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { key: "services", title: "Services", href: "/admin/services", icon: Wrench },
  {
    key: "portfolio",
    title: "Portfolio",
    href: "/admin/portfolio",
    icon: FolderKanban,
  },
  {
    key: "courses",
    title: "Courses",
    href: "/admin/courses",
    icon: GraduationCap,
  },
  {
    key: "internships",
    title: "Internships",
    href: "/admin/internships",
    icon: UserCheck,
  },
  { key: "jobs", title: "Jobs", href: "/admin/jobs", icon: BriefcaseBusiness },
  { key: "blogs", title: "Blogs", href: "/admin/blogs", icon: FileText },
];

const StatusBadge = ({ status }: { status: StatusVariant }) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColorMap[status]}`}
  >
    {status}
  </span>
);

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [messages, setMessages] = useState<RecentMessage[]>([]);
  const [applications, setApplications] = useState<RecentApplication[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const tables: ContentTable[] = [
          "services",
          "portfolio_projects",
          "courses",
          "internships",
          "jobs",
          "blogs",
        ];

        const [
          published,
          totals,
          usersRes,
          newMessagesRes,
          pendingRes,
          recentMessagesRes,
          recentApplicationsRes,
        ] = await Promise.all([
          Promise.all(tables.map((table) => countRows(table, true))),
          Promise.all(tables.map((table) => countRows(table, false))),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase
            .from("contact_messages")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
          supabase
            .from("internship_applications")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("contact_messages")
            .select("id, name, subject, status, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("internship_applications")
            .select("id, full_name, status, created_at, internships(title)")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        /*
         * Any failed query means the numbers can't be trusted,
         * so surface it instead of silently showing zeros.
         */
        const failed = [
          ...published,
          ...totals,
          usersRes,
          newMessagesRes,
          pendingRes,
          recentMessagesRes,
          recentApplicationsRes,
        ].find((result) => result.error);

        if (failed?.error) {
          throw failed.error;
        }

        if (!mounted) return;

        const totalsFor = (index: number): Totals => ({
          published: published[index].count ?? 0,
          total: totals[index].count ?? 0,
        });

        setStats({
          services: totalsFor(0),
          portfolio: totalsFor(1),
          courses: totalsFor(2),
          internships: totalsFor(3),
          jobs: totalsFor(4),
          blogs: totalsFor(5),
          users: usersRes.count ?? 0,
          newMessages: newMessagesRes.count ?? 0,
          pendingApplications: pendingRes.count ?? 0,
        });

        setMessages((recentMessagesRes.data ?? []) as RecentMessage[]);
        setApplications(
          (recentApplicationsRes.data ?? []) as unknown as RecentApplication[]
        );
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        if (mounted) {
          setError("Couldn't load live stats. Please refresh and try again.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
          <LayoutDashboard size={22} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back. Here's an overview of SPE Visions.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Needs attention */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Link
          to="/admin/messages"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                New messages
              </p>

              <p className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
                {stats?.newMessages ?? "—"}
              </p>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {stats && stats.newMessages > 0
                  ? "Waiting for a reply"
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
              <MessageSquare size={21} />
            </div>
          </div>
        </Link>

        <Link
          to="/admin/applications"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pending applications
              </p>

              <p className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">
                {stats?.pendingApplications ?? "—"}
              </p>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {stats && stats.pendingApplications > 0
                  ? "Waiting for review"
                  : "Nothing to review"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ClipboardList size={21} />
            </div>
          </div>
        </Link>
      </div>

      {/* Content */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Content
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contentCards.map((card) => {
            const Icon = card.icon;
            const totals = stats?.[card.key];

            return (
              <Link
                key={card.key}
                to={card.href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-cyan-50 group-hover:text-cyan-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-cyan-500/10 dark:group-hover:text-cyan-400">
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {totals ? totals.published : "—"}
                    <span className="ml-1 text-sm font-medium text-slate-400">
                      {totals ? `/ ${totals.total} published` : ""}
                    </span>
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-500"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Messages */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent messages
            </h2>

            <Link
              to="/admin/messages"
              className="text-sm font-semibold text-blue-600 hover:underline dark:text-cyan-400"
            >
              View all
            </Link>
          </div>

          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No messages yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {messages.map((message) => (
                <Link
                  key={message.id}
                  to="/admin/messages"
                  className="flex items-center justify-between gap-4 py-3.5 transition hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p
                      className={`truncate text-slate-900 dark:text-white ${
                        message.status === "new" ? "font-bold" : "font-medium"
                      }`}
                    >
                      {message.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {message.subject || "No subject"} ·{" "}
                      {formatRelativeTime(message.created_at)}
                    </p>
                  </div>

                  <StatusBadge status={message.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Applications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent applications
            </h2>

            <Link
              to="/admin/applications"
              className="text-sm font-semibold text-blue-600 hover:underline dark:text-cyan-400"
            >
              View all
            </Link>
          </div>

          {applications.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No applications yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.map((application) => (
                <Link
                  key={application.id}
                  to="/admin/applications"
                  className="flex items-center justify-between gap-4 py-3.5 transition hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-white">
                      {application.full_name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {application.internships?.title ?? "Deleted internship"} ·{" "}
                      {formatRelativeTime(application.created_at)}
                    </p>
                  </div>

                  <StatusBadge status={application.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Platform */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Platform
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-blue-600 dark:text-blue-400" />

              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Registered accounts
              </span>
            </div>

            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {stats?.users ?? "—"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Database
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                error
                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  : "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
              }`}
            >
              {error ? "Problem detected" : "Connected"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;