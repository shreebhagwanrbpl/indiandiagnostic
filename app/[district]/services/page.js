import districts from "@/lib/districts.json";
import Services from "@/app/services/page";

export async function generateStaticParams() {
  return districts.map((item) => ({
    district: item.slug,
  }));
}

export default function DistrictServicesPage() {
  return <Services />;
}