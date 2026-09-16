import HomeSection from "@/app/components/HomeSection";
import districts from "@/lib/districts.json";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return districts.map((d) => ({
    district: d.slug,
  }));
}

export default async function Page({ params }) {
  const resolvedParams = await params;

  const district =
    resolvedParams?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  return <HomeSection city={city} />;
}
