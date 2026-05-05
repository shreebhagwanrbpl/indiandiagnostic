import districts from "@/lib/districts.json";

export default function Page({ params }) {
  const districtParam = params?.district;

  const found = districts.find(
    (item) => item.slug === districtParam?.toLowerCase()
  );

  if (!found) {
    return <h1>District not found</h1>;
  }

  return (
    <div>
      <h1>Diagnostic Lab in {found.district}</h1>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const district = params?.district;

  return {
    title: `Lab in ${district}`,
  };
}