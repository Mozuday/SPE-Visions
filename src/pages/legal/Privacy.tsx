import { Link } from "react-router-dom";

import { COMPANY } from "../../constants/company";

import LegalLayout from "../../components/legal/LegalLayout";
import type { LegalSection } from "../../components/legal/LegalLayout";

/*
 * Update this date whenever the policy text changes.
 */
const LAST_UPDATED = "October 2026";

const sections: LegalSection[] = [
  {
    title: "1. Who we are",
    paragraphs: [
      `${COMPANY.name} ("we", "us") operates this website, which offers technology services, courses and internship programs. This policy explains what personal information we collect and how we use it.`,
    ],
  },
  {
    title: "2. Information we collect",
    paragraphs: ["We only collect information you choose to give us:"],
    items: [
      "Contact form: your name, email address, phone number (optional), topic and message.",
      "Internship applications: your name, email address, phone number, college or institution, education, experience, the note you write about yourself and, if you choose, your resume.",
      "Student accounts: your name, email address and password, plus your course progress and certificates.",
      "Administrator accounts: email address and password, used only by our team to manage the site.",
    ],
  },
  {
    title: "3. How we use your information",
    items: [
      "To reply to your enquiries and provide the services you ask about.",
      "To review and respond to internship applications.",
      "To provide courses, track your progress and issue certificates.",
      "To operate, secure and improve the website.",
    ],
    paragraphs: [
      "We do not sell your personal information, and we do not use it for unrelated marketing without your consent.",
    ],
  },
  {
    title: "4. Where your data is stored",
    paragraphs: [
      "Your information is stored with our infrastructure provider, Supabase, which hosts our database and authentication. Resumes are stored privately with Cloudinary and can only be opened by our team. Access is restricted so that only authorised administrators can read submitted messages and applications.",
    ],
  },
  {
    title: "5. How long we keep it",
    paragraphs: [
      "We keep enquiries and applications only as long as needed for the purpose they were submitted, and then delete or anonymise them. You can ask us to delete your information sooner at any time.",
    ],
  },
  {
    title: "6. Sharing",
    paragraphs: [
      "We share information only with service providers who help us run the site, and only when required to provide those services, or when the law requires it.",
    ],
  },
  {
    title: "7. Security",
    paragraphs: [
      "We use access controls and encrypted connections to protect your information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    title: "8. Your choices",
    paragraphs: [
      `You can ask us to access, correct or delete the personal information we hold about you by emailing ${COMPANY.email}. We will respond within a reasonable time.`,
    ],
  },
  {
    title: "9. Children",
    paragraphs: [
      "This website is not intended for children under 13, and we do not knowingly collect their personal information.",
    ],
  },
  {
    title: "10. Changes to this policy",
    paragraphs: [
      "We may update this policy as our services change. The date at the top of this page shows when it was last revised.",
    ],
  },
  {
    title: "11. Contact us",
    paragraphs: [
      `Questions about this policy? Email us at ${COMPANY.email} or use our contact page.`,
    ],
  },
];

const Privacy = () => (
  <LegalLayout
    title="Privacy Policy"
    updated={LAST_UPDATED}
    sections={sections}
    footer={
      <>
        <Link
          to="/terms"
          className="text-brand-600 hover:underline dark:text-brand-400"
        >
          Terms of Service
        </Link>

        <Link
          to="/refund-policy"
          className="text-brand-600 hover:underline dark:text-brand-400"
        >
          Refund Policy
        </Link>
      </>
    }
  />
);

export default Privacy;