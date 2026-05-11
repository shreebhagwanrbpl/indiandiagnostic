import Contact from "@/app/contact/page";

export default function DistrictContactPage({ params }) {

  const { district } = params;

  return (
    <Contact city={district} />
  );
}