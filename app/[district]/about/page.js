import AboutSection from "@/app/components/AboutSection";
import districts from "@/lib/districts.json";
import "@/app/about/about.css";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return districts.map((d) => ({
    district: d.slug,
  }));
}

export default async function DistrictAboutPage({ params }) {
  const resolvedParams = await params;
  const district = resolvedParams?.district || "jaipur";

  return (
    <div>
      <section className="about-banner">
        <div className="banner-content">
          <span className="page-badge">● ABOUT US</span>
          <h1>About Raj Biosis</h1>
          <p>Trusted Partner for Diagnostic Instruments &amp; Healthcare Equipment in {district}</p>
        </div>
      </section>
      <AboutSection />
    </div>
  );
}