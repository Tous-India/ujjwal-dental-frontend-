/**
 * Mobile/Tablet Bottom Action Bar
 *
 * Fixed bottom navigation (hospital-app style) shown on mobile + tablet only
 * (hidden on desktop). Four equal items: Home, Call, WhatsApp, Book.
 * Phone/WhatsApp use the shared primary-number source (config/contact).
 */
import { NavLink, useLocation } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import { PRIMARY_PHONE_TEL, WHATSAPP_URL } from "../../config/contact";

const ORANGE = "#F57C00";
const NAVY = "#0D1B4A";

const itemClass =
  "flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] no-underline text-[11px] font-medium leading-none transition-colors";

const MobileBottomBar = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isBook = pathname.startsWith("/book-appointment");

  return (
    <nav
      aria-label="Quick actions"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch max-w-7xl mx-auto">
        <NavLink to="/" className={itemClass} style={{ color: isHome ? ORANGE : NAVY }}>
          <HomeRoundedIcon sx={{ fontSize: 24, color: ORANGE }} />
          <span>Home</span>
        </NavLink>

        <a href={PRIMARY_PHONE_TEL} className={itemClass} style={{ color: NAVY }}>
          <CallRoundedIcon sx={{ fontSize: 24, color: ORANGE }} />
          <span>Call</span>
        </a>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClass}
          style={{ color: NAVY }}
        >
          <WhatsAppIcon sx={{ fontSize: 24, color: ORANGE }} />
          <span>WhatsApp</span>
        </a>

        <NavLink
          to="/book-appointment"
          className={itemClass}
          style={{ color: isBook ? ORANGE : NAVY }}
        >
          <EventAvailableRoundedIcon sx={{ fontSize: 24, color: ORANGE }} />
          <span>Book</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomBar;
