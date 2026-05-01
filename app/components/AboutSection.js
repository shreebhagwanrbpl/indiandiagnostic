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
const years = useCounter(10);
const clients = useCounter(500);
const quality = useCounter(100);
  return (    
    <section className="about-section">
      <div className="container">
        <div className="row align-items-center">
          {/* LEFT ANIMATION */}
          <div className="col-md-6 position-relative text-center">
            {/* Main Animation */}
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
              Delivering Excellence in <br /> Healthcare Solutions
            </h2>

            <p className="about-desc">
              Raj Biosis is committed to providing high-quality diagnostic 
              equipment and laboratory solutions. Our focus is on innovation,
              precision, and trust.
            </p>

            <div className="about-points">
              <span>✔ Trusted Products</span>
              <span>✔ Certified Quality</span>
              <span>✔ Fast Delivery</span>
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
          Trusted Partner for Clinical Instruments & Medical Consumables
        </h2>

        <p className="content-desc">
          Raj Biosis Pvt. Ltd., established in 2009 in Jaipur, is a trusted 
          healthcare company providing clinical instruments and medical consumables.
        </p>

        <p className="content-desc">
          Our products are widely used in hospitals, laboratories, and clinics, 
          helping professionals work with accuracy and confidence.
        </p>

        <p className="content-desc">
          We focus on quality, reliability, and long-term performance in every product.
        </p>

        {/* POINTS */}
        <div className="row mt-3">
          <div className="col-6">
            <p>✔ Advanced Instruments</p>
            <p>✔ Global Network</p>
            <p>✔ Strong Distribution</p>
          </div>

          <div className="col-6">
            <p>✔ ISO Certified</p>
            <p>✔ Reliable Devices</p>
            <p>✔ Ethical Work</p>
          </div>
        </div>

      </div>

    </div>
  </div>
</section>

    </section>

  );
}