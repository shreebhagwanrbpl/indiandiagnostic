import ItemsPage from "@/app/items/page";

export default async function DistrictItemsPage({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  return <ItemsPage city={district} />;
}