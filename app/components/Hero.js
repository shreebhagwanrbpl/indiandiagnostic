"use client";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [animationData, setAnimationData] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    fetch("https://assets10.lottiefiles.com/packages/lf20_tutvdkg0.json")
      .then(res => res.json())
      .then(data => setAnimationData(data));
  }, []);

  // 🔥 IMPORTANT: SSR block
  if (!mounted) return null;

  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center">

          {/* LEFT TEXT */}
          <div className="col-md-6">
            <h1 className="hero-title">
              Trusted Diagnostic <br /> Solutions
            </h1>

            <p className="hero-desc">
              Premium medical equipment & lab solutions for modern healthcare.
            </p>

            <div className="mt-4">
              <button className="btn btn-light me-3 px-4">
                Explore Products
              </button>

              <button className="btn btn-outline-light px-4">
                Get Quote
              </button>
            </div>
          </div>

          {/* RIGHT ANIMATION */}
          <div className="col-md-6 text-center">
            {animationData && (
              <Lottie animationData={animationData} style={{ height: 380 }} />
            )}
          </div>

        </div>
      </div>

      <div className="glow glow1"></div>
      <div className="glow glow2"></div>
    </section>
  );
}