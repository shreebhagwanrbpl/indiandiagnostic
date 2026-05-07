"use client";
import Lottie from "lottie-react";
import "./comp.css"
import { useEffect, useState } from "react";

export default function AboutSection() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json")
      .then(res => res.json())
      .then(data => setAnimationData(data));
  }, []);
  const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
};
const years = useCounter(17);
const clients = useCounter(10000); 
const quality = useCounter(100);


  return (    
    <section className="about-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 position-relative text-center">
          {animationData && (
            <Lottie animationData={animationData} style={{ height: 420 }} />
        )}
            <div className="floating a1">💊</div>
            <div className="floating a2">🧪</div>
            <div className="floating a3">🏥</div>
            <div className="floating a4">✔</div>

          </div>

          {/* RIGHT TEXT */}
          <div className="col-md-6">
            <h6 className="about-tag">ABOUT US</h6>

            <h2 className="about-title">
              Delivering Excellence in <br /> Diagnostic & Laboratory Technology
            </h2>

            <p className="about-desc">
             Raj Biosis is dedicated to providing advanced diagnostic instruments, laboratory equipment, and healthcare technologies that meet modern medical standards. 
             With a focus on innovation, accuracy, and reliability, we help hospitals, laboratories, and healthcare professionals achieve efficient and precise diagnostic performance.
            </p>

            <div className="about-points">
              <span>✔ Advanced Diagnostic Instruments</span>
              <span>✔ Reliable & Certified Quality Standards</span>
              <span>✔ Innovative Laboratory Technologies</span>
              <span>✔ Trusted by Healthcare Professionals</span>
              <span>✔ Efficient Supply & Support Network</span>


            </div>

            <button className="about-btn">
              Learn More
            </button>
          </div>

        </div>
      </div>

      {/* Glow effect */}
      <div className="about-glow glow-left"></div>
      <div className="about-glow glow-right"></div>

       <section className="about-stats">
        <div className="container text-center">
          <div className="row">

          <div className="col-md-4">
            <h2>{years}+</h2>
            <p>Years Experience</p>
          </div>

          <div className="col-md-4">
            <h2>{clients}+</h2>
            <p>Clients Served</p>
          </div>

          <div className="col-md-4">
            <h2>{quality}%</h2>
            <p>Quality Assurance</p>
          </div>

          </div>
        </div>
      </section>

      <section className="about-content-new">
  <div className="container">
    <div className="row align-items-center">

      {/* LEFT IMAGE / STICKER */}
      <div className="col-md-6 text-center">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/4320/4320337.png" 
          className="about-img"
        />

        {/* floating stickers */}
        <div className="float-icon f1">💉</div>
        <div className="float-icon f2">🧪</div>
       
      </div>

      {/* RIGHT CONTENT */}
      <div className="col-md-6">
        <h2 className="content-title">
          Trusted Partner for Diagnostic Instruments & Healthcare Technology
        </h2>

        <p className="content-desc">
          Established in 2009, Raj Biosis Pvt. Ltd. is a leading provider of advanced diagnostic instruments, laboratory equipment, reagents, and medical consumables for hospitals,
           diagnostic centers, research laboratories, and healthcare institutions.
        </p>

        <p className="content-desc">
         With a strong commitment to quality, innovation, and reliability, we deliver modern healthcare technologies 
         designed to support accurate diagnostics and efficient laboratory performance worldwide.
        </p>

        <p className="content-desc">
          We focus on quality, reliability, and long-term performance in every product.
        </p>

        {/* POINTS */}
        <div className="row mt-3">
          <div className="col-6">
            <p>✔ Advanced Diagnostic & Laboratory Equipment</p>
            <p>✔ High-Quality Reagents & Medical Consumables</p>
            <p>✔ Trusted by Hospitals, Labs & Healthcare Professionals</p>
          </div>

          <div className="col-6">
            <p>✔ Global Network</p>
            <p>✔ ISO Certified Standards & Quality Assurance</p>
            <p>✔ Strong Distribution & Service Network Across Multiple Regions</p>
          </div>
        </div>

      </div>

    </div>
  </div>
</section>

    </section>

  );
}