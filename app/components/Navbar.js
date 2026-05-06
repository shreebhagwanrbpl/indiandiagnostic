"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./comp.css";
import districts from "@/lib/districts.json";

export default function Navbar() {

  const pathname = usePathname();

  // ✅ current URL parts
  const pathParts = pathname.split("/").filter(Boolean);

  // ✅ first URL part
  const firstPart = pathParts[0];

  // ✅ check district exists in districts.json
  const districtExists = districts.some(
    (item) => item.slug.toLowerCase() === firstPart?.toLowerCase()
  );

  // ✅ district only if valid
  const district = districtExists ? firstPart : "";

  // ✅ dynamic links
  const makeLink = (path = "") => {

    // if no district
    if (!district) {
      return path || "/";
    }

    // homepage
    if (!path) {
      return `/${district}`;
    }

    // inner pages
    return `/${district}${path}`;
  };

  return (
    <>
      <nav className="nav-main">
        <div className="nav-container">

          {/* LOGO */}
          <div className="logo-box">
            <Link href={makeLink("")}>
              <img src="/logo.png" alt="logo" />
            </Link>
          </div>

          {/* MENU */}
          <div className="nav-links">

            <Link
              href={makeLink("")}
              className={
                pathname === makeLink("")
                  ? "active"
                  : ""
              }
            >
              Home
            </Link>

            <Link
              href={makeLink("/about")}
              className={
                pathname.includes("/about")
                  ? "active"
                  : ""
              }
            >
              About
            </Link>

            <Link
              href={makeLink("/services")}
              className={
                pathname.includes("/services")
                  ? "active"
                  : ""
              }
            >
              Services
            </Link>

            <Link
              href={makeLink("/items")}
              className={
                pathname.includes("/items")
                  ? "active"
                  : ""
              }
            >
              Items
            </Link>

            <Link
              href={makeLink("/contact")}
              className={
                pathname.includes("/contact")
                  ? "active"
                  : ""
              }
            >
              Contact
            </Link>

          </div>

        </div>
      </nav>
    </>
  );
}