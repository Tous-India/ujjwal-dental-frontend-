import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import BoltIcon from "@mui/icons-material/Bolt";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VerifiedIcon from "@mui/icons-material/Verified";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const treatments = [
  { title: "Dental Implant", slug: "dental-implant", img: "/images/dental-implant.png" },
  { title: "Root Canal Treatment RCT", slug: "root-canal-treatment-rct", img: "/images/root-canal.png" },
  { title: "Wisdom Teeth", slug: "wisdom-teeth", img: "/images/wisdom-teeth.png" },
  { title: "Clear Aligners", slug: "clear-aligners", img: "/images/clear-aligner.png" },
  { title: "Cosmatic Dental Bonding", slug: "cosmatic-dental-bonding", img: "/images/cosmatic-dental-bonding.png" },
  { title: "Laser Dentistry", slug: "laser-dentistry", img: "/images/laser-dentistry.png" },
  { title: "Kids Dentistry", slug: "kids-dentistry", img: "/images/kid-dentistry.png" },
  { title: "Dental Crowns and Bridges", slug: "dental-crowns-and-bridges", img: "/images/dental-crown-and-bridges.png" },
  { title: "Gum Disease Treatment", slug: "gum-disease-treatment", img: "/images/gum-deases-treatment.png" },
  { title: "View More", slug: "", img: "/images/view-more.png" },
];

const doctors = [
  { name: "Dr. Ujjwal Prem", subtitle: "MDS (Oral and Maxillofacial Surgeon)", experience: "15+ Yrs Experience", lead: true, img: "/doctors/ujjwal.jpg", to: "/doctors/ujjwal-prem" },
  { name: "Dr. Alisha Dogra", subtitle: "BDS — Bachelor of Dental Surgery", experience: "5+ Yrs Experience", lead: false, img: "/doctors/alisha.jpg" },
  { name: "Dr. Ajay Kaushik", experience: "8+ Yrs Experience", subtitle: "MDS — Orthodontics & Dentofacial Orthopaedics | Asst. Professor", lead: false, img: "/doctors/ajay.webp", to: "/doctors/ajay-kaushik" },
  { name: "Dr. Shivani Sharma", experience: "15+ Yrs Experience", subtitle: "MDS — Periodontist", lead: false, img: "/doctors/shivani.webp" },
];

const dentalPlans = [
  {
    title: "Premium Dental Health Plan",
    img: "/images/clear-aligner.png",
    features: [
      "₹1,500 treatment coupon redeemable against any dental procedure",
      "Free consultation and X-ray",
    ],
    price: "666",
  },
  {
    title: "Star Dental Health Plan",
    img: "/images/cosmatic-dental-bonding.png",
    features: [
      "₹1,500 treatment coupon redeemable against any dental procedure",
      "Free consultation and X-ray",
      "₹4,000 off on orthodontic and implant treatments",
    ],
    price: "999",
  },
  {
    title: "Implant Post Care",
    img: "/images/dental-implant.png",
    features: [
      "OPD for one year",
      "Oral Prophylaxis (twice a year)",
      "Two oral health kits in a year",
      "RVG for one year",
      "Post Operative Dental Implant Care",
    ],
    price: "4500",
    annual: true,
  },
];

const trustCards = [
  {
    icon: <BoltIcon />,
    title: "Advanced Laser Dentistry",
    body: "Gentle laser treatments with greater precision, less discomfort, minimal bleeding, and faster healing.",
  },
  {
    icon: <WorkspacePremiumIcon />,
    title: "Experienced Dental Team",
    body: "Over fifteen years of clinical experience across dental implants, orthodontics, and oral surgery. Over 10,000 patients treated with trusted, evidence-based care.",
  },
  {
    icon: <FamilyRestroomIcon />,
    title: "Complete Family Dentistry",
    body: "Comprehensive dental care for children, adults, and seniors — all under one roof.",
  },
  {
    icon: <AccessTimeIcon />,
    title: "Emergency Dental Care",
    body: "Quick and reliable treatment for dental emergencies when you need it most.",
  },
];

const marqueeItems = [
  { icon: <GroupsIcon />, value: "10,000+", label: "Happy Patients" },
  { icon: <MedicalServicesIcon />, value: "15+", label: "Treatments" },
  { icon: <VerifiedIcon />, value: "15+", label: "Years Experience" },
  { icon: <EventAvailableIcon />, value: "24/7", label: "Emergency Care" },
];

const faqs = [
  {
    q: "Who is the best dentist in Sonipat?",
    a: "The best dentist is someone who provides quality treatment, listens to your concerns, and makes you feel comfortable. At Ujjwal Dental Planet, we focus on providing honest advice, personalized care, and modern dental treatments for every patient.",
  },
  {
    q: "How much does a dental implant cost in Sonipat?",
    a: "The cost of a dental implant depends on your dental condition and treatment needs. After a consultation, we will explain your treatment plan and provide clear pricing with no hidden charges.",
  },
  {
    q: "Is root canal treatment painful?",
    a: "No. Root canal treatment is usually not painful because it is done under local anesthesia. Most patients feel little to no discomfort during the procedure.",
  },
  {
    q: "Do you provide emergency dental treatment?",
    a: "Yes. We provide emergency dental care for severe tooth pain, broken teeth, swelling, dental injuries, and other urgent dental problems.",
  },
  {
    q: "Do you treat children?",
    a: "Yes. We welcome patients of all ages and provide gentle dental care for children to help keep their teeth healthy and strong.",
  },
  {
    q: "How can I book an appointment?",
    a: "Booking an appointment is easy. Simply call our clinic, fill out the appointment form on our website, or visit us directly. Our team will be happy to assist you.",
  },
  {
    q: "Is your dental clinic in Sonipat equipped with modern technology?",
    a: "Yes. Our clinic uses advanced dental equipment and modern treatment techniques to provide accurate diagnosis, comfortable procedures, and better treatment outcomes.",
  },
  {
    q: "Do you offer cosmetic dentistry in Sonipat?",
    a: "Yes. We provide cosmetic dental treatments such as teeth whitening, dental bonding, veneers, smile makeovers, and clear aligners to help improve your smile.",
  },
];

const SonipatPage = () => {
  const [planPrices, setPlanPrices] = useState(null);
  const [openFaqs, setOpenFaqs] = useState({});
  const doctorsPrevRef = useRef(null);
  const doctorsNextRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dental_plans_pricing");
      if (saved) setPlanPrices(JSON.parse(saved));
    } catch {}
  }, []);

  const getPrice = (title, defaultPrice) => planPrices?.[title] || defaultPrice;

  return (
    <div>
      <title>Best Dentist in Sonipat | Ujjwal Dental Planet</title>
      <meta
        name="description"
        content="Ujjwal Dental Planet is a trusted dentist in Sonipat offering implants, root canal, braces, and cosmetic dentistry with an experienced team. Book today."
      />
      <meta
        name="keywords"
        content="dentist in Sonipat, dental clinic Sonipat, best dentist Sonipat, Ujjwal Dental Planet Sonipat"
      />
      <link rel="canonical" href="https://ujjwaldentalplanet.com/dentist-in-sonipat" />
      <meta name="robots" content="index, follow" />
      <meta
        property="og:title"
        content="Best Dentist in Sonipat | Ujjwal Dental Planet"
      />
      <meta
        property="og:description"
        content="Ujjwal Dental Planet is a trusted dentist in Sonipat offering implants, root canal, braces, and cosmetic dentistry with an experienced team."
      />
      <meta property="og:url" content="https://ujjwaldentalplanet.com/dentist-in-sonipat" />
      <meta
        property="og:image"
        content="https://ujjwaldentalplanet.com/ujjwal-dental-logo.png"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Best Dentist in Sonipat | Ujjwal Dental Planet" />
      <meta
        name="twitter:description"
        content="Ujjwal Dental Planet is a trusted dentist in Sonipat offering implants, root canal, braces, and cosmetic dentistry."
      />
      <meta
        name="twitter:image"
        content="https://ujjwaldentalplanet.com/ujjwal-dental-logo.png"
      />
      <meta name="geo.region" content="IN-HR" />
      <meta name="geo.placename" content="Sonipat" />
      <meta name="geo.position" content="28.9931;77.0151" />
      <meta name="ICBM" content="28.9931, 77.0151" />

      {/* Dentist structured data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dentist",
            "@id": "https://ujjwaldentalplanet.com/#sonipat-page",
            name: "Ujjwal Dental Planet — Sonipat",
            url: "https://ujjwaldentalplanet.com/dentist-in-sonipat",
            telephone: "+91 8708362763",
            priceRange: "Rs Rs",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Plot 35/13, Delhi Rd, Sikka Colony, Lakshmi Nagar",
              addressLocality: "Sonipat",
              addressRegion: "Haryana",
              postalCode: "131001",
              addressCountry: "IN",
            },
            parentOrganization: {
              "@id": "https://ujjwaldentalplanet.com/#organization",
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="py-[56px] md:py-[80px] bg-gradient-to-br from-[#0D1B4A] to-[#1e3a8a] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Best Dentist in Sonipat
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
            Complete dental care, Advanced technology, Trusted experts.
          </p>
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 mt-8 no-underline bg-[#F57C00] hover:bg-[#e88a1a] text-white rounded-xl px-8 py-3 text-[15px] font-semibold transition-colors duration-200"
          >
            Book an Appointment <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Link>
        </div>
      </section>

      {/* Welcome */}
      <section className="py-[48px] md:py-[64px] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2 className="text-[#0D1B4A] text-center mb-6 text-3xl md:text-4xl font-bold">
            Welcome to Ujjwal Dental Planet – Your Trusted Dental Clinic in Sonipat
          </h2>
          <p className="text-center text-gray-500 max-w-4xl mx-auto text-base md:text-lg leading-relaxed">
            At Ujjwal Dental Planet, we believe everyone deserves a healthy smile. As a
            trusted dental clinic in Sonipat, we provide complete dental care using modern
            technology, experienced dentists, and a patient-first approach. From regular
            dental check-ups to advanced treatments like dental implants, root canals,
            braces, and smile makeovers, we offer solutions for every stage of your oral
            health journey. Every treatment is personalized to meet your needs and carried
            out with care and attention. Our goal is to make every dental visit comfortable,
            affordable, and stress-free while helping you enjoy healthy teeth and gums for
            years to come.
          </p>
        </div>
      </section>

      {/* Advanced Dental Treatments We Offer */}
      <section className="py-[48px] md:py-[64px] bg-gray-50 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2 className="text-[#0D1B4A] text-center mb-3 text-3xl md:text-4xl font-bold">
            Advanced Dental Treatments We Offer
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-3xl mx-auto w-[100%] md:w-[55%] text-base md:text-lg leading-relaxed">
            From routine dental check-ups to advanced treatments, we offer comprehensive
            dental services for patients of all ages. Our experienced dentists use modern
            technology and personalized treatment plans to deliver comfortable, effective,
            and long-lasting care.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {treatments.map((t) => (
              <Link
                key={t.slug || "view-more"}
                to={t.slug ? `/treatments/${t.slug}` : "/treatments"}
                className="flex flex-col items-center text-center py-8 px-4 rounded-2xl bg-white border border-gray-100 shadow-xs no-underline cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <img src={t.img} alt={t.title} loading="lazy" className="w-9 h-9 object-contain" />
                </div>
                <span className="text-gray-700 text-[15px] font-medium">{t.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Families Trust Us */}
      <section className="py-[48px] md:py-[64px] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-3"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Why Families Trust Us
          </h2>
          <p
            className="text-center text-gray-500 mb-12 max-w-3xl mx-auto w-[100%] md:w-[55%]"
            style={{ fontSize: "1rem" }}
          >
            At Ujjwal Dental Clinic, experience trusted dental care with skilled dentists,
            advanced technology, personalized treatments, and a commitment to healthy,
            confident smiles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[10px]! p-8 transition-all duration-300 bg-gray-50 border border-gray-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#e8f4fd]">
                  <span className="text-[24px]! text-[#006694]">{card.icon}</span>
                </div>
                <h3
                  className="text-[#003366] mb-2"
                  style={{ fontSize: "1.25rem", fontWeight: 700 }}
                >
                  {card.title}
                </h3>
                <p className="text-gray-500 leading-relaxed" style={{ fontSize: "0.95rem" }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Dental Experts */}
      <section className="py-[48px] md:py-[64px] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-2"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Meet Our Dental Experts
          </h2>
          <p
            className="text-center text-gray-500 mb-10 max-w-2xl mx-auto"
            style={{ fontSize: "1rem" }}
          >
            Skilled. Certified. Compassionate. Our expert team is what makes Ujjwal Dental
            trusted by thousands.
          </p>

          <div className="group relative max-w-6xl mx-auto">
            <button
              ref={doctorsPrevRef}
              aria-label="Previous doctors"
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white text-[#003366] shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronLeftIcon />
            </button>
            <button
              ref={doctorsNextRef}
              aria-label="Next doctors"
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white text-[#003366] shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ChevronRightIcon />
            </button>

            <Swiper
              modules={[Navigation]}
              speed={500}
              loop={false}
              spaceBetween={16}
              slidesPerView={1.2}
              navigation={{
                prevEl: doctorsPrevRef.current,
                nextEl: doctorsNextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = doctorsPrevRef.current;
                swiper.params.navigation.nextEl = doctorsNextRef.current;
              }}
              breakpoints={{
                768: { slidesPerView: 2.5 },
                1024: { slidesPerView: 4 },
              }}
              className="px-1 pt-2 pb-4 !items-stretch"
            >
              {doctors.map((doc) => {
                const CardTag = doc.to ? Link : "div";
                return (
                  <SwiperSlide key={doc.name} className="h-auto">
                    <CardTag
                      {...(doc.to ? { to: doc.to } : {})}
                      className={`block no-underline h-full bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                        doc.lead ? "border-t-4 border-[#e88a1a]" : ""
                      }`}
                    >
                      <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#0D1B4A] to-[#1e3a8a]">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PersonIcon className="text-white/80 text-[64px]!" />
                        </div>
                        {doc.img && (
                          <img
                            src={doc.img}
                            alt={doc.name}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[#003366] text-base font-semibold leading-tight">
                          {doc.name}
                        </p>
                        {doc.subtitle && (
                          <p className="text-gray-500 text-[14px] mt-1 leading-snug">
                            {doc.subtitle}
                          </p>
                        )}
                        <p className="font-numbers text-gray-500 text-sm mt-1">
                          {doc.experience}
                        </p>
                      </div>
                    </CardTag>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Why We're a Trusted Dentist in Sonipat */}
      <section className="py-[48px] md:py-[64px] bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h2
            className="text-[#003366] text-center mb-10"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Why We&apos;re a Trusted Dentist in Sonipat
          </h2>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl overflow-hidden">
            <div className="flex flex-wrap justify-center">
              {marqueeItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-10 py-6 shrink-0"
                >
                  <span className="text-[#F57C00] text-[26px]">{item.icon}</span>
                  <span className="font-numbers text-[#0D1B4A] whitespace-nowrap text-2xl font-bold">
                    {item.value}
                  </span>
                  <span className="text-gray-500 whitespace-nowrap text-sm font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Book an Appointment */}
      <section className="py-[48px] md:py-[64px] bg-[#0D1B4A] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Book an Appointment with the Best Dentist in Sonipat
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-8">
            Take the first step towards a healthier smile. Book your appointment today and
            receive expert dental care in a comfortable and friendly environment.
          </p>
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 no-underline bg-[#F57C00] hover:bg-[#e88a1a] text-white rounded-xl px-8 py-3 text-[15px] font-semibold transition-colors duration-200"
          >
            Book Now <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Link>
        </div>
      </section>

      {/* Dental Plans */}
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
                      ? "bg-white border-[#003366] md:scale-[1.03] order-first md:order-none"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#003366] text-white text-[12px] font-semibold rounded-full px-3 py-1">
                      Most Popular
                    </span>
                  )}

                  <div className="text-center">
                    <h3 className="text-[#003366] text-[21px] font-bold leading-tight">
                      {plan.title}
                    </h3>
                    <p className="mt-3">
                      <span className="font-numbers text-[#003366] text-[38px] font-extrabold">
                        ₹{getPrice(plan.title, plan.price)}
                      </span>
                      {plan.annual && (
                        <span className="font-numbers text-gray-500 text-sm">/year</span>
                      )}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 my-5" />

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
            Everything you need to know about our Sonipat dental clinic
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
                      <p className="text-gray-600 text-[15px]" style={{ lineHeight: 1.7 }}>
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

          <div className="text-center mt-10">
            <Link
              to="/"
              className="text-accent text-[14px] font-medium no-underline hover:text-accent-dark transition-colors duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SonipatPage;
