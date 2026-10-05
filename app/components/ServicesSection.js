"use client";

import "@/app/services/services.css";
import { useEffect, useState } from "react";

export default function ServicesSection({ city }) {
  const [services, setServices] = useState([]);
  const icons = ["🧪", "💊", "⚙️", "🔧", "🌍", "📊"];

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const res = await fetch("/api/site-data?type=services");
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.services || json?.services || (Array.isArray(json?.data) ? json.data : []);
          if (isMounted && Array.isArray(list) && list.length > 0) {
            setServices(list);
            return;
          }
        }

        const pageRes = await fetch("/api/site-data?type=page&page=services");
        if (pageRes.ok) {
          const pageJson = await pageRes.json();
          const pageList = pageJson?.data?.services || (Array.isArray(pageJson?.data) ? pageJson.data : []);
          if (isMounted && Array.isArray(pageList) && pageList.length > 0) {
            setServices(pageList);
          }
        }
      } catch (err) {
        console.warn("Services load error:", err);
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* 🔥 BANNER */}
      <section className="services-banner">
        <div className="banner-content text-center">
          <span className="page-badge">● OUR SERVICES</span>
          <h1>Diagnostic &amp; Lab Services</h1>
          <p className="text-white">Reliable Healthcare &amp; Diagnostic Solutions</p>
        </div>
      </section>

      {/* 🔥 SERVICES CARDS */}
      {services.length > 0 && (
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
      )}

      {/* 🔥 WHY CHOOSE US */}
      <section className="why-service py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="sub-title">WHY CHOOSE RAJ BIOSIS</span>
            <h2 className="main-title mt-2">
              Delivering Trusted Diagnostic <br />
              Equipment &amp; Healthcare Excellence
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
                  <h4>Fast Supply &amp; Support</h4>
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
    </>
  );
}
