// import Navbar from "./components/Navbar";
// import HomeSection from "./Home/page";
// import WhyChoose from "./components/WhyChoose";

// import Footer from "./components/Footer";

// export default function Home({ city }) {
//   return (
//     <>
//       <HomeSection />
//     </>
//   );
// }

import HomeSection from "./Home/page";

export const metadata = {
  title:
    "Diagnostic Equipment Supplier in India",

  description:
    "Indian Diagnostic provides diagnostic equipment, pathology machines, laboratory instruments, reagents and medical consumables across India.",

  keywords: [
    "diagnostic equipment supplier",
    "medical equipment India",
    "pathology machines",
    "laboratory instruments",
    "medical consumables",
    "diagnostic products",
    "Indian Diagnostic",
  ],

  alternates: {
    canonical:
      "https://indiandiagnostic.com",
  },

  openGraph: {
    title:
      "Diagnostic Equipment Supplier in India | Indian Diagnostic",

    description:
      "Trusted supplier of diagnostic equipment, pathology machines and laboratory instruments across India.",

    url:
      "https://indiandiagnostic.com",
  },
};

export default function Home() {
  return (
    <>
      <HomeSection />


    </>
  );
}