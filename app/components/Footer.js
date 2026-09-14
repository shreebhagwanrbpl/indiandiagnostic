"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./comp.css";

export default function Footer() {
  const [stateName, setStateName] = useState("");
  const [contactInfo, setContactInfo] = useState([]);

  const pathname = usePathname();

  const pathParts =
    pathname.split("/").filter(Boolean);

  const firstPart = pathParts[0];

  // =========================================================
  // RESERVED ROUTES
  // =========================================================

  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "services",
  ];

  // =========================================================
  // CITY SLUG
  // =========================================================

  const citySlug =
    firstPart &&
      !reservedRoutes.includes(firstPart)
      ? firstPart
      : "jaipur";

  // =========================================================
  // FORMAT CITY
  // =========================================================

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


  const WEBSITE = "indiandiagnostic";

  // =========================================================
  // CONTACT FIELD FINDER
  // =========================================================

  const getContactValue = (
    label
  ) => {
    const field =
      contactInfo.find(
        (item) =>
          item?.label
            ?.trim()
            ?.toLowerCase() ===
          label
            .trim()
            .toLowerCase()
      );

    return field?.value ?? "";
  };

  // =========================================================
  // LOAD CONTACT INFO
  // =========================================================

  useEffect(() => {
    const loadContact = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            WEBSITE,
            "pages",
            "contact"
          )
        );

        if (snap.exists()) {
          setContactInfo(
            snap.data()?.contactInfo ||
            []
          );
        } else {
          setContactInfo([]);
        }
      } catch (error) {
        console.error(
          "Footer contact load error:",
          error
        );

        setContactInfo([]);
      }
    };

    loadContact();
  }, []);

  // =========================================================
  // LOAD STATE NAME
  // =========================================================

  useEffect(() => {
    const loadDistrict = async () => {
      // Jaipur ka fixed address hai
      if (
        !citySlug ||
        citySlug === "jaipur"
      ) {
        return;
      }

      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            WEBSITE,
            "districts",
            citySlug
          )
        );

        if (snap.exists()) {
          setStateName(
            snap.data()?.state ||
            ""
          );
        }
      } catch (err) {
        console.log(
          "District load error:",
          err
        );
      }
    };

    loadDistrict();
  }, [citySlug]);

  // =========================================================
  // GET CONTACT DATA
  // =========================================================

  const address =
    getContactValue("Address");

  const phone =
    getContactValue("Phone");

  const email =
    getContactValue("Email");

  const workingHours =
    getContactValue(
      "Working Hours"
    );

  // =========================================================
  // PHONE ARRAY
  // =========================================================

  const phoneNumbers = Array.isArray(
    phone
  )
    ? phone.filter(Boolean)
    : phone
      ? [phone]
      : [];

  // =========================================================
  // EMAIL ARRAY SUPPORT
  // =========================================================

  const emailAddresses =
    Array.isArray(email)
      ? email.filter(Boolean)
      : email
        ? [email]
        : [];

  // =========================================================
  // ADDRESS
  // =========================================================

  const finalAddress =
    address ||
    (
      citySlug === "jaipur"
        ? "F-4, 1st Floor, Plot No. 16, D-Block Tagor Nagar, Ajmer-Delhi Bypass Rd, Jaipur, Rajasthan 302021"
        : stateName
          ? `${city}, ${stateName}, India`
          : `${city}, India`
    );

  // =========================================================
  // MAP QUERY
  // =========================================================

  const mapQuery =
    citySlug === "jaipur"
      ? "Raj Biosis Jaipur Rajasthan"
      : finalAddress;

  // =========================================================
  // RENDER
  // =========================================================

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

              <h5>
                Raj Biosis
              </h5>

            </div>

            <p className="footer-desc">
              Trusted partner for
              clinical instruments &
              medical consumables.
              Delivering quality
              healthcare solutions
              since 2009.
            </p>

          </div>

          {/* ========================================= */}
          {/* LINKS */}
          {/* ========================================= */}

          <div className="col-md-2">

            <h6>
              Quick Links
            </h6>

            <ul className="footer-links">

              <li>
                <Link
                  href={`/${citySlug}`}
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href={`/${citySlug}/about`}
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href={`/${citySlug}/services`}
                >
                  Services
                </Link>
              </li>

              <li>
                <Link
                  href={`/${citySlug}/items`}
                >
                  Products
                </Link>
              </li>

              <li>
                <Link
                  href={`/${citySlug}/contact`}
                >
                  Contact
                </Link>
              </li>

            </ul>

          </div>

          {/* ========================================= */}
          {/* PRODUCTS */}
          {/* ========================================= */}

          <div className="col-md-3">

            <h6>
              Products
            </h6>

            <ul className="footer-links">

              <li>
                Hematology Analyzer
              </li>

              <li>
                Biochemistry Analyzer
              </li>

              <li>
                Lab Reagents
              </li>

              <li>
                Blood Collection Tubes
              </li>

            </ul>

          </div>

          {/* ========================================= */}
          {/* CONTACT */}
          {/* ========================================= */}

          <div className="col-md-3">

            <h6>
              Contact
            </h6>

            {/* ===================================== */}
            {/* ADDRESS */}
            {/* ===================================== */}

            {finalAddress && (
              <p>
                📍 {finalAddress}
              </p>
            )}

            {/* ===================================== */}
            {/* MULTIPLE PHONE NUMBERS */}
            {/* ===================================== */}

            {phoneNumbers.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "15px",
                }}
              >
                {phoneNumbers.map(
                  (number, index) => (
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
                  )
                )}
              </div>
            )}

            {/* ===================================== */}
            {/* MULTIPLE EMAILS */}
            {/* ===================================== */}

            {emailAddresses.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "15px",
                }}
              >
                {emailAddresses.map(
                  (mail, index) => (
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
                  )
                )}
              </div>
            )}

            {/* ===================================== */}
            {/* WORKING HOURS */}
            {/* ===================================== */}

            {workingHours && (
              <p>
                ⏰{" "}
                {Array.isArray(workingHours)
                  ? workingHours.join(", ")
                  : workingHours}
              </p>
            )}

            {/* ===================================== */}
            {/* MAP */}
            {/* ===================================== */}

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

          </div>

        </div>

        {/* ============================================= */}
        {/* FOOTER BOTTOM */}
        {/* ============================================= */}

        <div className="footer-bottom">

          ©{" "}
          {new Date().getFullYear()}{" "}
          Raj Biosis Pvt. Ltd.

        </div>

      </div>
    </footer>
  );
}