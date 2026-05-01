"use client";

import AboutSection from "../components/AboutSection";
import "./about.css"

export default function AboutPage() {
  return (
    <>
      <div>
         <section className="about-banner">
        <div className="container banner-content">
          <h1>About Raj Biosis</h1>
          <p>Trusted Partner for Clinical Instruments & Medical Solutions</p>
        </div>
      </section>
        <AboutSection />

            </div>
          </>
        );
      }