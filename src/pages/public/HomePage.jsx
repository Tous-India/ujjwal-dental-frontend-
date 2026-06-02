import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  Pagination,
  EffectFade,
  Navigation,
  FreeMode,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import "swiper/css/effect-fade";
import "swiper/css/navigation";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import GroupsIcon from "@mui/icons-material/Groups";
import VerifiedIcon from "@mui/icons-material/Verified";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AddIcon from "@mui/icons-material/Add";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BoltIcon from "@mui/icons-material/Bolt";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import CheckIcon from "@mui/icons-material/Check";
import Patient1 from "../../../public/patient-1.webp";
import Patient2 from "../../../public/patient-2.webp";
import Patient3 from "../../../public/patient-3.webp";

const treatmentCards = [
  { title: "Teeth Braces", slug: "braces", img: "/images/braces.png" },
  { title: "Mouth Ulcers", slug: "mouth-ulcers", img: "/images/mouth-ulcers.png" },
  { title: "Dental Implant", slug: "dental-implant", img: "/images/dental-implant.png" },
  { title: "Aligners", slug: "clear-aligners", img: "/images/clear-aligner.png" },
  { title: "Kids Dentistry", slug: "kids-dentistry", img: "/images/kid-dentistry.png" },
  { title: "Laser Dentistry", slug: "laser-dentistry", img: "/images/laser-dentistry.png" },
  { title: "Root Canal Treatment", slug: "root-canal-treatment-rct", img: "/images/root-canal.png" },
  { title: "Dental Crowns", slug: "dental-crowns-and-bridges", img: "/images/dental-crown-and-bridges.png" },
  { title: "Dental Fillings", slug: "dental-filling", img: "/images/dental-filling.png" },
  { title: "Wisdom Teeth Extraction", slug: "wisdom-teeth", img: "/images/wisdom-teeth.png" },
  { title: "Dentures", slug: "dentures", img: "/images/dentures.png" },
  { title: "Advanced Gum Treatment", slug: "gum-disease-treatment", img: "/images/gum-deases-treatment.png" },
];

const doctors = [
  { name: "Dr. Ujjwal", experience: "20 Yrs Experience", lead: true },
  { name: "Dr. Alisha", experience: "5 Yrs Experience", lead: false },
  { name: "New Specialist", experience: "Joining Soon", lead: false },
];

const dentalPlans = [
  {
    title: "Implant Post Care",
    img: "/images/dental-implant.png",
    features: [
      "Post-implant care and follow-up visits.",
      "Free consultation and X-ray for implant patients.",
    ],
    price: "4500",
  },
  {
    title: "Cosmodentofacial Family Dental Plan",
    img: "/images/cosmatic-dental-bonding.png",
    features: [
      "Complete family dental check-up and cleaning.",
      "Discounted rates on cosmetic and orthodontic treatments.",
      "Free consultation and X-ray for the entire family.",
    ],
    price: "4999",
  },
  {
    title: "Individuals Plan",
    img: "/images/clear-aligner.png",
    features: [
      "Comprehensive individual dental care package.",
      "Free consultation and intraoral X-ray.",
    ],
    price: "2000",
  },
];

// img: thumbnail path (files not yet uploaded — cards fall back to a gradient
// placeholder via onError until real thumbnails are added).
// videoUrl: YouTube link — when present, the card opens it in a lightbox.
const patientSpeaks = [
  { name: "Avantika", city: "Indore", treatment: "Aligners", img: "/images/patient-avantika.jpg", videoUrl: null },
  { name: "Neha", city: "Delhi", treatment: "Aligners", img: "/images/patient-neha.jpg", videoUrl: null },
  { name: "Pulak", city: "Delhi", treatment: "Dental Implants", img: "/images/patient-pulak.jpg", videoUrl: null },
  { name: "Pratyush", city: "Bangalore", treatment: "Aligners", img: "/images/patient-pratyush.jpg", videoUrl: null },
  { name: "Ayushi", city: "Pune", treatment: "Aligners", img: "/images/patient-ayushi.jpg", videoUrl: null },
  { name: "Gurkiran", city: "Delhi", treatment: "Aligners", img: "/images/patient-gurkiran.jpg", videoUrl: null },
];

// Convert a YouTube watch/short URL into an autoplay embed URL for the lightbox.
const toEmbedUrl = (url) => {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{11})/);
  return match
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
    : url;
};

const marqueeItems = [
  { icon: <GroupsIcon />, value: "10,000+", label: "Happy Patients" },
  { icon: <MedicalServicesIcon />, value: "15+", label: "Treatments" },
  { icon: <VerifiedIcon />, value: "10+", label: "Years Experience" },
  { icon: <EventAvailableIcon />, value: "24/7", label: "Emergency Care" },
];

const heroBanners = [
  {
    src: "/images/banner1.png",
    alt: "Perfectly Aligned Smiles, Expertly Crafted Braces",
  },
  {
    src: "/images/banner2.png",
    alt: "The Joy of Healthy Smiles - Kids Dentistry",
  },
  { src: "/images/banner3.png", alt: "Expert Dental Care for a Healthy Smile" },
];

const treatments = [
  {
    title: "Dental Implant",
    slug: "dental-implant",
    img: "/images/dental-implant.png",
  },
  {
    title: "Root Canal Treatment RCT",
    slug: "root-canal-treatment-rct",
    img: "/images/root-canal.png",
  },
  {
    title: "Wisdom Teeth",
    slug: "wisdom-teeth",
    img: "/images/wisdom-teeth.png",
  },
  {
    title: "Clear Aligners",
    slug: "clear-aligners",
    img: "/images/clear-aligner.png",
  },
  {
    title: "Cosmatic Dental Bonding",
    slug: "cosmatic-dental-bonding",
    img: "/images/cosmatic-dental-bonding.png",
  },
  {
    title: "Laser Dentistry",
    slug: "laser-dentistry",
    img: "/images/laser-dentistry.png",
  },
  {
    title: "Kids Dentistry",
    slug: "kids-dentistry",
    img: "/images/kid-dentistry.png",
  },
  {
    title: "Dental Crowns and Bridges",
    slug: "dental-crowns-and-bridges",
    img: "/images/dental-crown-and-bridges.png",
  },
  {
    title: "Gum Disease Treatment",
    slug: "gum-disease-treatment",
    img: "/images/gum-deases-treatment.png",
  },
  { title: "View More", slug: "", img: "/images/view-more.png" },
];

const faqs = [
  {
    q: "What dental treatments does Ujjwal Dental Clinic in Sonipat offer?",
    a: "We offer 15+ treatments including dental implants, root canal (RCT), braces, clear aligners, teeth whitening, laser dentistry, kids dentistry, crowns & bridges, gum treatment, dentures, cosmetic bonding, wisdom teeth extraction, dental fillings, smile makeover, and mouth ulcer treatment. All treatments use modern equipment with painless laser options.",
  },
  {
    q: "How do I book an appointment at Ujjwal Dental?",
    a: "You can book online through our website 24/7 — select your preferred clinic, date, and time slot. You can also call us at +91 8708362763. Walk-in appointments are available during clinic hours.",
  },
  {
    q: "What are the clinic timings?",
    a: "We're open Monday to Saturday, 9:00 AM to 8:00 PM. Sunday consultations are available by appointment only. Emergency dental care is available — call us anytime.",
  },
  {
    q: "Do you offer painless dental treatment?",
    a: "Yes. We specialize in laser dentistry — no cuts, no stitches, minimal bleeding, and faster recovery. Most procedures including gum treatments and cavity fillings can be done painlessly with our advanced laser equipment.",
  },
  {
    q: "What are the dental membership plans and pricing?",
    a: "We offer three annual plans: Individuals Plan (₹2,000), Implant Post Care (₹4,500), and Cosmodentofacial Family Dental Plan (₹4,999). Plans include free consultations, X-rays, and discounts on treatments. Buy online or at the clinic.",
  },
  {
    q: "Is Ujjwal Dental Clinic good for kids?",
    a: "Yes. We have a dedicated kids dentistry program for children from infancy through teens. Our doctors are experienced with pediatric patients and make dental visits comfortable and anxiety-free.",
  },
  {
    q: "Where is Ujjwal Dental Clinic located?",
    a: "We have two clinics in Sonipat, Haryana: Ujjwal Dental – Delhi Road (Shop No. 5, Near Bus Stand, Sonipat 131001) and Ujjwal Dental – Parsavnath (Parsavnath City Center, Shop No. 12, Sonepat 131001).",
  },
  {
    q: "Do you accept online payments?",
    a: "Yes. We accept online payments via Razorpay (cards, UPI, netbanking, wallets) for appointment bookings and membership plans. Cash and card payments are also accepted at the clinic.",
  },
];

const HomePage = () => {
  const [planPrices, setPlanPrices] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [openFaqs, setOpenFaqs] = useState({ 0: true });
  const reviewsPrevRef = useRef(null);
  const reviewsNextRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dental_plans_pricing");
      if (saved) setPlanPrices(JSON.parse(saved));
    } catch {}
  }, []);

  const getPrice = (title, defaultPrice) =>
    planPrices?.[title] || defaultPrice;

  return (
    <div>
      <title>
        Ujjwal Dental Clinic | Advanced Dental Care in Sonipat, Haryana
      </title>
      <meta
        name="description"
        content="Ujjwal Dental offers dental implants, braces, root canal, teeth whitening & laser dentistry in Sonipat. Book online. 20+ years experience."
      />
      <meta
        property="og:title"
        content="Ujjwal Dental Clinic | Advanced Dental Care in Sonipat, Haryana"
      />
      <meta
        property="og:description"
        content="Ujjwal Dental offers dental implants, braces, root canal, teeth whitening & laser dentistry in Sonipat. Book online. 20+ years experience."
      />
      {/* Hero Banner Slider */}
      <section className="relative w-full overflow-hidden">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation]}
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          freeMode={true}
          speed={1500}
        >
          {heroBanners.map((banner, i) => (
            <SwiperSlide key={i}>
              <img
                src={banner.src}
                alt={banner.alt}
                className="w-full h-auto object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Stats Ticker */}
      <div className="w-full bg-orange-50 border-y border-orange-100 overflow-hidden">
        <div className="animate-marquee flex w-max">
          {[
            ...marqueeItems,
            ...marqueeItems,
            ...marqueeItems,
            ...marqueeItems,
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-10 py-4 shrink-0"
            >
              <span className="text-[#F57C00] text-[26px]">{item.icon}</span>
              <span className="text-[#0D1B4A] whitespace-nowrap text-2xl font-bold">
                {item.value}
              </span>
              <span className="text-gray-500 whitespace-nowrap text-sm font-medium">
                {item.label}
              </span>
              <span className="text-[#F57C00]/30 ml-6">●</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <section className="py-[48px] md:py-[64px] bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2 className="text-[#0D1B4A] text-center mb-3 text-3xl md:text-4xl font-bold">
            Comprehensive Dental Care for All Your Needs
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-3xl mx-auto w-[100%] md:w-[55%] text-base md:text-lg leading-relaxed">
            We take pride in providing a comprehensive range of dental services.
            Our state-of-the-art facilities and experienced professionals
            demonstrate our dedication to excellence.
          </p>

          <div className="text-center mb-6">
            <Link
              to="/treatments"
              className="text-accent text-[14px] font-medium no-underline hover:text-accent-dark transition-colors duration-200"
            >
              Explore now
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {treatments.map((t) => (
              <Link
                key={t.slug || "view-more"}
                to={t.slug ? `/treatments/${t.slug}` : "/treatments"}
                className="flex flex-col items-center text-center py-8 px-4 rounded-2xl bg-white border border-gray-100 shadow-xs no-underline cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <img
                    src={t.img}
                    alt={t.title}
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <span className="text-gray-700 text-[15px] font-medium">
                  {t.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-[48px] md:py-[64px] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-3"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Why Choose Ujjwal Dental?
          </h2>
          <p
            className="text-center text-gray-500 mb-12 max-w-3xl mx-auto w-[100%] md:w-[45%]"
            style={{ fontSize: "1rem" }}
          >
            We are committed to providing the best dental experience with modern
            technology and compassionate care
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Painless Laser Dentistry */}
            <div className="rounded-[10px]! p-8 transition-all duration-300 bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#e8f4fd]">
                  <span className="text-[24px]! text-[#006694]">
                    <BoltIcon />
                  </span>
                </div>
                <h3
                  className="text-[#003366] mb-2"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                >
                  Painless Laser Dentistry
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "0.95rem" }}
                >
                  Advanced laser treatments — no cuts, no stitches, minimal
                  bleeding. Faster recovery with precision procedures that most
                  clinics don&apos;t offer.
                </p>
              </div>
            </div>

            {/* 20+ Years of Expertise */}
            <div className="rounded-[10px]! p-8 transition-all duration-300 bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#e8f4fd]">
                  <span className="text-[24px]! text-[#006694]">
                    <WorkspacePremiumIcon />
                  </span>
                </div>
                <h3
                  className="text-[#003366] mb-2"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                >
                  20+ Years of Expertise
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "0.95rem" }}
                >
                  Two decades of clinical experience across dental implants,
                  orthodontics, and oral surgery. Over 10,000 patients treated
                  with trusted, evidence-based care.
                </p>
              </div>
            </div>

            {/* Patient Reviews (highlighted) */}
            <div className="rounded-[10px]! overflow-hidden transition-all duration-300 text-white md:row-span-2 whychooseus-swiper shadow border p-1">
              <Swiper
                modules={[Autoplay, Pagination, FreeMode]}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                }}
                speed={1500}
                className="h-full whychoouse-swiper-wrapper"
              >
                <SwiperSlide>
                  <img src={Patient1} alt="Patient Review 1" />
                </SwiperSlide>
                <SwiperSlide>
                  <img src={Patient2} alt="Patient Review 2" />
                </SwiperSlide>
                <SwiperSlide>
                  <img src={Patient3} alt="Patient Review 3" />
                </SwiperSlide>
              </Swiper>
            </div>

            {/* Complete Family Dental Care */}
            <div className="rounded-[10px]! p-8 transition-all duration-300 bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#e8f4fd]">
                  <span className="text-[24px]! text-[#006694]">
                    <FamilyRestroomIcon />
                  </span>
                </div>
                <h3
                  className="text-[#003366] mb-2"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                >
                  Complete Family Dental Care
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "0.95rem" }}
                >
                  From kids&apos; first dental visit to senior dentures — one
                  clinic for the whole family. Preventive, cosmetic, and
                  restorative treatments all under one roof.
                </p>
              </div>
            </div>

            {/* 24/7 Emergency & Online Booking */}
            <div className="rounded-[10px]! p-8 transition-all duration-300 bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#e8f4fd]">
                  <span className="text-[24px]! text-[#006694]">
                    <AccessTimeIcon />
                  </span>
                </div>
                <h3
                  className="text-[#003366] mb-2"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                >
                  24/7 Emergency &amp; Online Booking
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "0.95rem" }}
                >
                  Dental emergencies don&apos;t wait — neither do we. Book
                  appointments online anytime, or call for same-day emergency
                  consultations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Speaks */}
      <section className="py-[48px] md:py-[64px] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-2"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            What Our Patients Say
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto text-base">
            Real stories from real patients
          </p>

          <div className="relative">
            {/* Prev / Next arrow controls */}
            <button
              ref={reviewsPrevRef}
              type="button"
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#003366] transition-colors duration-200 hover:bg-gray-50 -ml-1 md:-ml-3"
            >
              <ChevronLeftIcon />
            </button>
            <button
              ref={reviewsNextRef}
              type="button"
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#003366] transition-colors duration-200 hover:bg-gray-50 -mr-1 md:-mr-3"
            >
              <ChevronRightIcon />
            </button>

            <Swiper
              modules={[Navigation, Autoplay]}
              speed={600}
              loop
              spaceBetween={16}
              slidesPerView={1.2}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                prevEl: reviewsPrevRef.current,
                nextEl: reviewsNextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = reviewsPrevRef.current;
                swiper.params.navigation.nextEl = reviewsNextRef.current;
              }}
              breakpoints={{
                768: { slidesPerView: 2.5 },
                1024: { slidesPerView: 4 },
              }}
              className="px-1 pt-2 pb-4 overflow-visible"
            >
              {patientSpeaks.map((p, i) => (
                <SwiperSlide key={i} className="h-auto overflow-visible">
                  <div
                    onClick={() => p.videoUrl && setActiveVideo(p.videoUrl)}
                    className={`group bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                      p.videoUrl ? "cursor-pointer" : ""
                    }`}
                  >
                    {/* Thumbnail / gradient placeholder (portrait 9:16) */}
                    <div className="relative w-full aspect-[9/16] bg-gradient-to-br from-[#0D1B4A] to-[#1e3a8a]">
                      {p.img && (
                        <img
                          src={p.img}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                          <PlayArrowIcon className="text-[#0D1B4A] text-[30px]! ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Card body — name + badge on one line */}
                    <div className="p-4 flex items-center justify-between gap-2">
                      <p className="text-[#1a1a1a] text-base font-semibold leading-tight">
                        {p.name}
                      </p>
                      <span className="inline-block bg-orange-50 text-[#F57C00] rounded-full px-3 py-1 text-[12px] font-semibold whitespace-nowrap">
                        {p.treatment}
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Video lightbox */}
        {activeVideo && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <div
              className="relative w-full max-w-3xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActiveVideo(null)}
                className="absolute -top-10 right-0 text-white text-3xl leading-none cursor-pointer"
              >
                &times;
              </button>
              <iframe
                src={toEmbedUrl(activeVideo)}
                title="Patient review video"
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </section>

      {/* Meet Our Doctors */}
      <section className="py-[48px] md:py-[64px] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-2"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Our Team of Dental Experts
          </h2>
          <p
            className="text-center text-gray-500 mb-10 max-w-2xl mx-auto"
            style={{ fontSize: "1rem" }}
          >
            Skilled. Certified. Compassionate. Our expert team is what makes
            Ujjwal Dental trusted by thousands.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <div className="flex items-center gap-4 bg-white rounded-[8px] border border-gray-200 p-4">
              <span className="w-12 h-12 rounded-full bg-[#e8f4fd] flex items-center justify-center shrink-0">
                <GroupsIcon className="text-[#006694]" />
              </span>
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  <span className="text-[#e88a1a]">2</span> Specialists
                </p>
                <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
                  Expert dental care across multiple specializations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-[8px] border border-gray-200 p-4">
              <span className="w-12 h-12 rounded-full bg-[#e8f4fd] flex items-center justify-center shrink-0">
                <WorkspacePremiumIcon className="text-[#006694]" />
              </span>
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  <span className="text-[#e88a1a]">20+</span> Years Avg. Experience
                </p>
                <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
                  Two decades of combined clinical expertise.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-[8px] border border-gray-200 p-4">
              <span className="w-12 h-12 rounded-full bg-[#e8f4fd] flex items-center justify-center shrink-0">
                <SchoolIcon className="text-[#006694]" />
              </span>
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  <span className="text-[#e88a1a]">MDS</span> Doctors
                </p>
                <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
                  Advanced care in oral surgery, orthodontics & more.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {doctors.map((doc) => (
              <div
                key={doc.name}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                  doc.lead ? "border-t-4 border-[#e88a1a]" : ""
                }`}
              >
                {/* Photo placeholder (navy gradient + silhouette, 4:5) */}
                <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#0D1B4A] to-[#1e3a8a]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PersonIcon className="text-white/80 text-[64px]!" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[#003366] text-base font-semibold leading-tight">
                    {doc.name}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{doc.experience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dental Health Plans */}
      <section className="py-[48px] md:py-[64px] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-2"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Dental Health Plans for All
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto text-base">
            Save more with our annual membership plans
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto items-stretch">
            {dentalPlans.map((plan, i) => {
              const featured = i === 1;
              return (
                <div
                  key={i}
                  className={`relative rounded-2xl py-8 px-6 flex flex-col border ${
                    featured
                      ? "bg-white border-[#003366] md:scale-[1.03]"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#003366] text-white text-[12px] font-semibold rounded-full px-3 py-1">
                      Most Popular
                    </span>
                  )}

                  {/* Plan name + price */}
                  <div className="text-center">
                    <h3 className="text-[#003366] text-[21px] font-bold leading-tight">
                      {plan.title}
                    </h3>
                    <p className="mt-3">
                      <span className="price-num text-[#003366] text-[38px] font-extrabold">
                        ₹{getPrice(plan.title, plan.price)}
                      </span>
                      <span className="text-gray-500 text-sm">/year</span>
                    </p>
                  </div>

                  <div className="border-t border-gray-100 my-5" />

                  {/* Benefits */}
                  <ul className="flex-grow">
                    {plan.features.map((f, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 py-1.5 text-gray-700 text-[15px] leading-snug"
                      >
                        <CheckIcon className="text-accent text-[16px]! mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to="/membership-plans"
                    className="mt-6 block w-full text-center no-underline border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200"
                  >
                    Buy Now
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[48px] md:py-[64px] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-2"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto text-base">
            Everything you need to know about our dental care
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto items-start">
            {faqs.map((item, i) => {
              const open = !!openFaqs[i];
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 px-6 py-4"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenFaqs((prev) => ({ ...prev, [i]: !prev[i] }))
                    }
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="text-[#003366] text-[15px] md:text-base font-semibold leading-snug">
                      {item.q}
                    </span>
                    <AddIcon
                      className={`text-[#003366] shrink-0 transition-transform duration-300 ${
                        open ? "rotate-45" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      open
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className="text-gray-600 text-[15px]"
                        style={{ lineHeight: 1.7 }}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ structured data (JSON-LD) for SEO rich results */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
