"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaInstagram, FaLinkedinIn, FaFacebookF } from "react-icons/fa";
import "./comp.css";

export default function Footer() {

  const [stateName, setStateName] =
    useState("");

  const pathname = usePathname();

  const pathParts =
    pathname.split("/").filter(Boolean);

  const firstPart = pathParts[0];

  // reserved routes
  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "services",
  ];

  // city slug
  const citySlug =
    firstPart &&
    !reservedRoutes.includes(firstPart)
      ? firstPart
      : "jaipur";

  // format city
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

  // LOAD STATE NAME
  useEffect(() => {

    const loadDistrict = async () => {

      // skip jaipur
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
            "globalbiomedicalorg",
            "districts",
            citySlug
          )
        );

        if (snap.exists()) {

          setStateName(
            snap.data()?.state || ""
          );

        }

      } catch (err) {

        console.log(err);

      }

    };

    loadDistrict();

  }, [citySlug]);

  return (
    <footer className="footer-main">

      <div className="footer-container">

        <div className="row">

          {/* COMPANY */}
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
              clinical instruments &amp;
              medical consumables.
              Delivering quality
              healthcare solutions
              since 2009.
            </p>

            {/* SOCIAL MEDIA ICONS */}
            <div className="footer-socials">
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

          {/* LINKS */}
          <div className="col-md-2">

            <h6>
              Quick Links
            </h6>

            <ul className="footer-links">

              <li>
                <Link href={`/${citySlug}`}>
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

          {/* PRODUCTS CATEGORIES */}
          <div className="col-md-3">

            <h6>
              Products
            </h6>

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

          {/* CONTACT */}
          <div className="col-md-3">

            <h6>
              Contact
            </h6>

            <p>
              📍{" "}

              {citySlug === "jaipur"
                ? "F-4, 1st Floor, Plot No. 16, D-Block Tagor Nagar, Ajmer-Delhi Bypass Rd, Jaipur, Rajasthan 302021"
                : stateName
                  ? `${city}, ${stateName}, India`
                  : `${city}, India`}
            </p>

            <p>
              📞 +91 9876543210
            </p>

            <p>
              📧 info@rajbiosis.com
            </p>

            {/* MAP */}
            <iframe
              src={`https://maps.google.com/maps?q=${
                citySlug === "jaipur"
                  ? "Raj Biosis Jaipur Rajasthan"
                  : stateName
                    ? `${city}, ${stateName}, India`
                    : `${city}, India`
              }&output=embed`}
              width="100%"
              height="200"
              loading="lazy"
            />

          </div>

        </div>

        <div className="footer-bottom">

          © {new Date().getFullYear()}
          {" "}
          Raj Biosis Pvt. Ltd.

        </div>

      </div>

    </footer>
  );
}