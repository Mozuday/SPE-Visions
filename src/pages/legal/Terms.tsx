import { Link } from "react-router-dom";

import { COMPANY } from "../../constants/company";
import { POLICY } from "../../constants/policy";

import LegalLayout from "../../components/legal/LegalLayout";
import type { LegalSection } from "../../components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    title: "1. About these terms",
    paragraphs: [
      `These terms apply when you use the ${COMPANY.name} website, create an account, take a course, apply for an internship or contact us. By using the site you agree to them. If you don't agree, please don't use it.`,
    ],
  },
  {
    title: "2. Your account",
    items: [
      "You must give accurate information when you sign up.",
      "Keep your password private. You are responsible for activity on your account.",
      "Accounts are personal. Don't share your login with others.",
    ],
  },
  {
    title: "3. Courses",
    paragraphs: [
      "When you enrol in a course you get a personal, non-transferable licence to watch it for your own learning.",
    ],
    items: [
      "Don't share, resell, record or publish course videos or links.",
      "We may update, reorganise or remove course content over time.",
      "Learning outcomes depend on your own effort, and we don't promise a particular result, job or income.",
    ],
  },
  {
    title: "4. Payments and refunds",
    paragraphs: [
      "Paid courses are charged in Indian rupees through our payment provider, Razorpay. We never see or store your card details.",
      "Refunds are governed by our Refund & Cancellation Policy.",
    ],
  },
  {
    title: "5. Certificates",
    paragraphs: [
      "A certificate is issued when you complete all lessons of a course. Each has a unique number that anyone can use to verify it. We may revoke a certificate that was obtained by misuse of the platform.",
    ],
  },
  {
    title: "6. Internships and jobs",
    paragraphs: [
      "Submitting an internship application does not guarantee a place. We may accept or decline applications at our discretion.",
      "Job listings link to employers' own application pages. We are not the employer and are not responsible for their hiring decisions or content.",
    ],
  },
  {
    title: "7. Acceptable use",
    items: [
      "Don't attempt to access other people's data or break the security of the site.",
      "Don't upload harmful files or send spam through our forms.",
      "Don't use the site for anything unlawful.",
    ],
    paragraphs: [
      "We may suspend or close accounts that break these rules.",
    ],
  },
  {
    title: "8. Our content",
    paragraphs: [
      `The site, course material, designs and branding belong to ${COMPANY.name} or its licensors. You may not copy or reuse them without permission.`,
    ],
  },
  {
    title: "9. Your content",
    paragraphs: [
      "Information you send us, such as messages and applications, is used as described in our Privacy Policy. You confirm that you have the right to share it.",
    ],
  },
  {
    title: "10. Availability and liability",
    paragraphs: [
      "We work to keep the site running but can't promise it will always be available or error free. To the extent the law allows, we are not liable for indirect losses arising from your use of the site, and our total liability for a paid course is limited to the amount you paid for it.",
    ],
  },
  {
    title: "11. Changes",
    paragraphs: [
      "We may update these terms. The date at the top shows the latest version, and continued use means you accept the changes.",
    ],
  },
  {
    title: "12. Governing law",
    paragraphs: [
      `These terms are governed by the laws of ${POLICY.governingLaw}.`,
    ],
  },
  {
    title: "13. Contact",
    paragraphs: [
      `Questions about these terms? Email ${COMPANY.email} or use our contact page.`,
    ],
  },
];

const Terms = () => (
  <LegalLayout
    title="Terms of Service"
    updated={POLICY.lastUpdated}
    sections={sections}
    footer={
      <>
        <Link
          to="/privacy"
          className="text-blue-600 hover:underline dark:text-cyan-400"
        >
          Privacy Policy
        </Link>

        <Link
          to="/refund-policy"
          className="text-blue-600 hover:underline dark:text-cyan-400"
        >
          Refund Policy
        </Link>
      </>
    }
  />
);

export default Terms;