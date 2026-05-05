import districts from "@/lib/districts.json";
import Home from "../Home/page";

export async function generateStaticParams() {
  return districts.map((item) => ({
    district: item.slug,
  }));
}

export default async function Page({ params }) {
  const { district } = await params; // ✅ MUST

  const found = districts.find(
    (item) => item.slug === district.toLowerCase()
  );

  if (!found) {
    return <h1>Not found</h1>;
  }

  return <Home city={found.district} />;
}