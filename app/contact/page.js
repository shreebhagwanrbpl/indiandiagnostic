"use client";

import { useState, useEffect } from "react";
import "./contact.css";
import { db } from "@/lib/firebase";
import toast, { Toaster } from "react-hot-toast";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import districts from "@/lib/districts.json";

export default function Contact({ city }) {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    subject: ""
  });

  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentCity = city || "jaipur";
  const districtData = districts.find(
  (d) => d.slug === currentCity
);

  // LOAD CONTACT INFO
useEffect(() => {
  const load = async () => {
    try {
      const snap = await getDoc(
        doc(db, "websites", "indiandiagnostic", "pages", "contact")
      );

      if (snap.exists()) {
        setContactInfo(snap.data().contactInfo || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // ✅ ye add karo
    }
  };

  load();
}, []);
// useEffect(() => {
//   const fetchData = async () => {
//     const data = await getContactData(); // tumhara firebase function
//     setContactInfo(data);
//     setLoading(false);
//   };

//   fetchData();
// }, []);
  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 UPDATED SUBMIT (NO ARRAY, AUTO ID)
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    //  validation (extra safety)
if (!form.name || !form.email || !form.phone || !form.message) {
  setLoading(false);
  return toast.error("Please fill all required fields");
}

// email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(form.email)) {
  setLoading(false);
  return toast.error("Invalid email format");
}

// phone validation (India 10 digit)
const phoneRegex = /^[6-9]\d{9}$/;
if (!phoneRegex.test(form.phone)) {
  setLoading(false);
  return toast.error("Invalid phone number");
}
    const loadingToast = toast.loading("Sending message...");

    await addDoc(collection(db, "websitesQueries","indiandiagnostic", "contactQueries"), {
      name: form.name || "",
      email: form.email || "",
      phone: form.phone || "",
      message: form.message || "",
      subject: form.subject || "",
      createdAt: new Date(),
    });

    toast.success("Message sent successfully", { id: loadingToast });

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
    <section style={{ background: "#f8fafc" }} className="py-0">

      {/* BANNER */}
      <section className="about-banner">
        <div className="banner-content">
          <h1>Contact Us</h1>
          <p>Get in touch with us for medical equipment & support</p>
        </div>
      </section>

      <div className="container py-5">
        <div className="row g-4">

          {/* LEFT */}
<div className="col-md-4">
  <div className="contact-box h-100">
    <h5 className="mb-4">Contact Information</h5>

    {loading ? (
      <p>Loading...</p>   
    ) : contactInfo.length === 0 ? (
      null   
    ) : (
      contactInfo.map((item, i) => {
        const label = item.label?.toLowerCase();

        let icon = "👉";
        if (label?.includes("address")) icon = "📍";
        else if (label?.includes("phone")) icon = "📞";
        else if (label?.includes("email")) icon = "📧";
        else if (label?.includes("hour")) icon = "⏰";

        return (
          <p key={i}>
            <strong>{icon} {item.label}:</strong>
            <br />
           {label?.includes("address")
        ? districtData?.address || `${currentCity}, Rajasthan`
        : item.value}
          </p>
        );
      })
    )}
  </div>
</div>

          {/* RIGHT */}
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
  className="btn btn-dark w-100"
  disabled={loading}
>
  {loading ? "Sending..." : "Send Message"}
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
              districtData?.map || `${currentCity},Rajasthan`
            }&output=embed`}
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "15px" }}
            loading="lazy"
          ></iframe>
        </div>

      </div>
    </section>
  );
}