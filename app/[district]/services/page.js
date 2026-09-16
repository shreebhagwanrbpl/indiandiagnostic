import Services from "@/app/services/page";
import districts from "@/lib/districts.json";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return districts.map((d) => ({
    district: d.slug,
  }));
}

export default async function DistrictServicesPage({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  return <Services city={district} />;
}