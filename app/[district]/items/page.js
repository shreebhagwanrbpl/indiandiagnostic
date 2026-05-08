import districts from "@/lib/districts.json";
import ItemsPage from "@/app/items/page";

export async function generateStaticParams() {
  return districts.map((item) => ({
    district: item.slug,
  }));
}

export default function DistrictItemsPage({ params }) {
  const { district } = params;

  return <ItemsPage city={district} />;
}