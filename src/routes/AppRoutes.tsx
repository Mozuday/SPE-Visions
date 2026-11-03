import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import RequireAuth from "../components/auth/RequireAuth";
import ScrollToTop from "../components/layout/ScrollToTop";
import TitleManager from "../components/layout/TitleManager";

// Public pages
import Home from "../pages/Home";
import About from "../pages/company/About";
import Contact from "../pages/contact/Contact";
import Privacy from "../pages/legal/Privacy";
import NotFound from "../pages/NotFound";
import Terms from "../pages/legal/Terms";
import Refund from "../pages/legal/Refund";

import Courses from "../pages/courses/Courses";
import CourseDetails from "../pages/courses/CourseDetails";
import Certificate from "../pages/courses/Certificate";

import Internships from "../pages/internships/Internships";
import Apply from "../pages/internships/Apply";

import Jobs from "../pages/jobs/Jobs";

import Blogs from "../pages/blogs/Blogs";
import BlogDetails from "../pages/blogs/BlogDetails";

import Portfolio from "../pages/portfolio/Portfolio";
import Services from "../pages/services/Services";

// Student accounts
import Login from "../pages/account/Login";
import Signup from "../pages/account/Signup";
import ForgotPassword from "../pages/account/ForgotPassword";
import ResetPassword from "../pages/account/ResetPassword";
import MyCourses from "../pages/account/MyCourses";

// Loaded only when visited (keeps the public bundle small)
const AdminRoutes = lazy(() => import("../admin/routes/AdminRoutes"));
const Learn = lazy(() => import("../pages/courses/Learn"));

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
    <Loader2 size={26} className="animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <TitleManager />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC WEBSITE */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<Refund />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/certificate/:number" element={<Certificate />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/internships/apply" element={<Apply />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetails />} />

            {/* Student accounts */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<RequireAuth />}>
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/learn/:slug" element={<Learn />} />
            </Route>

            {/* Anything else */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;