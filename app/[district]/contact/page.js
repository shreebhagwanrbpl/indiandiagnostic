import Contact from "@/app/contact/page";

export default async function DistrictContactPage({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  return <Contact city={district} />;
}