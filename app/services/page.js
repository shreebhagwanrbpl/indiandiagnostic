"use client";
import "./services.css"
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const icons = ["🧪", "💊", "⚙️", "🔧", "🌍", "📊"];
    useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "websites", "webfirst", "pages", "services"),
      (snap) => {
        if (snap.exists()) {
          setServices(snap.data().services || []);
        }
      }
    );

    return () => unsub();
  }, []);
  return (
    <>
     

      {/* 🔥 BANNER */}
      <section className="services-banner">
        <div className="container text-center">
          <h1>Our Services</h1>
          <p className="text-white">Reliable Healthcare & Diagnostic Solutions</p>
        </div>
      </section>

      {/* 🔥 SERVICES CARDS */}
<section className="services-section">
      <div className="container">
        <div className="row g-4">

          {services.map((item, i) => (
            <div className="col-md-4" key={i}>
              <div className="service-card">

                <div className="icon">
                  {icons[i] || "⚙️"}
                </div>

                <h5>{item.title}</h5>
                <p>{item.desc}</p>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>

      {/* 🔥 WHY CHOOSE US */}
      <section className="why-service">
        <div className="container text-center">
          <h2>Why Choose Us</h2>

          <div className="row mt-4">
            <div className="col-md-4">
              <div className="why-box">✔ Trusted Brand</div>
            </div>

            <div className="col-md-4">
              <div className="why-box">✔ Quality Assurance</div>
            </div>

            <div className="col-md-4">
              <div className="why-box">✔ Fast Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* <Footer /> */}

    </>
  );
}