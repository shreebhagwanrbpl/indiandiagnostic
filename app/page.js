import HomeSection from "./components/HomeSection";
import { fetchFullCatalogData, getHomeData, getServicesData } from "@/lib/db-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Diagnostic Equipment Supplier in India",
  description:
    "Indian Diagnostic provides diagnostic equipment, pathology machines, laboratory instruments, reagents and medical consumables across India.",
  keywords: [
    "diagnostic equipment supplier",
    "medical equipment India",
    "pathology machines",
    "laboratory instruments",
    "medical consumables",
    "diagnostic products",
    "Indian Diagnostic",
  ],
  alternates: {
    canonical: "https://indiandiagnostic.com",
  },
  openGraph: {
    title: "Diagnostic Equipment Supplier in India | Indian Diagnostic",
    description:
      "Trusted supplier of diagnostic equipment, pathology machines and laboratory instruments across India.",
    url: "https://indiandiagnostic.com",
  },
};

export default async function Home() {
  const [catalog, homeData, servicesData] = await Promise.all([
    fetchFullCatalogData().catch(() => null),
    getHomeData().catch(() => null),
    getServicesData().catch(() => []),
  ]);

  const rawProds = catalog?.products || [];
  const withImages = rawProds.filter((p) => (p.images?.length > 0 || p.image));
  const featured = withImages.length >= 4 ? withImages.slice(0, 8) : rawProds.slice(0, 8);

  return (
    <HomeSection
      initialProducts={featured}
      initialHomeData={homeData}
      initialServices={servicesData}
    />
  );
}
