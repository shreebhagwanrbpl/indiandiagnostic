// import ItemsPage from "@/app/items/page";

// export default async function DistrictItemsPage({ params }) {
//   const resolvedParams = await params;

//   const district = resolvedParams?.district || "jaipur";

//   return <ItemsPage city={district} />;
// }

import ItemsPage from "@/app/items/page";

export async function generateMetadata({
  params,
}) {
  const district =
    params?.district || "jaipur";

  const districtName =
    district
      .replace(/-/g, " ")
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      );

  const url = `https://indiandiagnostic.com/${district}/items`;

  return {
    title: `Diagnostic Equipment in ${districtName} | Medical Products ${districtName}`,

    description: `Find diagnostic machines, pathology equipment, laboratory instruments and medical products in ${districtName}. Trusted biomedical supplier in ${districtName}.`,

    keywords: [
      `diagnostic equipment in ${districtName}`,
      `medical products in ${districtName}`,
      `pathology lab equipment ${districtName}`,
      `biomedical products ${districtName}`,
      `hospital equipment ${districtName}`,
      `diagnostic machine ${districtName}`,
    ],

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `Diagnostic Equipment in ${districtName}`,
      description: `Medical products and pathology equipment in ${districtName}.`,
      url,
      type: "website",
    },
  };
}

export default async function DistrictItemsPage({
  params,
}) {
  const district =
    params?.district ||
    "jaipur";

  return (
    <ItemsPage
      city={district}
    />
  );
}