"use client";

import AboutSection from "../components/AboutSection";
import "./about.css"

export default function AboutPage() {
  return (
    <>
      <div>
        <section className="about-banner">
          <div className="banner-content">
            <h1>About Raj Biosis</h1>
            <p>Trusted Partner for Diagnostic Instruments & Healthcare Equipment</p>
          </div>
        </section>
        <AboutSection />

      </div>
    </>
  );
}