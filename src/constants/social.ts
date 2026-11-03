import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import { COMPANY } from "./company";

export type SocialLink = {
  label: string;
  url: string;
  icon: IconType;
};

const allSocialLinks: SocialLink[] = [
  { label: "WhatsApp", url: COMPANY.whatsapp, icon: FaWhatsapp },
  { label: "Instagram", url: COMPANY.instagram, icon: FaInstagram },
  { label: "LinkedIn", url: COMPANY.linkedin, icon: FaLinkedin },
  { label: "GitHub", url: COMPANY.github, icon: FaGithub },
  { label: "YouTube", url: COMPANY.youtube, icon: FaYoutube },
  { label: "X (Twitter)", url: COMPANY.twitter, icon: FaXTwitter },
  { label: "Facebook", url: COMPANY.facebook, icon: FaFacebook },
];

/*
 * Only real links are exported. Empty values and leftover
 * placeholder URLs are filtered out, so Navbar and Footer
 * never render a dead icon.
 */
const isPlaceholder = (url: string) =>
  /yourusername|yourpage|yourprofile|yourportfolio|XXXX/i.test(url);

export const socialLinks: SocialLink[] = allSocialLinks.filter(
  (link) => link.url.trim() !== "" && !isPlaceholder(link.url)
);