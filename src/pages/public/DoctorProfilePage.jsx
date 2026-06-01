import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import submitEnquiry from "../../utils/submitEnquiry";
import BreadcrumbBanner from "../../components/public/BreadcrumbBanner";

const doctors = [
  {
    name: "Dr. Ajay Sangwan",
    slug: "dr-ajay-sangwan",
    experience: "15",
    specialization: "Orthodontist",
    role: "General Dentistry, Orthodontics",
    img: "/images/doctor-ajay.jpg",
    qualifications: "BDS, MDS (Orthodontics)",
    location: "Sonipat, Haryana",
    bio: "Dr. Ajay Sangwan, Orthodontist & Smile Design Expert, is skilled in braces, clear aligners, smile correction & interceptive orthodontics. Backed by 15 years of clinical experience, he offers ethical, high-quality care through holistic, tailored treatment plans.",
    stats: [
      { value: "3000+", label: "Braces Cases" },
      { value: "500+", label: "Aligners" },
      { value: "200+", label: "Smile Corrections" },
      { value: "5000+", label: "Consultations" },
    ],
    expertise: [
      "Specializes in braces",
      "clear aligners",
      "smile design",
      "interceptive orthodontics",
      "lingual braces",
      "ceramic braces",
      "retainers",
      "jaw alignment",
      "teeth straightening",
      "bite correction",
    ],
    achievements: [
      "Member of Indian Orthodontic Society",
      "Certification in Invisalign (2019)",
      "Certification in Advanced Orthodontics (2018)",
      "Best Orthodontist Award — Dental Excellence Awards (2021)",
      "Speaker at National Orthodontic Conference (2022)",
    ],
  },
  {
    name: "Dr. Supriya Kumar Roy",
    slug: "dr-supriya-kumar-roy",
    experience: "41",
    specialization: "Prosthodontist",
    role: "Prosthodontics, Implantology",
    img: "/images/doctor-supriya.jpg",
    qualifications: "BDS, MDS (Prosthodontics)",
    location: "Sonipat, Haryana",
    bio: "Dr. Supriya Kumar Roy, Prosthodontist & Implantologist, brings over 41 years of clinical expertise in dental implants, full-mouth rehabilitation & dentures. His vast experience and compassionate approach make him one of the most trusted dental professionals in the region.",
    stats: [
      { value: "5000+", label: "RCTs & Crowns" },
      { value: "1000+", label: "Implants" },
      { value: "300+", label: "Full Mouth Rehabs" },
      { value: "10000+", label: "Dental Fillings" },
    ],
    expertise: [
      "Specializes in implants",
      "full mouth rehab",
      "dentures",
      "crown & bridge",
      "veneers",
      "laminates",
      "smile design",
      "prosthodontics",
      "overdentures",
      "implant-supported prosthesis",
    ],
    achievements: [
      "Fellow of Indian Prosthodontic Society",
      "Lifetime Achievement Award — State Dental Council (2020)",
      "Certification in Advanced Implantology (2015)",
      "Published 12+ research papers in national journals",
      "Mentor & examiner at dental universities",
    ],
  },
  {
    name: "Dr. Adrita Nag",
    slug: "dr-adrita-nag",
    experience: "23",
    specialization: "Oral Surgeon",
    role: "Oral Surgery, Implantology",
    img: "/images/doctor-adrita.jpg",
    qualifications: "BDS, MDS (Oral Surgery)",
    location: "Sonipat, Haryana",
    bio: "Dr. Adrita Nag, Oral Surgeon & Implantologist, is an experienced specialist in wisdom teeth extractions, dental implant surgery & advanced oral surgical procedures. With 23 years of experience, she is known for her precision, patient comfort and ethical practice.",
    stats: [
      { value: "4000+", label: "Extractions" },
      { value: "800+", label: "Implants" },
      { value: "500+", label: "Surgical Cases" },
      { value: "7000+", label: "Consultations" },
    ],
    expertise: [
      "Specializes in extractions",
      "dental implants",
      "wisdom teeth removal",
      "jaw surgery",
      "cyst removal",
      "trauma management",
      "bone grafting",
      "sinus lift",
      "apicoectomy",
      "biopsy procedures",
    ],
    achievements: [
      "Member of Association of Oral & Maxillofacial Surgeons",
      "Certification in Advanced Implant Surgery (2018)",
      "Certification in Laser Surgery (2020)",
      "Best Oral Surgeon — Regional Dental Awards (2019)",
      "Speaker at International Oral Surgery Symposium (2021)",
    ],
  },
  {
    name: "Dr. Arpita Nag",
    slug: "dr-arpita-nag",
    experience: "9",
    specialization: "Cosmetic Dentist",
    role: "General Dentistry, Implantology, Periodontist",
    img: "/images/doctor-arpita.jpg",
    qualifications: "MDS",
    location: "Sonipat, Haryana",
    bio: "Dr. Arpita Nag, Periodontist & Oral Implantologist, is skilled in implants, smile design, full mouth rehab & periodontal therapy. Backed by rich clinical experience, she offers ethical, high-quality care through holistic, tailored treatment plans.",
    stats: [
      { value: "4000+", label: "RCTs & Crowns" },
      { value: "500+", label: "Implants" },
      { value: "200+", label: "Full Mouth Rehabs" },
      { value: "8000+", label: "Dental Fillings" },
    ],
    expertise: [
      "Specializes in implants",
      "aligners",
      "veneers",
      "laminates",
      "smile design",
      "full mouth rehab",
      "RCTs",
      "crowns",
      "fillings",
      "post & core",
      "inlays/onlays",
      "periodontal therapy",
      "lasers",
      "teeth whitening",
      "aesthetic & general dentistry",
    ],
    achievements: [
      "Member of Indian Society of Periodontology",
      "Certification in Clinical Implantology (2021)",
      "Certification in Clinical Skill Enhancement (2020)",
      "Certification in Rotary Endodontics (2022)",
      "Specialist of the year — Periodontist Category at Indian Dental Diva Awards (2022)",
    ],
  },
];

const DoctorProfilePage = () => {
  const { slug } = useParams();
  const doctor = doctors.find((d) => d.slug === slug);

  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  if (!doctor) {
    return (
      <>
        <BreadcrumbBanner
          title="Doctor Not Found"
          breadcrumbs={[
            { label: "Home", path: "/" },
            { label: "Our Doctors" },
            { label: "Not Found" },
          ]}
        />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p style={{ fontSize: "1.1rem" }} className="text-gray-500 mb-6">
            The doctor profile you are looking for does not exist.
          </p>
          <Link
            to="/"
            className="inline-block no-underline text-white rounded-full px-8 py-3"
            style={{ backgroundColor: "#003366", fontSize: "0.95rem", fontWeight: 700 }}
          >
            Go Home
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <BreadcrumbBanner
        title={doctor.name}
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Our Doctors" },
          { label: doctor.name },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Left Sidebar — Doctor Card */}
          <div className="md:col-span-3">
            <div className="rounded-[10px] overflow-hidden bg-gray-100">
              <img
                src={doctor.img}
                alt={doctor.name}
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
            <div className="mt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className="text-[#003366]"
                    style={{ fontSize: "1.1rem", fontWeight: 800 }}
                  >
                    {doctor.name}
                  </p>
                  <p
                    className="text-gray-500"
                    style={{ fontSize: "0.8rem" }}
                  >
                    ({doctor.role})
                  </p>
                </div>
                <span
                  className="shrink-0 text-center rounded-[8px] px-2 py-1"
                  style={{ backgroundColor: "#fde8d0", fontSize: "0.7rem", fontWeight: 700, color: "#c26e1a" }}
                >
                  {doctor.experience}+ Yrs<br />Exp
                </span>
              </div>
              <div className="mt-3">
                <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>Qualification</p>
                <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>{doctor.qualifications}</p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-gray-500">
                <LocationOnIcon className="text-[16px]!" />
                <p style={{ fontSize: "0.8rem" }}>{doctor.location}</p>
              </div>
            </div>
          </div>

          {/* Middle Content */}
          <div className="md:col-span-6">
            {/* About Doctor */}
            <div className="mb-8">
              <h2
                className="text-[#1a1a1a] mb-4"
                style={{ fontSize: "1.3rem", fontWeight: 700 }}
              >
                About Doctor
              </h2>
              <p
                className="text-gray-600 leading-relaxed"
                style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
              >
                {doctor.bio}
              </p>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap border border-gray-200 rounded-[8px] mb-8 overflow-hidden">
              {doctor.stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[100px] text-center py-4 px-2"
                  style={{ borderRight: i < doctor.stats.length - 1 ? "1px solid #e5e7eb" : "none" }}
                >
                  <p
                    className="text-[#003366]"
                    style={{ fontSize: "1.2rem", fontWeight: 800 }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-gray-500"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Expertise */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: "1.2rem" }}>🦷</span>
                <h2
                  className="text-[#1a1a1a]"
                  style={{ fontSize: "1.2rem", fontWeight: 700 }}
                >
                  Expertise
                </h2>
              </div>
              <div className="h-[2px] bg-gray-200 mb-4" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {doctor.expertise.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircleOutlineIcon
                      className="text-[16px]! mt-0.5 shrink-0"
                      style={{ color: "#555" }}
                    />
                    <span
                      className="text-gray-600"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: "1.2rem" }}>🏆</span>
                <h2
                  className="text-[#1a1a1a]"
                  style={{ fontSize: "1.2rem", fontWeight: 700 }}
                >
                  Achievements
                </h2>
              </div>
              <div className="h-[2px] bg-gray-200 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {doctor.achievements.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircleOutlineIcon
                      className="text-[16px]! mt-0.5 shrink-0"
                      style={{ color: "#555" }}
                    />
                    <span
                      className="text-gray-600"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar — Appointment Form */}
          <div className="md:col-span-3">
            <div className="sticky top-24 bg-white rounded-[10px] border border-gray-200 p-5 shadow-sm">
              <h3
                className="text-[#003366] mb-2"
                style={{ fontSize: "1.1rem", fontWeight: 800 }}
              >
                Book Appointment with {doctor.name}
              </h3>
              <p
                className="text-gray-500 mb-5"
                style={{ fontSize: "0.8rem" }}
              >
                Book your free consultation today and take the first step towards healthy, beautiful teeth.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Your Name*"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[5px] border border-[#e88a1a] outline-none focus:border-[#c26e1a] transition-colors"
                  style={{ fontSize: "14px", fontFamily: "'Poppins', sans-serif" }}
                />
                <input
                  type="tel"
                  placeholder="Your Phone*"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[5px] border border-[#e88a1a] outline-none focus:border-[#c26e1a] transition-colors"
                  style={{ fontSize: "14px", fontFamily: "'Poppins', sans-serif" }}
                />
                <input
                  type="email"
                  placeholder="Your Email*"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[5px] border border-[#e88a1a] outline-none focus:border-[#c26e1a] transition-colors"
                  style={{ fontSize: "14px", fontFamily: "'Poppins', sans-serif" }}
                />
                <div className="flex justify-center" style={{ transform: "scale(0.85)", transformOrigin: "center" }}>
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)}
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!captchaToken) {
                      alert("Please complete the reCAPTCHA verification.");
                      return;
                    }
                    const ok = await submitEnquiry({ name: form.name, email: form.email, phone: form.phone, treatment: `Appointment - ${doctor.name}`, pagePath: `/doctors/${doctor.slug}`, pageLabel: "Doctor Profile" });
                    if (ok) { setForm({ name: "", phone: "", email: "" }); setCaptchaToken(null); captchaRef.current?.reset(); }
                  }}
                  className="w-full py-3 text-white rounded-[5px] uppercase tracking-wide cursor-pointer hover:opacity-90 transition-colors"
                  style={{ backgroundColor: "#c0392b", fontSize: "14px", fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}
                >
                  Book a Free Consultation
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default DoctorProfilePage;
