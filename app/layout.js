// import "./globals.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import Script from "next/script";
// import { Toaster } from "react-hot-toast";
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         <Navbar />
//         {children}
//          <Toaster position="top-right" />
//         <Footer />

//         {/* ✅ Correct way */}
//         <Script
//           src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
//           strategy="afterInteractive"
//         />
//       </body>
//     </html>
//   );
// }

// import "./globals.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import Script from "next/script";
// import { Toaster } from "react-hot-toast";

// export const metadata = {
//   metadataBase: new URL(
//     "https://indiandiagnostic.com"
//   ),

//   title: {
//     default:
//       "Indian Diagnostic | Diagnostic Equipment & Medical Products",

//     template:
//       "%s | Indian Diagnostic",
//   },

//   description:
//     "Indian Diagnostic is a trusted supplier of diagnostic equipment, pathology machines, laboratory instruments, reagents and medical consumables across India.",

//   keywords: [
//     "diagnostic equipment",
//     "medical equipment",
//     "pathology machines",
//     "laboratory instruments",
//     "hospital equipment",
//     "medical consumables",
//     "diagnostic products",
//     "Indian Diagnostic",
//   ],

//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//     },
//   },

//   alternates: {
//     canonical:
//       "https://indiandiagnostic.com",
//   },

//   openGraph: {
//     title:
//       "Indian Diagnostic",

//     description:
//       "Trusted supplier of diagnostic equipment, pathology machines, laboratory instruments and medical consumables across India.",

//     url:
//       "https://indiandiagnostic.com",

//     siteName:
//       "Indian Diagnostic",

//     locale: "en_IN",
//     type: "website",
//   },

//   twitter: {
//     card:
//       "summary_large_image",

//     title:
//       "Indian Diagnostic",

//     description:
//       "Trusted supplier of diagnostic equipment and medical products.",
//   },
// };

// export default function RootLayout({
//   children,
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <Navbar />

//         {children}
//         {/* <Toaster position="top-right" /> */}
//         <Footer />

//         <Script
//           src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
//           strategy="afterInteractive"
//         />
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

export const metadata = {
  metadataBase: new URL("https://indiandiagnostic.com"),

  title: {
    default:
      "Indian Diagnostic | Diagnostic Equipment & Medical Products",
    template: "%s | Indian Diagnostic",
  },

  description:
    "Indian Diagnostic is a trusted supplier of diagnostic equipment, pathology machines, laboratory instruments, reagents and medical consumables across India.",

  keywords: [
    "diagnostic equipment",
    "medical equipment",
    "pathology machines",
    "laboratory instruments",
    "hospital equipment",
    "medical consumables",
    "diagnostic products",
    "Indian Diagnostic",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  alternates: {
    canonical: "https://indiandiagnostic.com",
  },

  openGraph: {
    title: "Indian Diagnostic",

    description:
      "Trusted supplier of diagnostic equipment, pathology machines, laboratory instruments and medical consumables across India.",

    url: "https://indiandiagnostic.com",

    siteName: "Indian Diagnostic",

    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Indian Diagnostic",

    description:
      "Trusted supplier of diagnostic equipment and medical products.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        {children}

        {/* <Toaster position="top-right" /> */}

        <Footer />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9N1WZKKHW4"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-9N1WZKKHW4');
          `}
        </Script>

        {/* Bootstrap */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}