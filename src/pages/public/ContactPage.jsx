/**
 * Public Contact Us Page
 */
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";
import api from "../../api/axios";
import BreadcrumbBanner from "../../components/public/BreadcrumbBanner";

const fieldCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-800 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-orange-200";
const labelCls = "block text-[14px] font-medium text-gray-600 mb-1.5";

const InfoCard = ({ icon, title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 px-6 py-5 flex items-start gap-4">
    <span className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0 text-accent">
      {icon}
    </span>
    <div>
      <p className="text-[13px] text-gray-500 mb-0.5">{title}</p>
      {children}
    </div>
  </div>
);

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      toast.info("Please enter your name and phone number");
      return;
    }

    setSending(true);
    try {
      await api.post("/enquiries", {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        treatmentName: form.subject || "Contact Form",
        message: form.message,
        source: { page: "/contact", referrer: "Contact Page" },
      });

      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <title>Contact Ujjwal Dental Clinic Sonipat | Book Appointment</title>
      <meta
        name="description"
        content="Visit Ujjwal Dental at Delhi Road or Parsavnath City Center, Sonipat. Call +91 8708362763. Open Mon-Sat 9AM-8PM."
      />
      <meta
        property="og:title"
        content="Contact Ujjwal Dental Clinic Sonipat | Book Appointment"
      />
      <meta
        property="og:description"
        content="Visit Ujjwal Dental at Delhi Road or Parsavnath City Center, Sonipat. Call +91 8708362763. Open Mon-Sat 9AM-8PM."
      />
      <BreadcrumbBanner
        title="Contact Us"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Contact Us" }]}
      />

      <section className="py-[48px] md:py-[64px] bg-gray-50">
        <div className="max-w-6xl mx-auto px-[32px]">
          <h1
            className="text-[#003366] text-center mb-2"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Get in Touch
          </h1>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto text-base">
            We'd love to hear from you. Visit us or send a message.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left — contact info */}
            <div className="space-y-4">
              <InfoCard icon={<PhoneIcon />} title="Phone">
                <a
                  href="tel:+918708362763"
                  className="font-numbers text-[#003366] font-semibold no-underline hover:text-accent transition-colors"
                >
                  +91 8708362763
                </a>
              </InfoCard>

              <InfoCard icon={<EmailIcon />} title="Email">
                <a
                  href="mailto:ujjwaldentalplanet.in@gmail.com"
                  className="text-[#003366] font-semibold no-underline hover:text-accent transition-colors break-all"
                >
                  ujjwaldentalplanet.in@gmail.com
                </a>
              </InfoCard>

              <InfoCard icon={<LocationOnIcon />} title="Visit Us">
                <p className="text-gray-700 text-[14px] leading-relaxed">
                  <span className="text-[#003366] font-semibold">
                    Ujjwal Dental – Delhi Road
                  </span>
                  <br />
                  Shop No. 5, Near Bus Stand, Sonipat 131001
                </p>
                <p className="text-gray-700 text-[14px] leading-relaxed mt-2">
                  <span className="text-[#003366] font-semibold">
                    Ujjwal Dental – Parsavnath
                  </span>
                  <br />
                  Parsavnath City Center, Shop No. 12, Sonepat 131001
                </p>
              </InfoCard>

              <InfoCard icon={<AccessTimeIcon />} title="Hours">
                <p className="text-gray-700 text-[14px]">
                  Mon–Sat: 9 AM – 8 PM | Sun: By Appointment
                </p>
              </InfoCard>
            </div>

            {/* Right — form */}
            <div className="bg-white rounded-2xl shadow-sm px-8 py-8">
              <h2 className="text-[#003366] text-[22px] font-bold">
                Send us a Message
              </h2>
              <p className="text-gray-500 text-[14px] mt-1 mb-6">
                Have a question? We'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Your Name *</label>
                    <input
                      className={fieldCls}
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number *</label>
                    <input
                      className={fieldCls}
                      value={form.phone}
                      onChange={handleChange("phone")}
                      placeholder="10-digit phone number"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Email Address</label>
                    <input
                      type="email"
                      className={fieldCls}
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Subject</label>
                    <input
                      className={fieldCls}
                      value={form.subject}
                      onChange={handleChange("subject")}
                      placeholder="How can we help?"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Your Message</label>
                    <textarea
                      className={fieldCls}
                      rows={4}
                      value={form.message}
                      onChange={handleChange("message")}
                      placeholder="Write your message..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : (
                    <SendIcon className="text-[18px]!" />
                  )}
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Map */}
          <div className="mt-8 w-full h-[300px] rounded-xl border border-gray-100 bg-gray-100 flex items-center justify-center text-gray-400 text-[15px]">
            Map coming soon
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
