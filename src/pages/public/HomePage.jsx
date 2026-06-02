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
import StarIcon from "@mui/icons-material/Star";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BoltIcon from "@mui/icons-material/Bolt";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
  {
    name: "Dr. Ajay Sangwan",
    slug: "dr-ajay-sangwan",
    experience: "15",
    specialization: "Orthodontist",
    img: "/images/doctor-ajay.jpg",
    bio: "Dr. Ajay Sangwan is a highly skilled orthodontist with over 15 years of experience in teeth alignment, braces, and smile correction treatments. He is dedicated to providing personalized care using the latest orthodontic techniques.",
    qualifications: "BDS, MDS (Orthodontics)",
  },
  {
    name: "Dr. Supriya Kumar Roy",
    slug: "dr-supriya-kumar-roy",
    experience: "41",
    specialization: "Prosthodontist",
    img: "/images/doctor-supriya.jpg",
    bio: "Dr. Supriya Kumar Roy brings over 41 years of clinical expertise in prosthodontics, dental implants, and full-mouth rehabilitation. His vast experience and compassionate approach make him one of the most trusted dental professionals.",
    qualifications: "BDS, MDS (Prosthodontics)",
  },
  {
    name: "Dr. Adrita Nag",
    slug: "dr-adrita-nag",
    experience: "23",
    specialization: "Oral Surgeon",
    img: "/images/doctor-adrita.jpg",
    bio: "Dr. Adrita Nag is an experienced oral surgeon specializing in wisdom teeth extractions, dental implants, and advanced surgical procedures. With 23 years of experience, she is known for her precision and patient comfort.",
    qualifications: "BDS, MDS (Oral Surgery)",
  },
  {
    name: "Dr. Arpita Nag",
    slug: "dr-arpita-nag",
    experience: "9",
    specialization: "Cosmetic Dentist",
    img: "/images/doctor-arpita.jpg",
    bio: "Dr. Arpita Nag specializes in cosmetic dentistry, smile makeovers, and teeth whitening. With 9 years of experience, she combines aesthetic expertise with clinical excellence to deliver stunning results.",
    qualifications: "BDS, MDS (Conservative Dentistry)",
  },
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

const HomePage = () => {
  const [planPrices, setPlanPrices] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
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

      {/* Treatments at Ujjwal Dental */}
      <section className="py-[48px] md:py-[64px] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-10"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Treatments at Ujjwal Dental
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {treatmentCards.map((t) => (
              <Link
                key={t.slug}
                to={`/treatments/${t.slug}`}
                className="group flex flex-col items-center text-center p-4 rounded-[5px] bg-[#f0f8fb] no-underline cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  <img
                    src={t.img}
                    alt={t.title}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span
                  className="text-[#333] group-hover:text-[#003366] transition-colors duration-200"
                  style={{ fontSize: "0.85rem", fontWeight: 600 }}
                >
                  {t.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Speaks */}
      <section className="py-[48px] md:py-[64px] bg-gray-50">
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
              spaceBetween={24}
              slidesPerView={1}
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
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="px-1 py-2"
            >
              {patientSpeaks.map((p, i) => (
                <SwiperSlide key={i} className="h-auto">
                  <div
                    onClick={() => p.videoUrl && setActiveVideo(p.videoUrl)}
                    className={`group bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                      p.videoUrl ? "cursor-pointer" : ""
                    }`}
                  >
                    {/* Thumbnail / gradient placeholder (16:9) */}
                    <div className="relative w-full aspect-video bg-gradient-to-br from-[#0D1B4A] to-[#1e3a8a]">
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

                    {/* Card body */}
                    <div className="p-4">
                      <p className="text-[#1a1a1a] text-base font-semibold leading-tight">
                        {p.name}
                      </p>
                      <p className="text-gray-500 text-sm mb-3">{p.city}</p>
                      <span className="inline-block bg-orange-50 text-[#F57C00] rounded-full px-3 py-1 text-[12px] font-semibold">
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

      {/* Dental Health Plans */}
      <section className="py-[48px] md:py-[64px]" style={{ backgroundColor: "#e8f4fd" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-10"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Dental Health Plans for All
          </h2>
          <Swiper
            modules={[Navigation, FreeMode]}
            navigation
            freeMode
            spaceBetween={20}
            slidesPerView={1.25}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            style={{ alignItems: "stretch" }}
            className="!items-stretch"
          >
            {dentalPlans.map((plan, i) => (
              <SwiperSlide key={i} style={{ height: "auto" }}>
                <div className="bg-white rounded-[10px] border border-gray-200 p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-center mb-4">
                      <img
                        src={plan.img}
                        alt={plan.title}
                        className="h-28 object-contain"
                      />
                    </div>
                    <h3
                      className="text-[#003366] mb-3"
                      style={{ fontSize: "1.15rem", fontWeight: 700 }}
                    >
                      {plan.title}
                    </h3>
                    <ul className="list-disc ml-5 mb-6">
                      {plan.features.map((f, j) => (
                        <li
                          key={j}
                          className="text-gray-600 mb-2"
                          style={{ fontSize: "0.9rem", lineHeight: 1.6 }}
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div>
                      <span
                        className="text-[#e88a1a]"
                        style={{ fontSize: "0.8rem", fontWeight: 600 }}
                      >
                        Special Offer
                      </span>
                      <p
                        className="text-[#003366]"
                        style={{ fontSize: "1.5rem", fontWeight: 800 }}
                      >
                        ₹ {getPrice(plan.title, plan.price)}
                      </p>
                    </div>
                    <Link
                      to="/membership-plans"
                      className="inline-block no-underline text-white rounded-[5px] px-6 py-2.5 transition-colors duration-200 hover:opacity-90"
                      style={{
                        backgroundColor: "#e88a1a",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                      }}
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Meet Our Doctors */}
      <section className="py-[48px] md:py-[64px] bg-white">
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
              <img src="/images/icon-orthodontist.png" alt="" className="w-12 h-12 object-contain" />
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  <span className="text-[#e88a1a]">4+</span> Specialists
                </p>
                <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
                  Expert dental care across multiple specializations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-[8px] border border-gray-200 p-4">
              <img src="/images/icon-women.png" alt="" className="w-12 h-12 object-contain" />
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  <span className="text-[#e88a1a]">10+</span> Years Avg. Experience
                </p>
                <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>
                  Decades of combined clinical expertise.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-[8px] border border-gray-200 p-4">
              <img src="/images/icon-mds.png" alt="" className="w-12 h-12 object-contain" />
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

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {doctors.map((doc) => (
              <div key={doc.slug} className="flex flex-col">
                <div className="rounded-[10px] overflow-hidden bg-gray-200 aspect-[3/4] mb-3">
                  <img
                    src={doc.img}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-[#003366]"
                      style={{ fontSize: "0.95rem", fontWeight: 700 }}
                    >
                      {doc.name}
                    </p>
                    <p
                      className="text-gray-400"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {doc.experience} Exp.
                    </p>
                  </div>
                  <Link
                    to={`/doctors/${doc.slug}`}
                    className="text-[#e88a1a] no-underline shrink-0"
                    style={{ fontSize: "0.8rem", fontWeight: 600 }}
                  >
                    View Bio
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/doctors"
              className="inline-block no-underline text-white rounded-full px-8 py-3 transition-colors duration-200 hover:opacity-90"
              style={{
                backgroundColor: "#e88a1a",
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              Meet Our Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-[48px] md:py-[64px]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title card */}
            <div className="flex flex-col justify-center items-start p-6 md:p-10">
              <img
                src="/ujjwal-dental-logo.png"
                alt="Ujjwal Dental"
                className="w-20 h-20 object-contain mb-5"
              />
              <h2
                className="text-[#003366] text-left"
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                Smiles
                <br />
                Made Here
              </h2>
            </div>

            {/* Card 1 */}
            <div
              className="rounded-sm p-8 flex flex-col justify-between"
              style={{ backgroundColor: "#d6d2cc" }}
            >
              <div>
                <div className="flex items-center gap-0.5 mb-4">
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                </div>
                <p
                  className="text-[#1a1a1a]/80 leading-relaxed"
                  style={{ fontSize: "0.85rem" }}
                >
                  &ldquo;Amazing experience! The doctor was very gentle and
                  professional. My dental implant looks completely natural.
                  Highly recommend Ujjwal Dental.&rdquo;
                </p>
              </div>
              <p
                className="mt-5 text-[#1a1a1a]"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                — Priya S.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className="rounded-sm p-8 flex flex-col justify-between md:rounded-tr-[15px]"
              style={{ backgroundColor: "#c8c3b8" }}
            >
              <div>
                <div className="flex items-center gap-0.5 mb-4">
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                </div>
                <p
                  className="text-[#1a1a1a]/80 leading-relaxed"
                  style={{ fontSize: "0.85rem" }}
                >
                  &ldquo;Best dental clinic in the area. The staff is friendly,
                  and the clinic is very clean and modern. Got my root canal
                  done painlessly!&rdquo;
                </p>
              </div>
              <p
                className="mt-5 text-[#1a1a1a]"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                — Rajesh K.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="rounded-sm p-8 flex flex-col justify-between md:rounded-bl-[15px]"
              style={{ backgroundColor: "#d6d2cc" }}
            >
              <div>
                <div className="flex items-center gap-0.5 mb-4">
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                </div>
                <p
                  className="text-[#1a1a1a]/80 leading-relaxed"
                  style={{ fontSize: "0.85rem" }}
                >
                  &ldquo;My kids love coming here! The doctors are so patient
                  with children. The entire family trusts Ujjwal Dental for all
                  our dental needs.&rdquo;
                </p>
              </div>
              <p
                className="mt-5 text-[#1a1a1a]"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                — Anita V.
              </p>
            </div>

            {/* Card 4 */}
            <div
              className="rounded-sm p-8 flex flex-col justify-between"
              style={{ backgroundColor: "#c8c3b8" }}
            >
              <div>
                <div className="flex items-center gap-0.5 mb-4">
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[18px]! text-black/20" />
                </div>
                <p
                  className="text-[#1a1a1a]/80 leading-relaxed"
                  style={{ fontSize: "0.85rem" }}
                >
                  &ldquo;Got my teeth whitening done here. The results were
                  fantastic! The process was quick and the staff explained
                  everything clearly.&rdquo;
                </p>
              </div>
              <p
                className="mt-5 text-[#1a1a1a]"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                — Sunil M.
              </p>
            </div>

            {/* Card 5 */}
            <div
              className="rounded-sm p-8 flex flex-col justify-between md:rounded-br-[15px]"
              style={{ backgroundColor: "#bdd4de" }}
            >
              <div>
                <div className="flex items-center gap-0.5 mb-4">
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                  <StarIcon className="text-[20px]! text-[#1a1a1a]" />
                </div>
                <p
                  className="text-[#1a1a1a]/80 leading-relaxed"
                  style={{ fontSize: "0.85rem" }}
                >
                  &ldquo;I was very scared of dentists, but the team here made
                  me feel so comfortable. My smile makeover turned out
                  beautiful. Thank you!&rdquo;
                </p>
              </div>
              <p
                className="mt-5 text-[#1a1a1a]"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  fontFamily: "monospace",
                }}
              >
                — Kavita S.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[48px] md:py-[64px]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 text-center bg-[#e8f4fd] py-16 rounded-2xl">
          <h2
            className="text-[#003366] mb-4"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Ready to Transform Your Smile?
          </h2>
          <p
            className="text-[#003366]/60 mb-8 max-w-xl mx-auto"
            style={{ fontSize: "1rem" }}
          >
            Schedule your appointment today and take the first step towards a
            healthier, more beautiful smile.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-[#003366] text-white rounded-full no-underline cursor-pointer px-8 py-3 hover:bg-[#004080] transition-colors duration-200"
            style={{ fontSize: "0.95rem", fontWeight: 700 }}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
