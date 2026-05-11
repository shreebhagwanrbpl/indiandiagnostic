import About from "@/app/about/page";

export default function DistrictAboutPage({ params }) {

  const { district } = params;

  return (
    <About district={district} />
  );
}