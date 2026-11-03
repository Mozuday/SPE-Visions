import { Link } from "react-router-dom";

import { COMPANY } from "../../constants/company";
import { POLICY } from "../../constants/policy";

import LegalLayout from "../../components/legal/LegalLayout";
import type { LegalSection } from "../../components/legal/LegalLayout";

const sections: LegalSection[] = [
  {
    title: "1. Free courses and internships",
    paragraphs: [
      "Free courses, internship applications and job listings involve no payment, so there is nothing to refund.",
    ],
  },
  {
    title: "2. Paid courses: when you can get a refund",
    paragraphs: [
      "You can request a refund for a paid course if both of these are true:",
    ],
    items: [
      `You ask within ${POLICY.refundWindowDays} days of the purchase date.`,
      `You have completed less than ${POLICY.refundMaxProgressPercent}% of the course lessons.`,
    ],
  },
  {
    title: "3. When a refund is not available",
    items: [
      `More than ${POLICY.refundWindowDays} days have passed since purchase.`,
      `You have completed ${POLICY.refundMaxProgressPercent}% or more of the course.`,
      "You already received a completion certificate for the course.",
      "Your access was removed because of a breach of our Terms, such as sharing your account or course content.",
    ],
  },
  {
    title: "4. How to request a refund",
    paragraphs: [
      `Email ${COMPANY.email} from the address you registered with. Include the course name and the date you bought it. We will confirm whether the request qualifies.`,
    ],
  },
  {
    title: "5. How refunds are paid",
    paragraphs: [
      `Approved refunds go back to the original payment method through our payment provider, Razorpay. Please allow up to ${POLICY.refundProcessingDays} business days for the money to appear. Your bank may take additional time.`,
      "When a refund is approved, your access to that course is removed.",
    ],
  },
  {
    title: "6. Cancellations",
    paragraphs: [
      "Courses are digital and available immediately after payment, so there is nothing to cancel once access is granted. The refund rules above apply instead.",
    ],
  },
  {
    title: "7. Failed or duplicate payments",
    paragraphs: [
      `If money was taken but you did not get access, or you were charged twice, email ${COMPANY.email} with the payment reference. Duplicate charges are refunded in full.`,
    ],
  },
  {
    title: "8. Contact",
    paragraphs: [
      `Questions about this policy? Email ${COMPANY.email} or use our contact page.`,
    ],
  },
];

const Refund = () => (
  <LegalLayout
    title="Refund & Cancellation Policy"
    updated={POLICY.lastUpdated}
    sections={sections}
    footer={
      <Link
        to="/terms"
        className="text-blue-600 hover:underline dark:text-cyan-400"
      >
        Terms of Service
      </Link>
    }
  />
);

export default Refund;