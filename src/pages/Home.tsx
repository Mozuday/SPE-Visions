import Hero from "../components/sections/Hero";
import TechMarquee from "../components/sections/TechMarquee";
import ServicesPreview from "../components/sections/ServicesPreview";
import Process from "../components/sections/Process";
import PortfolioPreview from "../components/sections/PortfolioPreview";
import CoursesPreview from "../components/sections/CoursesPreview";
import InternshipPreview from "../components/sections/InternshipPreview";
import BlogPreview from "../components/sections/BlogPreview";
import CTA from "../components/sections/CTA";

const Home = () => {
  return (
    <main className="overflow-hidden">
      <Hero />
      <TechMarquee />
      <ServicesPreview />
      <Process />
      <PortfolioPreview />
      <CoursesPreview />
      <InternshipPreview />
      <BlogPreview />
      <CTA />
    </main>
  );
};

export default Home;