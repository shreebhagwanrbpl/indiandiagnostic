import Services from "@/app/services/page";

export default function DistrictServicesPage({ params }) {

  const { district } = params;

  return (
    <Services city={district} />
  );
}