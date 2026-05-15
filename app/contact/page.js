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
  const [stateName, setStateName] = useState("");
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // format city
  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() + w.slice(1)
      )
      .join(" ");

  const citySlug = currentCity;

  const cityName = formatCity(currentCity);

  useEffect(() => {

  const loadDistrict = async () => {

    if (
      !citySlug ||
      citySlug === "jaipur"
    ) {
      return;
    }

    try {

      const snap = await getDoc(
        doc(
          db,
          "websites",
          "globalbiomedicalorg",
          "districts",
          citySlug
        )
      );

      if (snap.exists()) {

        setStateName(
          snap.data()?.state || ""
        );

      }

    } catch (err) {

      console.log(err);

    }

  };

  loadDistrict();

}, [citySlug]);
  // LOAD CONTACT INFO
  useEffect(() => {

    const load = async () => {

      try {

        const snap = await getDoc(
          doc(
            db,
            "websites",
            "indiandiagnostic",
            "pages",
            "contact"
          )
        );

        if (snap.exists()) {
          setContactInfo(
            snap.data().contactInfo || []
          );
        }

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    load();

  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      // validation
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

      // email validation
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(form.email)) {

        setLoading(false);

        return toast.error(
          "Invalid email format"
        );

      }

      // phone validation
      const phoneRegex = /^[6-9]\d{9}$/;

      if (!phoneRegex.test(form.phone)) {

        setLoading(false);

        return toast.error(
          "Invalid phone number"
        );

      }

      const loadingToast =
        toast.loading("Sending message...");

      await addDoc(
        collection(
          db,
          "websitesQueries",
          "indiandiagnostic",
          "contactQueries"
        ),
        {
          name: form.name || "",
          email: form.email || "",
          phone: form.phone || "",
          message: form.message || "",
          subject: form.subject || "",
          city: cityName,
          createdAt: new Date(),
        }
      );

      toast.success(
        "Message sent successfully",
        {
          id: loadingToast,
        }
      );

      // reset
      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        subject: "",
      });

    } catch (err) {

      console.error("Error:", err);

      toast.error("Something went wrong");

    } finally {

      setLoading(false);

    }

  };

  return (
    <>
      <Toaster position="top-right" />

      <section
        style={{ background: "#f8fafc" }}
        className="py-0"
      >

        {/* BANNER */}
        <section className="about-banner">

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

            {/* LEFT */}
            <div className="col-md-4">

              <div className="contact-box h-100">

                <h5 className="mb-4">
                  Contact Information
                </h5>

                {loading ? (

                  <p>Loading...</p>

                ) : contactInfo.length === 0 ? (

                  <p>No contact info found</p>

                ) : (

                  contactInfo.map((item, i) => {

                    const label =
                      item.label?.toLowerCase();

                    let icon = "👉";

                    if (
                      label?.includes("address")
                    ) {
                      icon = "📍";
                    }

                    else if (
                      label?.includes("phone")
                    ) {
                      icon = "📞";
                    }

                    else if (
                      label?.includes("email")
                    ) {
                      icon = "📧";
                    }

                    else if (
                      label?.includes("hour")
                    ) {
                      icon = "⏰";
                    }

                    return (
                      <p key={i}>

                        <strong>
                          {icon} {item.label}:
                        </strong>

                        <br />

{
  label?.includes("address")
    ? stateName
  ? `${cityName}, ${stateName}, India`
  : `${cityName}, India`
    : item.value
}

                      </p>
                    );
                  })

                )}

              </div>

            </div>

            {/* RIGHT */}
            <div className="col-md-8">

              <div className="contact-box">

                <h5 className="mb-4">
                  Send Message
                </h5>

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
                        className="btn btn-dark w-100"
                        disabled={loading}
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

          {/* MAP */}
          <div className="mt-5">

            <iframe
              src={`https://www.google.com/maps?q=${
  stateName
    ? `${cityName}, ${stateName}, India`
    : `${cityName}, India`
}&output=embed`}
              width="100%"
              height="300"
              style={{
                border: 0,
                borderRadius: "15px",
              }}
              loading="lazy"
            />

          </div>

        </div>

      </section>
    </>
  );
}