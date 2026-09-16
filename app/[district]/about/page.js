import About from "@/app/about/page";
import districts from "@/lib/districts.json";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return districts.map((d) => ({
    district: d.slug,
  }));
}

export default async function DistrictAboutPage({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  return <About district={district} />;
}