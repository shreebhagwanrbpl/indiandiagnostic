"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "./comp.css";
import districts from "@/lib/districts.json";

export default function Navbar() {

  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ current URL parts
  const pathParts = pathname.split("/").filter(Boolean);

  // ✅ first URL part
  const firstPart = pathParts[0];

  // ✅ check district exists
  const districtExists = districts.some(
    (item) => item.slug.toLowerCase() === firstPart?.toLowerCase()
  );

  // ✅ district only if valid
  const district = districtExists ? firstPart : "";

  // ✅ dynamic links
  const makeLink = (path = "") => {

    if (!district) {
      return path || "/";
    }

    if (!path) {
      return `/${district}`;
    }

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

          {/* MOBILE MENU BUTTON */}
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* MENU */}
          <div className={`nav-links ${menuOpen ? "show-menu" : ""}`}>

            <Link
              href={makeLink("")}
              className={pathname === makeLink("") ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              href={makeLink("/about")}
              className={pathname.includes("/about") ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href={makeLink("/services")}
              className={pathname.includes("/services") ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Services
            </Link>

            <Link
              href={makeLink("/items")}
              className={pathname.includes("/items") ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Items
            </Link>

            <Link
              href={makeLink("/contact")}
              className={pathname.includes("/contact") ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>

          </div>

        </div>
      </nav>
      <style>{`
      /* ===== MOBILE NAVBAR ===== */

.menu-btn{
  display:none;
  background:none;
  border:none;
  font-size:28px;
  cursor:pointer;
  color:#111;
}

@media(max-width:768px){

  .nav-container{
    position:relative;
  }

  .menu-btn{
    display:block;
  }

  .nav-links{
    position:absolute;
    top:70px;
    right:0;
    width:220px;
    background:#fff;
    border-radius:16px;
    padding:20px;
    display:flex;
    flex-direction:column;
    gap:15px;
    box-shadow:0 10px 30px rgba(0,0,0,0.1);

    opacity:0;
    visibility:hidden;
    transform:translateY(-10px);
    transition:0.3s;
    z-index:999;
  }

  .nav-links.show-menu{
    opacity:1;
    visibility:visible;
    transform:translateY(0);
  }

  .nav-links a{
    width:100%;
  }
}
      `}</style>
    </>
  );
}