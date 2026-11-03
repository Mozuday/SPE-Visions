import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ScrollProgress from "../components/effects/ScrollProgress";
import SpotlightListener from "../components/effects/SpotlightListener";

/*
 * Each page renders its own <main>, so the layout must not.
 */
const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <ScrollProgress />
      <SpotlightListener />

      <Navbar />

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;