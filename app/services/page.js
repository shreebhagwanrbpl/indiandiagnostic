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
      doc(db, "websites", "indiandiagnostic", "pages", "services"),
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
     <section className="why-service py-5">
  <div className="container">
    <div className="text-center mb-5">
      <span className="sub-title">WHY CHOOSE RAJ BIOSIS</span>

      <h2 className="main-title mt-2">
        Delivering Trusted Diagnostic <br />
        Equipment & Healthcare Excellence
      </h2>

      <p className="why-desc mt-3">
        Raj Biosis provides advanced diagnostic instruments, laboratory
        equipment, reagents, and healthcare solutions trusted by hospitals,
        laboratories, and medical professionals across multiple regions.
      </p>
    </div>

    <div className="row g-4">
      <div className="col-lg-4 col-md-6">
        <div className="why-box">
          <div className="why-icon">✔</div>

          <div>
            <h4>Trusted Healthcare Brand</h4>
            <p>
              Years of experience delivering reliable diagnostic and laboratory
              solutions to healthcare institutions.
            </p>
          </div>
        </div>
      </div>

      <div className="col-lg-4 col-md-6">
        <div className="why-box">
          <div className="why-icon">✔</div>

          <div>
            <h4>Certified Quality Standards</h4>
            <p>
              High-quality instruments and medical products designed to ensure
              precision, safety, and performance.
            </p>
          </div>
        </div>
      </div>

      <div className="col-lg-4 col-md-6">
        <div className="why-box">
          <div className="why-icon">✔</div>

          <div>
            <h4>Advanced Laboratory Equipment</h4>
            <p>
              Modern diagnostic technologies built to support accurate and
              efficient laboratory operations.
            </p>
          </div>
        </div>
      </div>

      <div className="col-lg-4 col-md-6">
        <div className="why-box">
          <div className="why-icon">✔</div>

          <div>
            <h4>Wide Product Range</h4>
            <p>
              Comprehensive solutions including analyzers, reagents, consumables,
              and diagnostic systems.
            </p>
          </div>
        </div>
      </div>

      <div className="col-lg-4 col-md-6">
        <div className="why-box">
          <div className="why-icon">✔</div>

          <div>
            <h4>Fast Supply & Support</h4>
            <p>
              Dedicated customer support and efficient product delivery for
              uninterrupted healthcare services.
            </p>
          </div>
        </div>
      </div>

      <div className="col-lg-4 col-md-6">
        <div className="why-box">
          <div className="why-icon">✔</div>
          <div>
            <h4>Trusted by Professionals</h4>
            <p>
              Preferred by hospitals, diagnostic centers, and laboratories for
              dependable healthcare solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* <Footer /> */}

    </>
  );
}