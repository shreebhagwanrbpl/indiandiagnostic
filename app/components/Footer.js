"use client";

import Link from "next/link";
import "./comp.css"
export default function Footer() {
  return (
    <footer className="footer-main">
      <div className="footer-container">

        <div className="row">

          {/* COMPANY */}
          <div className="col-md-4">
            <div className="footer-logo">
              <img src="/logo.png" />
              <h5>Raj Biosis</h5>
            </div>

            <p className="footer-desc">
              Trusted partner for clinical instruments & medical consumables.
              Delivering quality healthcare solutions since 2009.
            </p>
          </div>

          {/* LINKS */}
          <div className="col-md-2">
            <h6>Quick Links</h6>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/items">Products</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* PRODUCTS */}
          <div className="col-md-3">
            <h6>Products</h6>
            <ul className="footer-links">
              <li>Hematology Analyzer</li>
              <li>Biochemistry Analyzer</li>
              <li>Lab Reagents</li>
              <li>Blood Collection Tubes</li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="col-md-3">
            <h6>Contact</h6>
            <p>📍 Jaipur, Rajasthan</p>
            <p>📞 +91 9876543210</p>
            <p>📧 info@rajbiosis.com</p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} Raj Biosis Pvt. Ltd.
        </div>

      </div>

    </footer>
  );
}