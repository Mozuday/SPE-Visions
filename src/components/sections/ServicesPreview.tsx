import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import type { Tables } from "../../types/supabase";
import { getIcon } from "../../utils/iconMap";

import Section from "../ui/Section";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../effects/Reveal";

type Service = Tables<"services">;

const ServicesPreview = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_published", true)
        .order("order_index", { ascending: true })
        .limit(6);

      if (!mounted) return;

      if (error) {
        console.error("Failed to load services preview:", error);
      } else {
        setServices(data ?? []);
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && services.length === 0) return null;

  return (
    <Section tone="muted">
      <SectionHeading
        index="01"
        eyebrow="Services"
        title="Digital solutions built around your business"
        description="From websites and apps to custom software and technical support, we build reliable products that grow with you."
        action={
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            All services
            <ArrowRight size={15} />
          </Link>
        }
      />

      {loading ? (
        <div className="mt-12 flex justify-center text-slate-500">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : (
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = getIcon(service.icon);

            return (
              <Reveal key={service.id} delay={Math.min(index, 5) * 70}>
                <div
                  data-spotlight
                  className="spotlight group h-full rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-brand-600 transition-all duration-200 group-hover:border-brand-400 group-hover:bg-brand-50 dark:border-slate-700 dark:text-brand-400 dark:group-hover:bg-brand-500/10">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                    {service.title}
                  </h3>

                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {service.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
};

export default ServicesPreview;