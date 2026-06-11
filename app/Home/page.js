"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {doc, onSnapshot,getDoc} from "firebase/firestore";
import Link from "next/link";
import "./home.css";

const Lottie = dynamic(
  () => import("lottie-react"),
  {
    ssr: false,
  }
);

export default function Home({ city }) {
  const [animationData, setAnimationData] = useState(null);
  const [products, setProducts] = useState([]);
  const [data, setData] = useState({
    title: "Advanced Diagnostic & Laboratory Equipment",
    description: "Reliable medical devices and innovative lab technology for modern healthcare",
    button1Text: "Explore Items",
    button2Text: "Get Quote",
  });

  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) => w.charAt(0).toUpperCase() + w.slice(1)
      )
      .join(" ");

  useEffect(() => {
    fetch("https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json")
      .then(res => res.json())
      .then(data => setAnimationData(data));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDoc(
        doc(db, "websites", "indiandiagnostic", "pages", "products")
      );
      if (snap.exists()) {
        const data = snap.data().products || [];
        const filtered = data
          .filter((item) => item.isPublished)
          .slice(0, 4);
        setProducts(filtered);
      }
    };
    fetchProducts();
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

  const productsCount = useCounter(500);
  const clientsCount = useCounter(200);
  const yearsCount = useCounter(15);
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

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "websites", "indiandiagnostic", "pages", "home"),
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      }
    );

    return () => unsub();
  }, []);
  const makeLink = (path = "") => {
    if (!city) {
      return path || "/";
    }

    return `/${city}${path}`;
  };
  return (
    <>

      {/* 🔥 SECTION 1: HERO */}
      <section className="home-hero">
        <div className="container">
          <div className="row align-items-center">

            <div className="col-md-6">
              <h1 className="hero-title">

                {
                  data.title
                    ?.split(" in ")[0]
                }

                {city && ` in ${city}`}

              </h1>
              <p className="hero-desc">

                {
                  data.description
                    ?.split(" available in ")[0]
                }

                {city && ` available in ${city}`}

              </p>
              <div className="mt-4">
                <Link href={makeLink("/items")}>
                  <button className="btn btn-light me-3 px-4">
                    {/* Explore Items */}
                    {data.button1Text}
                  </button>
                </Link>

                <Link href={makeLink("/contact")}>
                  <button className="btn btn-outline-light px-4">
                    {/* Get Quote */}
                    {data.button2Text}
                  </button>
                </Link>
              </div>
            </div>

            <div className="col-md-6 text-center">
              {animationData && (
                <Lottie animationData={animationData} style={{ height: 350 }} />
              )}
            </div>

          </div>
        </div>
      </section>


      <section className="home-about">
        <div className="container">
          <div className="row align-items-center">

            {/* LEFT IMAGE */}
            <div className="col-md-6 position-relative text-center">
              <div className="img-box">
                <img className="home-img" src="/HomeImg.png" />
              </div>

              <div className="float-card f1">💊</div>
              <div className="float-card f2">🧪</div>
              <div className="float-card f3">🏥</div>
              <div className="float-card f4">✔</div>

            </div>

            {/* RIGHT TEXT */}
            <div className="col-md-6">
              <h6 className="about-tag">ABOUT COMPANY</h6>
              <h2 className="about-title">
                Trusted Partner for Clinical <br /> Instruments & Medical Solutions
              </h2>

              <p className="about-desc">
                Raj Biosis Pvt. Ltd., established in 2009, is a trusted name in the healthcare industry in {city || "India"}.
                We provide high-quality diagnostic instruments, reagents, and medical consumables
                used in hospitals, laboratories, and clinics.
              </p>

              <div className="about-points">
                <span>✔ Advanced Laboratory Instruments</span>
                <span>✔ ISO Certified Quality</span>
                <span>✔ Global Distribution Network</span>
              </div>

              <Link href={makeLink("/about")}>
                <button className="about-btn">
                  Learn More →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 SECTION 3: SERVICES */}
      <section className="home-services">
        <div className="container text-center">
          {/* <h6 className="service-tag">OUR SERVICES</h6> */}
          <h2 className="service-title">What We Offer</h2>
          <div className="row mt-5 g-3">
            {services.slice(0, 4).map((item, i) => (
              <div className="col-12 col-md-3" key={i}>
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

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Why Choose Us</h2>

          <div className="row">
            <div className="col-md-4">
              <div className="p-4 shadow-sm rounded">
                <h5>✔ Certified Quality</h5>
                <p>ISO certified products with trusted performance</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 shadow-sm rounded">
                <h5>🚚 Fast Delivery</h5>
                <p>Quick supply across India</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 shadow-sm rounded">
                <h5>🛠 Support</h5>
                <p>24/7 installation & maintenance support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS PREVIEW ================= */}
      <section className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Featured Products</h2>

          <div className="row">
            {products.map((item, i) => (
              <div className="col-md-3" key={i}>
                <div className="card shadow-sm">

                  <img
                    src={item.image || "/no-image.png"}
                    className="card-img-top"
                    style={{ height: "300px", objectFit: "contain", background: "#f3f4f6" }}
                  />
                  <div className="divider-line"></div>
                  <div className="card-body">
                    <h6>{item.title}</h6>

                    <Link href={makeLink("/items")}>
                      <button className="btn btn-outline-danger btn-sm">
                        View
                      </button>
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ================= TESTIMONIALS ================= */}
      <section className="py-5" style={{ background: "#f8fafc" }}>
        <div className="container text-center">

          {/* Heading */}
          <h2 className="fw-bold mb-5" style={{ fontSize: "32px" }}>
            What Clients Say
          </h2>

          <div className="row g-4">

            {/* Card 1 */}
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="quote-icon">❝</div>
                <p>
                  Best diagnostic equipment provider! Highly reliable and trusted.
                </p>
                <h6>- Hospital Owner</h6>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="quote-icon">❝</div>
                <p>
                  Fast delivery & great service. Always on time support.
                </p>
                <h6>- Lab Technician</h6>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-md-4">
              <div className="testimonial-card">
                <div className="quote-icon">❝</div>
                <p>
                  Highly recommended for labs. Quality products guaranteed.
                </p>
                <h6>- Doctor</h6>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        className="py-5 text-white"
        style={{ background: "linear-gradient(135deg,#1e3c72,#2a5298)" }}
      >
        <div className="container">
          <div className="row align-items-center">
            {/* 🔥 LEFT SIDE (CTA) */}
            <div className="col-md-6 mb-4 mb-md-0">
              <h2 className="fw-bold">
                Need Medical Equipment?
              </h2>

              <p className="mt-3">
                Contact us today for best pricing & support
              </p>

              <div className="mt-4">
                <Link href={makeLink("/contact")}>
                  <button className="btn btn-light me-3 px-4">
                    Get Quote
                  </button>
                </Link>

                {/* <button className="btn btn-outline-light px-4">
            Contact
          </button> */}
              </div>
            </div>

            {/* 🔥 RIGHT SIDE (STATS) */}
            <div className="col-md-6">
              <div className="row text-center">

                <div className="col">
                  <h3 className="fw-bold">{productsCount}+</h3>
                  <p>Products</p>
                </div>

                <div className="col">
                  <h3 className="fw-bold">{clientsCount}+</h3>
                  <p>Clients</p>
                </div>

                <div className="col">
                  <h3 className="fw-bold">{yearsCount}+</h3>
                  <p>Years</p>
                </div>

                <div className="col">
                  <h3 className="fw-bold">24/7</h3>
                  <p>Support</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}