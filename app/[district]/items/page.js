import ItemsPage from "@/app/items/page";

export default function DistrictItemsPage({ params }) {

  const { district } = params;

  return (
    <ItemsPage city={district} />
  );
}