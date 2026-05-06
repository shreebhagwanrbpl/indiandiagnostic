import ItemsPage from "@/app/items/page";

export default async function DistrictItemsPage({ params }) {

  const { district } = await params;

  return <ItemsPage city={district} />;
}