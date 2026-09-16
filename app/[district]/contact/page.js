import Contact from "@/app/contact/page";
import districts from "@/lib/districts.json";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return districts.map((d) => ({
    district: d.slug,
  }));
}

export default async function DistrictContactPage({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  return <Contact city={district} />;
}