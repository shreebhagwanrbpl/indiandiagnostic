"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaLinkedinIn, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { parsePhoneNumbers, parseEmails, cleanPhoneForWhatsApp, getContactValue } from "@/lib/admin-api";
import "./comp.css";

export default function Footer() {
  const [contactInfo, setContactInfo] = useState([]);
  const pathname = usePathname();

  const pathParts = (pathname || "").split("/").filter(Boolean);
  const firstPart = pathParts[0];

  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "services",
  ];

  const citySlug =
    firstPart && !reservedRoutes.includes(firstPart)
      ? firstPart
      : "jaipur";

  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
      )
      .join(" ");

  const city = formatCity(citySlug);

  /* =========================================================
     LOAD CONTACT INFO VIA SQLITE ADMIN API
  ========================================================= */
  useEffect(() => {
    let isMounted = true;

    const loadContact = async () => {
      try {
        const res = await fetch("/api/site-data?type=contact");
        if (res.ok) {
          const json = await res.json();
          const info = json?.data?.contactInfo || json?.contactInfo || (Array.isArray(json?.data) ? json.data : []);
          if (isMounted && Array.isArray(info) && info.length > 0) {
            setContactInfo(info);
            return;
          }
        }

        const pageRes = await fetch("/api/site-data?type=page&page=contact");
        if (pageRes.ok) {
          const pageJson = await pageRes.json();
          const pageInfo = pageJson?.data?.contactInfo || (Array.isArray(pageJson?.data) ? pageJson.data : []);
          if (isMounted && Array.isArray(pageInfo) && pageInfo.length > 0) {
            setContactInfo(pageInfo);
            return;
          }
        }
      } catch (error) {
        console.error("Footer contact load error:", error);
      }
    };

    loadContact();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     GET CONTACT DATA
  ========================================================= */
  const address = getContactValue(contactInfo, "Address");
  const rawPhone = getContactValue(contactInfo, "Phone");
  const rawEmail = getContactValue(contactInfo, "Email");
  const workingHours = getContactValue(contactInfo, "Working Hours");

  const phoneNumbers = parsePhoneNumbers(rawPhone);
  const emailAddresses = parseEmails(rawEmail);
  const whatsappNumber = cleanPhoneForWhatsApp(phoneNumbers);

  const finalAddress = address || (city ? `${city}, India` : "");
  const mapQuery = address || (citySlug === "jaipur" ? "Raj Biosis Jaipur Rajasthan" : `${city}, India`);

  return (
    <footer className="footer-main">
      <div className="footer-container">
        <div className="row">
          {/* ========================================= */}
          {/* COMPANY */}
          {/* ========================================= */}
          <div className="col-md-4">
            <div className="footer-logo">
              <img
                src="/logo.png"
                alt="logo"
              />
              <h5>Raj Biosis</h5>
            </div>

            <p className="footer-desc">
              Trusted partner for clinical instruments &amp; medical consumables.
              Delivering quality healthcare solutions across India.
            </p>

            {/* SOCIAL MEDIA ICONS & WHATSAPP */}
            <div className="footer-socials">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon whatsapp"
                  style={{ background: "#25D366", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
              )}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon linkedin"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
            </div>
          </div>

          {/* ========================================= */}
          {/* LINKS */}
          {/* ========================================= */}
          <div className="col-md-2">
            <h6>Quick Links</h6>

            <ul className="footer-links">
              <li>
                <Link href={`/${citySlug}`}>
                  Home
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/about`}>
                  About
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/services`}>
                  Services
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/items`}>
                  Products
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/contact`}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* PRODUCTS CATEGORIES */}
          <div className="col-md-3">
            <h6>Products</h6>

            <ul className="footer-links">
              <li>
                <Link href={`/${citySlug}/items?search=Hematology`}>
                  Hematology Analyzer
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/items?search=Biochemistry`}>
                  Biochemistry Analyzer
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/items?search=Reagent`}>
                  Lab Reagents
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/items?search=Blood`}>
                  Blood Collection Tubes
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/items?search=Rapid`}>
                  Rapid Test Kits
                </Link>
              </li>

              <li>
                <Link href={`/${citySlug}/items?search=ELISA`}>
                  ELISA Kits
                </Link>
              </li>
            </ul>
          </div>

          {/* ========================================= */}
          {/* CONTACT */}
          {/* ========================================= */}
          <div className="col-md-3">
            <h6>Contact</h6>

            {/* DYNAMIC ADDRESS */}
            {finalAddress && (
              <p>📍 {finalAddress}</p>
            )}

            {/* MULTIPLE DYNAMIC PHONE NUMBERS */}
            {phoneNumbers.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "15px",
                }}
              >
                {phoneNumbers.map((number, index) => (
                  <a
                    key={index}
                    href={`tel:${number}`}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    📞 {number}
                  </a>
                ))}
              </div>
            )}

            {/* MULTIPLE DYNAMIC EMAILS */}
            {emailAddresses.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "15px",
                }}
              >
                {emailAddresses.map((mail, index) => (
                  <a
                    key={index}
                    href={`mailto:${mail}`}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    📧 {mail}
                  </a>
                ))}
              </div>
            )}

            {/* WORKING HOURS */}
            {workingHours && (
              <p>
                ⏰{" "}
                {Array.isArray(workingHours)
                  ? workingHours.join(", ")
                  : workingHours}
              </p>
            )}

            {/* MAP */}
            {mapQuery && (
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  mapQuery
                )}&output=embed`}
                width="100%"
                height="200"
                loading="lazy"
                style={{
                  border: 0,
                  borderRadius: "10px",
                }}
                title="Google Maps"
              />
            )}
          </div>
        </div>

        {/* ============================================= */}
        {/* FOOTER BOTTOM */}
        {/* ============================================= */}
        <div className="footer-bottom">
          © {new Date().getFullYear()} Raj Biosis Pvt. Ltd.
        </div>
      </div>
    </footer>
  );
}