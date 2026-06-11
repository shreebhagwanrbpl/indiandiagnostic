"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "./comp.css";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "services",
  ];

  const district =
    pathParts[0] &&
      !reservedRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

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

          <div className="logo-box">
            <Link href={makeLink("")}>
              <img
                src="/logo.png"
                alt="logo"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="desktop-links">
            <Link href={makeLink("")}>Home</Link>
            <Link href={makeLink("/about")}>About</Link>
            <Link href={makeLink("/services")}>Services</Link>
            <Link href={makeLink("/items")}>Items</Link>
            <Link href={makeLink("/contact")}>Contact</Link>
          </div>

          {/* Mobile Button */}
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>

        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`mobile-drawer ${menuOpen ? "show-menu" : ""}`}
      >
        <div className="drawer-header">
          <img
            src="/logo.png"
            alt="logo"
          />

          <button
            className="close-btn"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <Link
          href={makeLink("")}
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>

        <Link
          href={makeLink("/about")}
          onClick={() => setMenuOpen(false)}
        >
          About
        </Link>

        <Link
          href={makeLink("/services")}
          onClick={() => setMenuOpen(false)}
        >
          Services
        </Link>

        <Link
          href={makeLink("/items")}
          onClick={() => setMenuOpen(false)}
        >
          Items
        </Link>

        <Link
          href={makeLink("/contact")}
          onClick={() => setMenuOpen(false)}
        >
          Contact
        </Link>
      </div>

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <style>{`
  .menu-btn{
    display:none;
    background:none;
    border:none;
    font-size:28px;
    cursor:pointer;
  }

  .desktop-links{
    display:flex;
    align-items:center;
    gap:35px;
  }

  .desktop-links a{
    text-decoration:none;
    color:#111;
    font-weight:500;
  }

  .mobile-drawer{
    display:none;
  }

  .menu-overlay{
    display:none;
  }

  @media(max-width:768px){

    .desktop-links{
      display:none;
    }

    .menu-btn{
      display:block;
      position:relative;
      z-index:10002;
    }

    .mobile-drawer{
      position:fixed;
      top:0;
      left:0;

      transform:translateX(-100%);

      width:280px;
      max-width:80%;
      height:100vh;

      background:#fff;

      display:flex;
      flex-direction:column;

      padding:20px;
      gap:8px;

      transition:transform .3s ease;

      z-index:10001;

      box-shadow:
        0 0 40px rgba(0,0,0,.15);
    }

    .mobile-drawer.show-menu{
      transform:translateX(0);
    }

    .drawer-header{
      display:flex;
      align-items:center;
      justify-content:space-between;

      padding-bottom:15px;
      margin-bottom:10px;

      border-bottom:1px solid #eee;
    }

    .drawer-header img{
      height:42px;
      width:auto;
    }

    .close-btn{
      width:36px;
      height:36px;

      border:none;
      border-radius:50%;

      background:#f3f4f6;
      cursor:pointer;
    }

    .mobile-drawer a{
      text-decoration:none;
      color:#111;

      padding:12px 14px;

      border-radius:10px;

      font-weight:500;
    }

    .mobile-drawer a:hover{
      background:#eff6ff;
      color:#2563eb;
    }

    .menu-overlay{
      display:block;
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.45);
      z-index:10000;
    }
  }
`}</style>
    </>
  );
}