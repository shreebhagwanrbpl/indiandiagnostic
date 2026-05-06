import Contact from "@/app/contact/page";

export default async function DistrictContactPage({ params }) {

  const { district } = await params;

  return <Contact city={district} />;
}