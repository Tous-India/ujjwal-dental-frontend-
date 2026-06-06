/**
 * Terms & Conditions (static)
 */
import BreadcrumbBanner from "../../components/public/BreadcrumbBanner";

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-[#003366] text-xl font-bold mb-3">{title}</h2>
    <div className="text-gray-700 text-[15px] leading-[1.8] space-y-3">
      {children}
    </div>
  </section>
);

const TermsPage = () => {
  return (
    <>
      <title>Terms &amp; Conditions | Ujjwal Dental Clinic</title>
      <meta
        name="description"
        content="Terms & Conditions for Ujjwal Dental Clinic — appointments, payments, membership plans, and patient policies."
      />
      <BreadcrumbBanner
        title="Terms & Conditions"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Terms & Conditions" }]}
      />

      <section className="py-[48px] md:py-[64px] bg-white">
        <div className="max-w-4xl mx-auto px-[32px]">
          <h1 className="text-[#003366] text-3xl font-bold mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-gray-400 text-[14px] mb-2">
            Last updated: June 2, 2026
          </p>
          <p className="text-gray-500 text-[14px] mb-10">
            Ujjwal Dental Clinic is operated by Healing Fairy Health Care Pvt. Ltd.
          </p>

          <p className="text-gray-700 text-[15px] leading-[1.8] mb-8">
            These Terms &amp; Conditions govern your use of Ujjwal Dental Clinic's
            services, website, appointment booking, and membership plans. By
            booking an appointment or purchasing a plan, you agree to the terms
            below.
          </p>

          <Section title="1. Appointments & Cancellations">
            <p>
              Appointments can be booked online or by calling the clinic. We
              request at least <strong>24 hours' notice</strong> to cancel or
              reschedule an appointment. Cancellations made with less than 24
              hours' notice, or missed appointments, may be subject to a
              rebooking fee, and any OPD/registration fee paid may be
              non-refundable.
            </p>
            <p>
              Please arrive at least 10 minutes before your scheduled time. The
              clinic reserves the right to reschedule appointments due to
              emergencies or unforeseen circumstances.
            </p>
          </Section>

          <Section title="2. Payments & Fees">
            <p>
              Consultation (OPD) fees and membership payments are collected
              online through our secure payment partner (Razorpay) or at the
              clinic. All prices are listed in Indian Rupees (₹) and are
              inclusive of applicable taxes unless stated otherwise.
            </p>
            <p>
              Fees paid to confirm an appointment or purchase a membership are
              generally non-refundable except where required by law or at the
              clinic's discretion.
            </p>
          </Section>

          <Section title="3. Membership Plans">
            <p>
              Membership plans are valid for the period stated at the time of
              purchase (typically one year) and are{" "}
              <strong>non-transferable</strong> between individuals. Plans are
              valid at all Ujjwal Dental Clinic locations in Sonipat.
            </p>
            <p>
              Membership benefits and discounts <strong>cannot be combined</strong>{" "}
              with other offers, promotions, or third-party insurance unless
              expressly stated. The clinic reserves the right to modify, add, or
              discontinue plans, benefits, or pricing at any time; changes will
              not affect the benefits of an already-active membership for its
              current term.
            </p>
          </Section>

          <Section title="4. Patient Data & Privacy">
            <p>
              We collect and process personal and medical information to provide
              dental care. Your data is handled in accordance with our{" "}
              <a href="/privacy-policy" className="text-accent no-underline hover:underline">
                Privacy Policy
              </a>
              . Payment card details are never stored by the clinic — they are
              processed directly by our payment gateway.
            </p>
          </Section>

          <Section title="5. Limitation of Liability">
            <p>
              Dental treatment outcomes vary between individuals and cannot be
              guaranteed. To the maximum extent permitted by law, Ujjwal Dental
              Clinic is not liable for any indirect or consequential loss arising
              from the use of our website or services. Nothing in these terms
              limits liability that cannot be excluded under applicable law.
            </p>
          </Section>

          <Section title="6. Changes to These Terms">
            <p>
              We may update these Terms &amp; Conditions from time to time. The
              latest version will always be available on this page with the
              updated date shown above.
            </p>
          </Section>

          <Section title="7. Contact Us">
            <p>
              For any questions about these terms, contact us at{" "}
              <a href="tel:+918708362763" className="text-accent no-underline hover:underline">
                +91 8708362763
              </a>{" "}
              or{" "}
              <a
                href="mailto:ujjwaldentalplanet.in@gmail.com"
                className="text-accent no-underline hover:underline"
              >
                ujjwaldentalplanet.in@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>
      </section>
    </>
  );
};

export default TermsPage;
