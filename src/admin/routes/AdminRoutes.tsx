import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import AdminLogin from "../pages/AdminLogin";
import Dashboard from "../pages/Dashboard";
import Settings from "../pages/Settings";

import ManageServices from "../pages/services/ManageServices";
import ManageCourses from "../pages/courses/ManageCourses";
import ManageVideos from "../pages/courses/ManageVideos";
import ManageInternships from "../pages/internships/ManageInternships";
import ManageApplications from "../pages/internships/ManageApplications";
import ManageJobs from "../pages/jobs/ManageJobs";
import ManageBlogs from "../pages/blogs/ManageBlogs";
import ManagePortfolio from "../pages/portfolio/ManagePortfolio";
import ManageMessages from "../pages/inbox/ManageMessages";
import ManageStudents from "../pages/students/ManageStudents";
import ManageEnrollments from "../pages/students/ManageEnrollments";
import ManageCertificates from "../pages/students/ManageCertificates";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />

      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="messages" element={<ManageMessages />} />
        <Route path="applications" element={<ManageApplications />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="enrollments" element={<ManageEnrollments />} />
        <Route path="certificates" element={<ManageCertificates />} />
        <Route path="services" element={<ManageServices />} />
        <Route path="portfolio" element={<ManagePortfolio />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="courses/:courseId/videos" element={<ManageVideos />} />
        <Route path="internships" element={<ManageInternships />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="blogs" element={<ManageBlogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;