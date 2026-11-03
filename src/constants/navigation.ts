export type NavItem = {
  label: string;
  path: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type PrimaryNavItem = NavItem | NavGroup;

export const isGroup = (item: PrimaryNavItem): item is NavGroup =>
  "items" in item;

/*
 * Main navigation. A group becomes a dropdown on desktop.
 */
export const primaryNavigation: PrimaryNavItem[] = [
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Courses", path: "/courses" },
  {
    label: "Careers",
    items: [
      { label: "Internships", path: "/internships" },
      { label: "Jobs", path: "/jobs" },
    ],
  },
  { label: "Blog", path: "/blogs" },
  { label: "About", path: "/about" },
];

/*
 * Flat list, kept for any code that still imports it.
 */
export const navigation: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Courses", path: "/courses" },
  { label: "Internships", path: "/internships" },
  { label: "Jobs", path: "/jobs" },
  { label: "Blog", path: "/blogs" },
  { label: "About", path: "/about" },
];

export const navigationCta: NavItem = {
  label: "Start a Project",
  path: "/contact",
};

export const footerNavigation: { title: string; links: NavItem[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Portfolio", path: "/portfolio" },
      { label: "Blog", path: "/blogs" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "All Services", path: "/services" },
      { label: "Request a Quote", path: "/contact" },
    ],
  },
  {
    title: "Learn & Work",
    links: [
      { label: "Courses", path: "/courses" },
      { label: "Verify Certificate", path: "/certificate" },
      { label: "Internships", path: "/internships" },
      { label: "Jobs", path: "/jobs" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
      { label: "Refund Policy", path: "/refund-policy" },
    ],
  },
];