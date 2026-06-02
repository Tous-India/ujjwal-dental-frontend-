/**
 * Public Membership Plans Page
 *
 * Displays membership plans from backend API.
 * Allows purchase via Razorpay (requires patient login).
 */
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import api from "../../api/axios";
import BreadcrumbBanner from "../../components/public/BreadcrumbBanner";

const PlansPage = () => {
  const [buyDialog, setBuyDialog] = useState(null);
  const [buyForm, setBuyForm] = useState({ name: "", phone: "", email: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const patient = useAuthStore((state) => state.patient);
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);

  // Fetch plans from API
  const { data, isLoading } = useQuery({
    queryKey: ["public", "membership-plans"],
    queryFn: () => api.get("/memberships/plans").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const plans = data?.data?.plans || data?.data || [];
  // The middle plan is highlighted as the recommended ("Most Popular") option.
  const featuredIndex = plans.length ? Math.floor(plans.length / 2) : -1;

  // Handle Buy Now click — opens the checkout modal, prefilling the
  // logged-in patient's details for the payment step.
  const handleBuyClick = (plan) => {
    setBuyDialog(plan);
    setBuyForm({
      name: patient?.name || "",
      phone: patient?.phone || "",
      email: patient?.email || "",
    });
  };

  // Handle purchase with Razorpay
  const handlePurchase = async () => {
    if (!buyForm.name.trim() || !buyForm.phone.trim() || !buyForm.email.trim()) {
      toast.info("Please fill in all fields");
      return;
    }
    if (!/^\d{10}$/.test(buyForm.phone.replace(/\D/g, ""))) {
      toast.info("Please enter a valid 10-digit phone number");
      return;
    }

    setIsProcessing(true);
    try {
      // Create Razorpay order
      const orderRes = await api.post("/payments/razorpay/create-order", {
        planId: buyDialog._id,
        type: "membership",
        isOnlineBooking: true,
      });

      const { order, paymentId, key_id } = orderRes.data.data;

      // Load Razorpay
      const rzp = new window.Razorpay({
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Ujjwal Dental Clinic",
        description: `${buyDialog.name} Membership`,
        order_id: order.id,
        prefill: {
          name: buyForm.name,
          contact: buyForm.phone,
          email: buyForm.email,
        },
        theme: { color: "#006694" },
        handler: async (response) => {
          try {
            // Verify payment
            await api.post("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            });

            // Purchase membership
            await api.post("/memberships/purchase", {
              planId: buyDialog._id,
              paymentId,
              name: buyForm.name,
              phone: buyForm.phone,
              email: buyForm.email,
            });

            toast.success("Membership purchased successfully! Check your email for login details.");
            setBuyDialog(null);
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.warning("Payment cancelled");
          },
        },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (p) => `₹${(p || 0).toLocaleString("en-IN")}`;

  return (
    <>
      <title>Dental Membership Plans | Ujjwal Dental Clinic Sonipat</title>
      <meta
        name="description"
        content="Save with annual dental plans from ₹2,000. Free consultations, X-rays & treatment discounts. Individual & family plans available."
      />
      <meta
        property="og:title"
        content="Dental Membership Plans | Ujjwal Dental Clinic Sonipat"
      />
      <meta
        property="og:description"
        content="Save with annual dental plans from ₹2,000. Free consultations, X-rays & treatment discounts. Individual & family plans available."
      />
      <BreadcrumbBanner
        title="Our Plans"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Plans" }]}
      />

      <section className="py-[48px] md:py-[64px] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <h1
            className="text-[#003366] text-center mb-2"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Dental Membership Plans
          </h1>
          <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto text-base">
            Choose the perfect plan for you and your family. Enjoy exclusive
            discounts and priority care.
          </p>

          {isLoading ? (
            <div className="text-center py-16">
              <CircularProgress sx={{ color: "#f57c00" }} />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg font-semibold">
                No plans available at the moment
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Contact us for membership information
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto items-stretch">
              {plans.map((plan, i) => {
                const featured = i === featuredIndex;
                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-2xl py-8 px-6 flex flex-col bg-white border ${
                      featured
                        ? "border-accent md:scale-[1.03]"
                        : "border-gray-200"
                    }`}
                  >
                    {featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[12px] font-semibold rounded-full px-3 py-1">
                        Most Popular
                      </span>
                    )}

                    {/* Tier badge */}
                    {plan.tier && (
                      <span className="absolute top-4 right-4 bg-[#003366] text-white text-[12px] font-semibold rounded-full px-3 py-0.5 capitalize">
                        {plan.tier}
                      </span>
                    )}

                    {/* Name + description */}
                    <div className="text-center">
                      <h3 className="text-[#003366] text-xl font-bold leading-tight capitalize">
                        {plan.name}
                      </h3>
                      {plan.description && (
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                          {plan.description.replace(/\n/g, " ")}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <p className="text-center mt-4">
                      <span className="font-numbers text-[#003366] text-4xl font-extrabold">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-gray-500 text-sm">/year</span>
                    </p>

                    <div className="border-t border-gray-100 my-5" />

                    {/* Benefits */}
                    <ul className="flex-grow space-y-1">
                      {(plan.features || []).map((feature, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 py-1.5 text-gray-700 text-[14px] leading-snug"
                        >
                          <CheckIcon className="text-accent text-[16px]! mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Buy Now */}
                    <button
                      type="button"
                      onClick={() => handleBuyClick(plan)}
                      className="mt-6 block w-full text-center border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Checkout modal */}
      {buyDialog && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !isProcessing && setBuyDialog(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[#003366] text-xl font-bold capitalize">
                  {buyDialog.name}
                </h3>
                <p className="mt-1">
                  <span className="font-numbers text-[#003366] text-3xl font-extrabold">
                    {formatPrice(buyDialog.price)}
                  </span>
                  <span className="text-gray-500 text-sm">/year</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isProcessing && setBuyDialog(null)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Benefits summary */}
            {buyDialog.features?.length > 0 && (
              <ul className="mt-5 space-y-1.5 max-h-48 overflow-y-auto">
                {buyDialog.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-gray-700 text-[14px] leading-snug"
                  >
                    <CheckIcon className="text-accent text-[16px]! mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Terms snippet */}
            <p className="mt-5 text-[13px] text-gray-400 leading-relaxed">
              Membership is valid for 1 year from purchase, non-transferable, and
              valid at all Ujjwal Dental locations. By proceeding you agree to our{" "}
              <Link to="/terms" className="text-accent no-underline hover:underline">
                Terms &amp; Conditions
              </Link>
              .
            </p>

            {/* Action */}
            <div className="mt-6">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isProcessing && (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  )}
                  {isProcessing
                    ? "Processing..."
                    : `Proceed to Payment — ${formatPrice(buyDialog.price)}`}
                </button>
              ) : (
                <div className="text-center">
                  <Link
                    to="/login"
                    className="w-full inline-block bg-accent hover:bg-accent-dark text-white rounded-xl py-3 text-[15px] font-semibold no-underline transition-colors duration-200"
                  >
                    Login to purchase
                  </Link>
                  <p className="text-[13px] text-gray-400 mt-2">
                    Please log in to your patient account to buy a membership.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
};

export default PlansPage;
