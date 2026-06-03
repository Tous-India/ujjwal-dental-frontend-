import { useState, useRef, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Drawer, Collapse, IconButton } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LoginIcon from "@mui/icons-material/Login";
import logo from "../../../public/ujjwal-dental-logo.png";

const treatments = [
  { label: "Dental Implant", slug: "dental-implant" },
  { label: "Root Canal Treatment Rct", slug: "root-canal-treatment-rct" },
  { label: "Wisdom Teeth", slug: "wisdom-teeth" },
  { label: "Clear Aligners", slug: "clear-aligners" },
  { label: "Cosmatic Dental Bonding", slug: "cosmatic-dental-bonding" },
  { label: "Laser Dentistry", slug: "laser-dentistry" },
  { label: "Kids Dentistry", slug: "kids-dentistry" },
  { label: "Dental Crowns And Bridges", slug: "dental-crowns-and-bridges" },
  { label: "Gum Disease Treatment", slug: "gum-disease-treatment" },
  { label: "Dental Filling", slug: "dental-filling" },
  { label: "Dentures", slug: "dentures" },
  { label: "Teeth Whitening", slug: "teeth-whitening" },
  { label: "Mouth Ulcers", slug: "mouth-ulcers" },
  { label: "Braces", slug: "braces" },
  { label: "Smile Makeover", slug: "smile-makeover" },
];

const appointmentItems = [
  {
    label: "Book Appointment",
    slug: "book-appointment",
    path: "/book-appointment",
  },
  { label: "Track Appointment", slug: "track-appointment", path: "/login" },
];

const navItems = [
  { label: "Home", path: "/" },
  {
    label: "Treatments",
    path: "/treatments",
    children: treatments,
    menuKey: "treatments",
  },
  {
    label: "Appointment",
    path: "/book-appointment",
    children: appointmentItems,
    menuKey: "appointment",
  },
  { label: "Membership Plans", path: "/membership-plans" },
  { label: "Contact Us", path: "/contact" },
];

const PublicHeader = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const [showMenu, SetShowMenu] = useState(false);

  const timeoutRefs = useRef({});

  const handleMouseEnter = useCallback((key) => {
    clearTimeout(timeoutRefs.current[key]);
    setOpenMenus((prev) => ({ ...prev, [key]: true }));
  }, []);

  const handleMouseLeave = useCallback((key) => {
    timeoutRefs.current[key] = setTimeout(() => {
      setOpenMenus((prev) => ({ ...prev, [key]: false }));
    }, 100);
  }, []);

  const isActive = (path) => location.pathname === path;
  const isActiveRoute = (path) => location.pathname.startsWith(path);

  const handleMenuClick = () => {
    SetShowMenu(true);
  };

  const handleCrossClick = () => {
    SetShowMenu(false);
  };

  // Close the mobile drawer (and collapse any expanded submenu) after a
  // nav link is tapped, so navigating from the menu also dismisses it.
  const closeMobileMenu = () => {
    SetShowMenu(false);
    setMobileExpanded({});
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#0D1B4A] text-white py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <NavLink
                to="tel:+918708362763"
                className="flex items-center gap-1 text-white no-underline cursor-pointer hover:text-gray-200 transition-colors"
              >
                <PhoneIcon className="text-[16px]!" />
                <span className="text-[13px]!">
                  +91 8708362763
                </span>
              </NavLink>
              <NavLink
                to="mailto:ujjwaldentalplanet.in@gmail.com"
                className="flex items-center gap-1 text-white no-underline cursor-pointer hover:text-gray-200 transition-colors"
              >
                <EmailIcon className="text-[16px]!" />
                <span className="text-[13px]!">
                  ujjwaldentalplanet.in@gmail.com
                </span>
              </NavLink>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {/* <NavLink
                to="/book-appointment"
                className={({ isActive }) =>
                  `text-sm cursor-pointer no-underline transition-colors ${
                    isActive ? "text-[#0196da]" : "text-black text-gray-200"
                  }`
                }
              >
                Sign up
              </NavLink> */}
              <span className="text-white/40">|</span>
              <NavLink
                to="/login"
                className="flex items-center gap-1 text-white no-underline text-sm cursor-pointer hover:text-gray-200 transition-colors"
              >
                <LoginIcon className="text-[16px]!" /> Login
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex items-center justify-between min-h-17.5">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center no-underline mr-6 cursor-pointer shrink-0"
            >
              <img
                src={logo}
                alt="Ujjwal Dental Clinic"
                className="h-13.75 object-contain"
              />
              <div className="hidden sm:block ml-2">
                <span
                  className="block font-extrabold text-[#0D1B4A] leading-tight text-[20px]"
                  style={{ fontWeight: 800 }}
                >
                  UJJWAL DENTAL
                </span>
                <span
                  className="block text-gray-400 text-[11px]"
                  style={{
                    fontWeight: 400,
                    letterSpacing: "0.08em",
                  }}
                >
                  CARING FOR YOUR SMILE
                </span>
              </div>
            </NavLink>

            {/* Desktop Nav */}
            <div
              className={`md:flex ml-auto mr-6 items-center main-navbar ${showMenu ? "showMenuWithTransition" : ""}`}
            >
              <nav className="navdiv ">
                <img src={logo} alt="logo" />
                <ul className="md:flex items-center gap-1.5">
                  <li>
                    {" "}
                    <NavLink
                      to="/"
                      onClick={closeMobileMenu}
                      className={`navItems ${isActive("/") ? "active-nav" : ""}`}
                    >
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <div
                      className={`flex items-center gap-0.5 navItems ${mobileExpanded.treatments ? "mobile-open" : ""} ${isActiveRoute("/treatments") ? "active-nav" : ""}`}
                      onClick={() =>
                        setMobileExpanded((prev) => ({
                          ...prev,
                          treatments: !prev.treatments,
                        }))
                      }
                    >
                      Treatments{" "}
                      <ExpandMoreIcon className="text-[18px]! iconsDD" />
                      <div className="dropdown-nav">
                        <ul onClick={closeMobileMenu}>
                          <li>
                            <NavLink to="/treatments/dental-implant">
                              Dental Implant
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/root-canal-treatment-rct">
                              Root Canal Treatment Rct
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/wisdom-teeth">
                              Wisdom Teeth
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/clear-aligners">
                              Clear Aligners
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/cosmatic-dental-bonding">
                              Cosmatic Dental Bonding
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/laser-dentistry">
                              Laser Dentistry
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/kids-dentistry">
                              Kids Dentistry
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/dental-crowns-and-bridges">
                              Dental Crowns And Bridges
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/gum-disease-treatment">
                              Gum Disease Treatment
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/dental-filling">
                              Dental Filling
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/dentures">
                              Dentures
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/teeth-whitening">
                              Teeth Whitening
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/mouth-ulcers">
                              Mouth Ulcers
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/braces">Braces</NavLink>
                          </li>
                          <li>
                            <NavLink to="/treatments/smile-makeover">
                              Smile Makeover
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`flex items-center gap-0.5 navItems ${mobileExpanded.appointments ? "mobile-open" : ""} ${isActiveRoute("/book-appointment") ? "active-nav" : ""}`}
                      onClick={() =>
                        setMobileExpanded((prev) => ({
                          ...prev,
                          appointments: !prev.appointments,
                        }))
                      }
                    >
                      Appointments{" "}
                      <ExpandMoreIcon className="text-[18px]! iconsDD" />
                      <div className="dropdown-nav">
                        <ul onClick={closeMobileMenu}>
                          <li>
                            <NavLink to="/book-appointment">
                              Book Appointment
                            </NavLink>
                          </li>
                          <li>
                            <NavLink to="/login">Track Appointment</NavLink>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>
                  <li>
                    {" "}
                    <NavLink
                      to="/membership-plans"
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-0.5 navItems ${isActive("/membership-plans") ? "active-nav" : ""}`}
                    >
                      Membership Plan{" "}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/contact"
                      onClick={closeMobileMenu}
                      className={`navItems ${isActive("/contact") ? "active-nav" : ""}`}
                    >
                      Contacts
                    </NavLink>
                  </li>
                </ul>
              </nav>
              <div>
                <CloseIcon
                  onClick={handleCrossClick}
                  className="cursor-pointer close-icon crossIcon"
                />
              </div>
            </div>

            {/* Book Appointment CTA */}
            <NavLink
              to="/book-appointment"
              className="hidden md:inline-flex items-center bg-[#F57C00] text-white rounded-full font-semibold text-[15px] tracking-wide px-6 py-2.5 no-underline cursor-pointer shrink-0 shadow-sm hover:bg-[#E06C00] hover:shadow-md transition-all duration-200"
            >
              Book Appointment
            </NavLink>

            {/* Mobile-only Book button (desktop has the full CTA above) */}
            <NavLink
              to="/book-appointment"
              className="md:hidden ml-auto mr-3 inline-flex items-center bg-[#F57C00] text-white rounded-full font-semibold text-[13px] px-4 py-1.5 no-underline shrink-0 hover:bg-[#E06C00] transition-colors"
            >
              Book
            </NavLink>

            <div className="menuIcon">
              {" "}
              <MenuIcon onClick={handleMenuClick} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
    </>
  );
};

export default PublicHeader;
