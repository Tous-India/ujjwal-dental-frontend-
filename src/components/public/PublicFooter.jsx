/**
 * Public Footer
 *
 * Navy footer with brand, quick links, treatments, and contact/hours.
 */
import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Treatments", to: "/treatments" },
  { label: "Book Appointment", to: "/book-appointment" },
  { label: "Membership Plans", to: "/membership-plans" },
  { label: "Contact Us", to: "/contact" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];

const treatmentLinks = [
  { label: "Dental Implants", to: "/treatments/dental-implant" },
  { label: "Root Canal", to: "/treatments/root-canal-treatment-rct" },
  { label: "Braces & Aligners", to: "/treatments/braces" },
  { label: "Teeth Whitening", to: "/treatments/teeth-whitening" },
  { label: "Laser Dentistry", to: "/treatments/laser-dentistry" },
  { label: "Kids Dentistry", to: "/treatments/kids-dentistry" },
];

const socialLinks = [
  {
    icon: <InstagramIcon sx={{ fontSize: 20 }} />,
    url: "https://www.instagram.com/ujjwaldentalimplant/",
    label: "Instagram",
  },
  {
    icon: <YouTubeIcon sx={{ fontSize: 20 }} />,
    url: "https://www.youtube.com/@ujjwaldentalplanet",
    label: "YouTube",
  },
  {
    icon: <LinkedInIcon sx={{ fontSize: 20 }} />,
    url: "https://www.linkedin.com/company/unavailable/",
    label: "LinkedIn",
  },
  {
    icon: <FacebookIcon sx={{ fontSize: 20 }} />,
    url: "https://www.facebook.com/ujjwaldentalimplant",
    label: "Facebook",
  },
];

const PublicFooter = () => {
  return (
    <footer className="bg-[#0D1B4A] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <p className="text-white font-bold text-[18px] leading-tight">
              UJJWAL DENTAL
            </p>
            <p className="text-gray-400 text-[12px] tracking-wide mb-4">
              CARING FOR YOUR SMILE
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              Advanced dental care in Sonipat with 20+ years of expertise.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wide mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-300 text-sm no-underline hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Treatments */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wide mb-4">
              Treatments
            </h3>
            <ul className="space-y-2.5">
              {treatmentLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-300 text-sm no-underline hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wide mb-4">
              Visit Us
            </h3>
            <p className="text-gray-300 text-[13px] leading-relaxed mb-3">
              <span className="text-white">Ujjwal Dental – Delhi Road</span>
              <br />
              Shop No. 5, Near Bus Stand, Sonipat 131001
            </p>
            <p className="text-gray-300 text-[13px] leading-relaxed mb-3">
              <span className="text-white">Ujjwal Dental – Parsavnath</span>
              <br />
              Parsavnath City Center, Shop No. 12, Sonepat 131001
            </p>
            <p className="text-[13px] mb-1">
              <a
                href="tel:+918708362763"
                className="text-gray-300 no-underline hover:text-white transition-colors duration-200"
              >
                +91 8708362763
              </a>
            </p>
            <p className="text-[13px] mb-3">
              <a
                href="mailto:ujjwaldentalplanet.in@gmail.com"
                className="text-gray-300 no-underline hover:text-white transition-colors duration-200"
              >
                ujjwaldentalplanet.in@gmail.com
              </a>
            </p>
            <p className="text-gray-400 text-[13px]">
              Mon–Sat: 9 AM – 8 PM | Sun: By Appointment
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-400 text-[13px]">
            © 2026 Ujjwal Dental Clinic. All Rights Reserved.
          </p>
          <p className="text-gray-400 text-[13px]">
            Developed by{" "}
            <a
              href="https://thetous.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 no-underline hover:text-white transition-colors duration-200"
            >
              The Tous
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
