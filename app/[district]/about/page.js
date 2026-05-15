import About from "@/app/about/page";

export default async function DistrictAboutPage({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  return <About district={district} />;
}