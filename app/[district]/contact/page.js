import districts from "@/lib/districts.json";
import Contact from "@/app/contact/page";

export async function generateStaticParams() {
  return districts.map((item) => ({
    district: item.slug,
  }));
}

export default function DistrictContactPage({ params }) {
  const { district } = params;

  return <Contact city={district} />;
}