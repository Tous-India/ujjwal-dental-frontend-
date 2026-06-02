import { useState, useEffect } from "react";
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
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoIcon from "@mui/icons-material/Info";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import docter from "../../../public/docter.webp";
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

const patientSpeaks = [
  { name: "Avantika", city: "Indore", treatment: "Aligners", img: "/images/patient-avantika.jpg" },
  { name: "Neha", city: "Delhi", treatment: "Aligners", img: "/images/patient-neha.jpg" },
  { name: "Pulak", city: "Delhi", treatment: "Dental Implants", img: "/images/patient-pulak.jpg" },
  { name: "Pratyush", city: "Bangalore", treatment: "Aligners", img: "/images/patient-pratyush.jpg" },
  { name: "Ayushi", city: "Pune", treatment: "Aligners", img: "/images/patient-ayushi.jpg" },
  { name: "Gurkiran", city: "Delhi", treatment: "Aligners", img: "/images/patient-gurkiran.jpg" },
];

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

        {/* Text overlay (sits on top of the banner images) */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center bg-gradient-to-r from-black/60 via-black/30 to-transparent">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
            <div className="max-w-xl text-center md:text-left">
              <h1 className="text-white font-bold leading-tight mb-3 text-[28px] md:text-[44px]">
                Your Smile, Our Priority
              </h1>
              <p className="text-white/90 font-normal mb-6 text-[18px] md:text-[20px]">
                Advanced Dental Care in Sonipat
              </p>
              <Link
                to="/book-appointment"
                className="pointer-events-auto inline-flex items-center bg-[#F57C00] text-white rounded-full font-semibold text-[15px] tracking-wide px-7 py-3 no-underline shadow-md hover:bg-[#E06C00] transition-all duration-200"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
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
      <section className="py-20 md:py-24 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2 className="text-[#0D1B4A] text-center mb-3 text-3xl md:text-4xl font-bold">
            Comprehensive Dental Care for All Your Needs
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-3xl mx-auto w-[100%] md:w-[55%] text-base md:text-lg leading-relaxed">
            We take pride in providing a comprehensive range of dental services.
            Our state-of-the-art facilities and experienced professionals
            demonstrate our dedication to excellence.
          </p>

          <div className="flex justify-center items-center md:flex-row gap-5 md:gap-8 flex-col">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 lg:max-w-[65%]">
              {treatments.map((t) => (
                <Link
                  key={t.slug || "view-more"}
                  to={t.slug ? `/treatments/${t.slug}` : "/treatments"}
                  className="group flex flex-col items-center text-center px-2 py-5 rounded-xl bg-white border border-gray-100 shadow-sm no-underline cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-3 overflow-hidden transition-colors duration-300">
                    <img
                      src={t.img}
                      alt={t.title}
                      className="w-12 h-12 object-contain rounded-[30px]"
                    />
                  </div>
                  <span className="text-[#0D1B4A] group-hover:text-[#F57C00] transition-colors duration-200 text-[15px] font-semibold">
                    {t.title}
                  </span>
                </Link>
              ))}
            </div>
            <div className="lg:max-w-[20.5%]">
              <img
                src={docter}
                alt=""
                className="w-100 rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
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
            {/* Convenience */}
            <div className="rounded-[10px]! p-8 transition-all duration-300 bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#e8f4fd]">
                  <span className="text-[24px]! text-[#006694]">
                    <CalendarMonthIcon />
                  </span>
                </div>
                <h3
                  className="text-[#003366] mb-2"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                >
                  Convenience
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "0.95rem" }}
                >
                  Patients can easily book appointments online without the
                  hassle of calling or waiting.
                </p>
              </div>
            </div>

            {/* Comprehensive Information */}
            <div className="rounded-[10px]! p-8 transition-all duration-300 bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#e8f4fd]">
                  <span className="text-[24px]! text-[#006694]">
                    <InfoIcon />
                  </span>
                </div>
                <h3
                  className="text-[#003366] mb-2"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                >
                  Comprehensive Information
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "0.95rem" }}
                >
                  The website provides detailed information about services,
                  treatments, and dental care tips.
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

            {/* Expert Guidance */}
            <div className="rounded-[10px]! p-8 transition-all duration-300 bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#e8f4fd]">
                  <span className="text-[24px]! text-[#006694]">
                    <SchoolIcon />
                  </span>
                </div>
                <h3
                  className="text-[#003366] mb-2"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                >
                  Expert Guidance
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "0.95rem" }}
                >
                  Information from certified dental professionals ensures
                  accurate and reliable dental advice.
                </p>
              </div>
            </div>

            {/* 24/7 Accessibility */}
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
                  24/7 Accessibility
                </h3>
                <p
                  className="text-gray-500 leading-relaxed"
                  style={{ fontSize: "0.95rem" }}
                >
                  Access to information and appointments at any time, from
                  anywhere, on any device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments at Ujjwal Dental */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2
            className="text-[#003366] text-center mb-2"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Patient Speaks
          </h2>
          <p
            className="text-center text-gray-500 mb-10 max-w-2xl mx-auto"
            style={{ fontSize: "1rem" }}
          >
            Hear what our happy patients have to say about their journey with
            Ujjwal Dental
          </p>
          <Swiper
            modules={[Navigation, FreeMode]}
            navigation
            freeMode
            spaceBetween={16}
            slidesPerView={1.3}
            breakpoints={{
              480: { slidesPerView: 2.2 },
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            }}
          >
            {patientSpeaks.map((p, i) => (
              <SwiperSlide key={i}>
                <div className="flex flex-col">
                  <div className="relative rounded-[10px] overflow-hidden bg-gray-200 aspect-[3/4]">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                        <PlayArrowIcon className="text-white text-[22px]!" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p
                        className="text-[#1a1a1a]"
                        style={{ fontSize: "0.9rem", fontWeight: 600 }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="text-gray-400"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {p.city}
                      </p>
                    </div>
                    <span
                      className="text-[#006694]"
                      style={{ fontSize: "0.75rem", fontWeight: 600 }}
                    >
                      {p.treatment}
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Dental Health Plans */}
      <section className="py-16" style={{ backgroundColor: "#e8f4fd" }}>
        <div className="max-w-5xl mx-auto px-4">
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
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
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
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
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
      <section className="md:mb-16">
        <div className="max-w-5xl mx-auto px-4 text-center bg-[#e8f4fd] py-16 rounded-2xl">
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
