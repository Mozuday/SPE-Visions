import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import { COMPANY } from "../../constants/company";

import Blueprint from "../ui/Blueprint";
import Container from "../ui/Container";
import Reveal from "../effects/Reveal";

const CTA = () => {
  const phoneHref = COMPANY.phone
    ? `tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`
    : "";

  const rowClass =
    "flex items-center gap-3 text-sm text-slate-300 transition-colors hover:text-white";

  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-6 py-14 sm:px-12 md:py-16">
            <Blueprint />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-brand-400">
                  Start a project
                </p>

                <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                  Ready to turn your next big idea into a working product?
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-slate-400">
                  Whether you're launching a startup, improving existing
                  software or building something new, we'll help you find a
                  practical technical approach.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
                  >
                    Start your project
                    <ArrowUpRight size={16} />
                  </Link>

                  <Link
                    to="/services"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800"
                  >
                    Explore services
                  </Link>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-800 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                  Or reach us directly
                </p>

                {COMPANY.email && (
                  <a href={`mailto:${COMPANY.email}`} className={`${rowClass} break-all`}>
                    <Mail size={16} className="shrink-0" />
                    {COMPANY.email}
                  </a>
                )}

                {COMPANY.phone && (
                  <a href={phoneHref} className={rowClass}>
                    <Phone size={16} className="shrink-0" />
                    {COMPANY.phone}
                  </a>
                )}

                {COMPANY.whatsapp && (
                  <a
                    href={COMPANY.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClass}
                  >
                    <MessageCircle size={16} className="shrink-0" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};

export default CTA;