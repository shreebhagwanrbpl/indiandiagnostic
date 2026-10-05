"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import "@/app/contact/contact.css";
import toast, { Toaster } from "react-hot-toast";
import { parsePhoneNumbers, parseEmails, getContactValue } from "@/lib/admin-api";

export default function ContactSection({ city }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    subject: "",
  });

  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const pathname = usePathname();
  const pathParts = (pathname || "").split("/").filter(Boolean);

  const reservedRoutes = ["about", "contact", "items", "services"];
  const district =
    pathParts[0] && !reservedRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const currentCity = city || district || "Jaipur";

  const formatCity = (name = "") =>
    String(name)
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const cityName = formatCity(currentCity);

  /* =====================================================
     LOAD CONTACT INFO VIA SQLITE ADMIN API
  ===================================================== */
  useEffect(() => {
    let isMounted = true;

    const loadContactInfo = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/site-data?type=contact");
        if (res.ok) {
          const json = await res.json();
          const info = json?.data?.contactInfo || json?.contactInfo || (Array.isArray(json?.data) ? json.data : []);
          if (isMounted && Array.isArray(info) && info.length > 0) {
            setContactInfo(info);
            setLoading(false);
            return;
          }
        }

        const pageRes = await fetch("/api/site-data?type=page&page=contact");
        if (pageRes.ok) {
          const pageJson = await pageRes.json();
          const pageInfo = pageJson?.data?.contactInfo || (Array.isArray(pageJson?.data) ? pageJson.data : []);
          if (isMounted && Array.isArray(pageInfo) && pageInfo.length > 0) {
            setContactInfo(pageInfo);
            setLoading(false);
            return;
          }
        }

        if (isMounted) {
          setContactInfo([]);
        }
      } catch (error) {
        console.error("CONTACT INFO LOAD ERROR:", error);
        if (isMounted) {
          setContactInfo([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContactInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =====================================================
     CONTACT DATA & PARSING
  ===================================================== */
  const address = getContactValue(contactInfo, "Address");
  const rawPhone = getContactValue(contactInfo, "Phone");
  const rawEmail = getContactValue(contactInfo, "Email");
  const workingHours = getContactValue(contactInfo, "Working Hours");

  const phoneNumbers = parsePhoneNumbers(rawPhone);
  const emailAddresses = parseEmails(rawEmail);

  /* =====================================================
     HANDLE FORM CHANGE
  ===================================================== */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =====================================================
     SUBMIT QUERY TO /api/contact-query
  ===================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.message) {
      return toast.error("Please fill all required fields");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return toast.error("Invalid email format");
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(form.phone)) {
      return toast.error("Invalid phone number (10 digits starting with 6-9)");
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Sending message...");

    try {
      const response = await fetch("/api/contact-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          subject: form.subject,
          city: cityName,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      toast.success("Message sent successfully", {
        id: loadingToast,
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        subject: "",
      });
    } catch (error) {
      console.error("CONTACT FORM ERROR:", error);
      toast.error(error.message || "Something went wrong", {
        id: loadingToast,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <section
        style={{
          background: "#f8fafc",
        }}
        className="py-0"
      >
        {/* BANNER */}
        <section className="contact-banner">
          <div className="banner-content">
            <span className="page-badge">● GET IN TOUCH</span>
            <h1>Contact Us</h1>
            <p>Get in touch with us for medical equipment &amp; support</p>
          </div>
        </section>

        <div className="container py-5">
          <div className="row g-4">
            {/* LEFT - CONTACT INFORMATION */}
            <div className="col-md-4">
              <div className="contact-box h-100">
                <h5 className="mb-4">Contact Information</h5>

                {loading ? (
                  <p>Loading...</p>
                ) : contactInfo.length === 0 ? (
                  <p>No contact info available</p>
                ) : (
                  <div>
                    {/* DYNAMIC ADDRESS */}
                    {address && <p>📍 {address}</p>}

                    {/* DYNAMIC MULTIPLE PHONE NUMBERS */}
                    {phoneNumbers.length > 0 && (
                      <div style={{ marginBottom: "15px" }}>
                        {phoneNumbers.map((number, index) => (
                          <p key={index} style={{ marginBottom: "8px" }}>
                            <a
                              href={`tel:${number}`}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              📞 {number}
                            </a>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* DYNAMIC MULTIPLE EMAILS */}
                    {emailAddresses.length > 0 && (
                      <div style={{ marginBottom: "15px" }}>
                        {emailAddresses.map((mail, index) => (
                          <p key={index} style={{ marginBottom: "8px" }}>
                            <a
                              href={`mailto:${mail}`}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                              }}
                            >
                              📧 {mail}
                            </a>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* DYNAMIC WORKING HOURS */}
                    {workingHours && (
                      <p>
                        ⏰{" "}
                        {Array.isArray(workingHours)
                          ? workingHours.join(", ")
                          : workingHours}
                      </p>
                    )}

                    {/* OTHER ADMIN FIELDS */}
                    {contactInfo
                      .filter((item) => {
                        const label = item?.label?.trim()?.toLowerCase();
                        return (
                          label !== "address" &&
                          label !== "phone" &&
                          label !== "email" &&
                          label !== "working hours"
                        );
                      })
                      .map((item, index) => {
                        const value = Array.isArray(item.value)
                          ? item.value.join(", ")
                          : item.value;

                        if (!value) return null;

                        return (
                          <p key={index}>
                            👉 {value}
                          </p>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT - SEND MESSAGE */}
            <div className="col-md-8">
              <div className="contact-box">
                <h5 className="mb-4">Send Message</h5>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        className="form-control"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        className="form-control"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        className="form-control"
                        value={form.subject}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <textarea
                        name="message"
                        rows="5"
                        placeholder="Your Message"
                        className="form-control"
                        value={form.message}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-dark w-100"
                        disabled={submitting}
                      >
                        {submitting ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {address && (
            <div className="mt-5">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  address
                )}&output=embed`}
                width="100%"
                height="300"
                loading="lazy"
                style={{
                  border: 0,
                  borderRadius: "10px",
                }}
                title="Google Map"
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
