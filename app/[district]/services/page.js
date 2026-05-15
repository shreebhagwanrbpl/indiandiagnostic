import Services from "@/app/services/page";

export default async function DistrictServicesPage({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  return <Services city={district} />;
}