"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./comp.css"
export default function Navbar() {
  const pathname = usePathname();
  return (
    <>
      <nav className="nav-main">
        <div className="nav-container">
          <div className="logo-box">
           <Link href="/">
                <img src="/logo.png" />
            </Link>
          </div>

          {/* MENU */}
          <div className="nav-links">
          <Link href="/" className={pathname === "/" ? "active" : ""}>Home</Link>

<Link href="/about" className={pathname === "/about/" ? "active" : ""}>About</Link>

<Link href="/services" className={pathname === "/services/" ? "active" : ""}>Services</Link>

<Link href="/items" className={pathname === "/items/" ? "active" : ""}>Items</Link>

<Link href="/contact" className={pathname === "/contact/" ? "active" : ""}>Contact</Link>
{/* <Link 
  href="/contact" 
  className={`${pathname === "/contact" ? "active btn-contact" : "btn-contact"}`}
>
  Contact
</Link> */}
          </div>

        </div>
      </nav>

    </>
  );
}