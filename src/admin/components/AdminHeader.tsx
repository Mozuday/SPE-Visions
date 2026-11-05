import { Bell, Menu, UserCircle } from "lucide-react";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          aria-label="Open admin menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Admin Panel
          </h1>

          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Manage SPE Visions
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800 sm:pl-4">
          <UserCircle
            size={34}
            className="text-slate-500 dark:text-slate-400"
          />

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Admin
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
