/*
 * Edit these values to match your real policy.
 * The Refund and Terms pages are generated from them.
 *
 * DRAFT: confirm every line before launch.
 */
export const POLICY = {
  // Refund requests accepted within this many days of purchase...
  refundWindowDays: 7,

  // ...if the student has completed less than this share of the course
  refundMaxProgressPercent: 20,

  // Days we take to process an approved refund back to the original payment method
  refundProcessingDays: 7,

  // Courses priced at zero are free and have nothing to refund
  // Jurisdiction used in the Terms (have this checked locally)
  governingLaw: "India",

  lastUpdated: "October 2026",
};