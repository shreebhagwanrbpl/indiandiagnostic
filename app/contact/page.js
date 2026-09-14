"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import "./contact.css";
import { db } from "@/lib/firebase";
import toast, { Toaster } from "react-hot-toast";
import {
  doc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";

export default function Contact({ city }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    subject: "",
  });

  const [contactInfo, setContactInfo] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const pathname = usePathname();

  const pathParts =
    pathname.split("/").filter(Boolean);

  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "services",
  ];

  const district =
    pathParts[0] &&
      !reservedRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const currentCity =
    district || "jaipur";

  /* =====================================================
     CITY
  ===================================================== */

  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
      )
      .join(" ");

  const citySlug = currentCity;

  const cityName =
    formatCity(currentCity);

  /* =====================================================
     WEBSITE
  ===================================================== */

  const WEBSITE =
    "indiandiagnostic";

  /* =====================================================
     LOAD CONTACT INFO
  ===================================================== */

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        setLoading(true);

        const snap = await getDoc(
          doc(
            db,
            "websites",
            WEBSITE,
            "pages",
            "contact"
          )
        );

        if (snap.exists()) {
          const data =
            snap.data()?.contactInfo || [];

          setContactInfo(data);
        } else {
          setContactInfo([]);
        }
      } catch (error) {
        console.error(
          "CONTACT INFO LOAD ERROR:",
          error
        );

        toast.error(
          "Failed to load contact information"
        );

        setContactInfo([]);
      } finally {
        setLoading(false);
      }
    };

    loadContactInfo();
  }, []);

  /* =====================================================
     GET CONTACT VALUE
  ===================================================== */

  const getContactValue = (
    label
  ) => {
    const field =
      contactInfo.find(
        (item) =>
          item?.label
            ?.trim()
            ?.toLowerCase() ===
          label
            .trim()
            .toLowerCase()
      );

    return field?.value ?? "";
  };

  /* =====================================================
     CONTACT DATA
  ===================================================== */

  const address =
    getContactValue("Address");

  const phone =
    getContactValue("Phone");

  const email =
    getContactValue("Email");

  const workingHours =
    getContactValue(
      "Working Hours"
    );

  /* =====================================================
     PHONE ARRAY
  ===================================================== */

  const phoneNumbers =
    Array.isArray(phone)
      ? phone.filter(Boolean)
      : phone
        ? [phone]
        : [];

  /* =====================================================
     EMAIL ARRAY
  ===================================================== */

  const emailAddresses =
    Array.isArray(email)
      ? email.filter(Boolean)
      : email
        ? [email]
        : [];

  /* =====================================================
     HANDLE FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      /* =========================================
         REQUIRED VALIDATION
      ========================================= */

      if (
        !form.name ||
        !form.email ||
        !form.phone ||
        !form.message
      ) {
        setLoading(false);

        return toast.error(
          "Please fill all required fields"
        );
      }

      /* =========================================
         EMAIL VALIDATION
      ========================================= */

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          form.email
        )
      ) {
        setLoading(false);

        return toast.error(
          "Invalid email format"
        );
      }

      /* =========================================
         PHONE VALIDATION
      ========================================= */

      const phoneRegex =
        /^[6-9]\d{9}$/;

      if (
        !phoneRegex.test(
          form.phone
        )
      ) {
        setLoading(false);

        return toast.error(
          "Invalid phone number"
        );
      }

      /* =========================================
         LOADING TOAST
      ========================================= */

      const loadingToast =
        toast.loading(
          "Sending message..."
        );

      /* =========================================
         SAVE QUERY
      ========================================= */

      await addDoc(
        collection(
          db,
          "websitesQueries",
          WEBSITE,
          "contactQueries"
        ),
        {
          name:
            form.name || "",

          email:
            form.email || "",

          phone:
            form.phone || "",

          message:
            form.message || "",

          subject:
            form.subject || "",

          city:
            cityName,

          createdAt:
            new Date(),
        }
      );

      /* =========================================
         SUCCESS
      ========================================= */

      toast.success(
        "Message sent successfully",
        {
          id: loadingToast,
        }
      );

      /* =========================================
         RESET
      ========================================= */

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        subject: "",
      });
    } catch (error) {
      console.error(
        "CONTACT FORM ERROR:",
        error
      );

      toast.error(
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <Toaster position="top-right" />

      <section
        style={{
          background: "#f8fafc",
        }}
        className="py-0"
      >

        {/* ================================================
            BANNER
        ================================================ */}

        <section className="contact-banner">
          <div className="banner-content">

            <h1>
              Contact Us
            </h1>

            <p>
              Get in touch with us for
              medical equipment & support
            </p>

          </div>
        </section>

        <div className="container py-5">

          <div className="row g-4">

            {/* ============================================
                LEFT - CONTACT INFORMATION
            ============================================ */}

            <div className="col-md-4">

              <div className="contact-box h-100">

                <h5 className="mb-4">
                  Contact Information
                </h5>

                {loading ? (
                  <p>
                    Loading...
                  </p>
                ) : (
                  contactInfo.length ===
                    0 ? (
                    <p>
                      No contact info found
                    </p>
                  ) : (
                    <div>

                      {/* =================================
                          ADDRESS
                      ================================= */}

                      {address && (
                        <p>
                          📍 {address}
                        </p>
                      )}

                      {/* =================================
                          PHONE
                      ================================= */}

                      {phoneNumbers.length >
                        0 && (
                          <div
                            style={{
                              marginBottom:
                                "15px",
                            }}
                          >
                            {phoneNumbers.map(
                              (
                                number,
                                index
                              ) => (
                                <p
                                  key={
                                    index
                                  }
                                  style={{
                                    marginBottom:
                                      "8px",
                                  }}
                                >
                                  <a
                                    href={`tel:${number}`}
                                    style={{
                                      color:
                                        "inherit",
                                      textDecoration:
                                        "none",
                                    }}
                                  >
                                    📞 {number}
                                  </a>
                                </p>
                              )
                            )}
                          </div>
                        )}

                      {/* =================================
                          EMAIL
                      ================================= */}

                      {emailAddresses.length >
                        0 && (
                          <div
                            style={{
                              marginBottom:
                                "15px",
                            }}
                          >
                            {emailAddresses.map(
                              (
                                mail,
                                index
                              ) => (
                                <p
                                  key={
                                    index
                                  }
                                  style={{
                                    marginBottom:
                                      "8px",
                                  }}
                                >
                                  <a
                                    href={`mailto:${mail}`}
                                    style={{
                                      color:
                                        "inherit",
                                      textDecoration:
                                        "none",
                                    }}
                                  >
                                    📧 {mail}
                                  </a>
                                </p>
                              )
                            )}
                          </div>
                        )}

                      {/* =================================
                          WORKING HOURS
                      ================================= */}

                      {workingHours && (
                        <p>
                          ⏰{" "}
                          {Array.isArray(
                            workingHours
                          )
                            ? workingHours.join(
                              ", "
                            )
                            : workingHours}
                        </p>
                      )}

                      {/* =================================
                          OTHER ADMIN FIELDS
                      ================================= */}

                      {contactInfo
                        .filter(
                          (item) => {
                            const label =
                              item?.label
                                ?.trim()
                                ?.toLowerCase();

                            return (
                              label !==
                              "address" &&
                              label !==
                              "phone" &&
                              label !==
                              "email" &&
                              label !==
                              "working hours"
                            );
                          }
                        )
                        .map(
                          (
                            item,
                            index
                          ) => {
                            const value =
                              Array.isArray(
                                item.value
                              )
                                ? item.value.join(
                                  ", "
                                )
                                : item.value;

                            if (!value) {
                              return null;
                            }

                            return (
                              <p
                                key={
                                  index
                                }
                              >
                                👉{" "}
                                {value}
                              </p>
                            );
                          }
                        )}

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ============================================
                RIGHT - SEND MESSAGE
            ============================================ */}

            <div className="col-md-8">

              <div className="contact-box">

                <h5 className="mb-4">
                  Send Message
                </h5>

                <form
                  onSubmit={
                    handleSubmit
                  }
                >

                  <div className="row g-3">

                    {/* NAME */}

                    <div className="col-md-6">

                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        className="form-control"
                        value={
                          form.name
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6">

                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        className="form-control"
                        value={
                          form.email
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                    {/* PHONE */}

                    <div className="col-md-6">

                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        className="form-control"
                        value={
                          form.phone
                        }
                        onChange={
                          handleChange
                        }
                        required
                        pattern="[0-9]{10}"
                      />

                    </div>

                    {/* SUBJECT */}

                    <div className="col-md-6">

                      <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        className="form-control"
                        value={
                          form.subject
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>

                    {/* MESSAGE */}

                    <div className="col-12">

                      <textarea
                        name="message"
                        rows="5"
                        placeholder="Your Message"
                        className="form-control"
                        value={
                          form.message
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                    {/* SUBMIT */}

                    <div className="col-12">

                      <button
                        className="btn btn-dark w-100"
                        disabled={
                          loading
                        }
                      >
                        {loading
                          ? "Sending..."
                          : "Send Message"}
                      </button>

                    </div>

                  </div>

                </form>

              </div>

            </div>

          </div>

          {/* ================================================
              MAP
          ================================================ */}

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
                  borderRadius:
                    "10px",
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