import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";

import {
  isGroup,
  navigationCta,
  primaryNavigation,
} from "../../constants/navigation";
import type { NavGroup } from "../../constants/navigation";
import useAuth from "../../hooks/useAuth";

import ThemeToggle from "./ThemeToggle";

const linkBase =
  "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150";

const linkIdle =
  "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white";

const linkActive = "text-slate-900 dark:text-white";

/* Dropdown for a group such as "Careers" */
const Dropdown = ({ group }: { group: NavGroup }) => {
  const { pathname } = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const active = group.items.some((item) => pathname.startsWith(item.path));

  // Close when the page changes
  useEffect(() => setOpen(false), [pathname]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${linkBase} inline-flex items-center gap-1 ${
          active ? linkActive : linkIdle
        }`}
      >
        {group.label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              role="menuitem"
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu when the page changes
  useEffect(() => setMenuOpen(false), [pathname]);

  const account = user
    ? { label: "My Courses", path: "/my-courses" }
    : { label: "Log in", path: "/login" };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 font-mono text-xs font-bold text-white transition-colors group-hover:bg-brand-600 dark:bg-white dark:text-slate-950 dark:group-hover:bg-brand-400">
            SP
          </span>

          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            SPE <span className="text-slate-400">Visions</span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {primaryNavigation.map((item) =>
            isGroup(item) ? (
              <Dropdown key={item.label} group={item} />
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {item.label}

                    {isActive && (
                      <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400" />
                    )}
                  </span>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />

          {!loading && (
            <Link to={account.path} className={`${linkBase} ${linkIdle}`}>
              {account.label}
            </Link>
          )}

          <Link
            to={navigationCta.path}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            {navigationCta.label}
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <nav className="mx-auto max-w-6xl space-y-1 px-5 py-4 sm:px-6" aria-label="Mobile">
            {primaryNavigation.map((item) =>
              isGroup(item) ? (
                <div key={item.label} className="pt-2">
                  <p className="px-3 pb-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    {item.label}
                  </p>

                  {item.items.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `block rounded-md px-3 py-2.5 text-sm font-medium ${
                          isActive
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                            : "text-slate-600 dark:text-slate-400"
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}

            <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              {!loading && (
                <Link
                  to={account.path}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400"
                >
                  {account.label}
                </Link>
              )}

              <Link
                to={navigationCta.path}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500"
              >
                {navigationCta.label}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;