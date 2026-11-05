import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

import { COMPANY } from "../../constants/company";
import { footerNavigation } from "../../constants/navigation";
import { socialLinks } from "../../constants/social";

const linkClass =
  "text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white";

const Footer = () => {
  const phoneHref = COMPANY.phone
    ? `tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`
    : "";

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 font-mono text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                SP
              </span>

              <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                SPE <span className="text-slate-400">Visions</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">
              We build websites, apps and custom software, and train the next
              generation of developers through real projects.
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map(({ label, url, icon: Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-5">
            {footerNavigation.map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  {group.title}
                </h3>

                <nav className="mt-4 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <Link
                      key={`${group.title}-${link.label}`}
                      to={link.path}
                      className={linkClass}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Contact
            </h3>

            <div className="mt-4 space-y-3">
              {COMPANY.email && (
                <a
                  href={`mailto:${COMPANY.email}`}
                  className={`${linkClass} flex items-center gap-2.5 break-all`}
                >
                  <Mail size={15} className="shrink-0" />
                  {COMPANY.email}
                </a>
              )}

              {COMPANY.phone && (
                <a
                  href={phoneHref}
                  className={`${linkClass} flex items-center gap-2.5`}
                >
                  <Phone size={15} className="shrink-0" />
                  {COMPANY.phone}
                </a>
              )}

              <p className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <MapPin size={15} className="shrink-0" />
                India
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>

          <p className="font-mono">Built with care in India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
