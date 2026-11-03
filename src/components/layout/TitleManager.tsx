import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { COMPANY } from "../../constants/company";

type Meta = { title: string; description: string };

const defaults: Meta = {
  title: `${COMPANY.name} | Websites, Apps, Software & Tech Training`,
  description:
    "We build websites, apps and custom software, and train developers through real projects, courses and internships.",
};

/*
 * Matched by the start of the path, most specific first.
 */
const routes: [string, Meta][] = [
  ["/services", { title: "Services", description: "Website, app and custom software development, bug fixing and technical consulting." }],
  ["/portfolio", { title: "Portfolio", description: "Projects and digital products we have designed and built." }],
  ["/courses", { title: "Courses", description: "Project-based technology courses with a verifiable certificate." }],
  ["/learn", { title: "Learn", description: "Your course." }],
  ["/certificate", { title: "Verify Certificate", description: "Check that a certificate is genuine." }],
  ["/internships/apply", { title: "Apply for an Internship", description: "Apply for a hands-on internship." }],
  ["/internships", { title: "Internships", description: "Practical internship programs for students and freshers." }],
  ["/jobs", { title: "Jobs", description: "Fresh technology job openings." }],
  ["/blogs", { title: "Blog", description: "Articles on web development, software and building digital products." }],
  ["/about", { title: "About", description: `About ${COMPANY.name}.` }],
  ["/contact", { title: "Contact", description: "Tell us about your project, question or idea." }],
  ["/privacy", { title: "Privacy Policy", description: "How we collect and use your information." }],
  ["/terms", { title: "Terms of Service", description: "The terms for using our website and courses." }],
  ["/refund-policy", { title: "Refund & Cancellation Policy", description: "When and how refunds work for paid courses." }],
  ["/login", { title: "Log in", description: "Log in to your account." }],
  ["/signup", { title: "Create an account", description: "Sign up to learn with us." }],
  ["/my-courses", { title: "My Courses", description: "Your enrolled courses." }],
];

const TitleManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // The admin panel manages its own title
    if (pathname.startsWith("/admin")) {
      document.title = `Admin | ${COMPANY.name}`;
      return;
    }

    const match = routes.find(([prefix]) => pathname.startsWith(prefix));

    document.title = match
      ? `${match[1].title} | ${COMPANY.name}`
      : defaults.title;

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", match ? match[1].description : defaults.description);
  }, [pathname]);

  return null;
};

export default TitleManager;