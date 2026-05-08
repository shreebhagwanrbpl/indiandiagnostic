import districts from "@/lib/districts.json";
import About from "@/app/about/page";

export async function generateStaticParams() {
  return districts.map((item) => ({
    district: item.slug,
  }));
}

export default function DistrictAboutPage() {
  return <About />;
}