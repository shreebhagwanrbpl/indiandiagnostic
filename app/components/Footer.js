"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./comp.css";
import districts from "@/lib/districts.json";


export default function Footer() {
  const pathname = usePathname();
const pathParts = pathname.split("/").filter(Boolean);
const firstPart = pathParts[0];
const districtExists = districts.some(
  (item) => item.slug === firstPart
);

const citySlug = districtExists
  ? firstPart
  : "jaipur";
  
  const formatCity = (name) =>
    name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const city = formatCity(citySlug);

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
           <li><Link href={`/${citySlug}`}>Home</Link></li>
          <li><Link href={`/${citySlug}/about`}>About</Link></li>
          <li><Link href={`/${citySlug}/services`}>Services</Link></li>
          <li><Link href={`/${citySlug}/items`}>Products</Link></li>
          <li><Link href={`/${citySlug}/contact`}>Contact</Link></li>
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
            <p>📍 {city}, Rajasthan</p>
            <p>📞 +91 9876543210</p>
            <p>📧 info@rajbiosis.com</p>

            {/* 🔥 Dynamic Map */}
            <iframe
              src={`https://maps.google.com/maps?q=${city},Rajasthan&output=embed`}
              width="100%"
              height="200"
            />
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Raj Biosis Pvt. Ltd.
        </div>
      </div>
    </footer>
  );
}