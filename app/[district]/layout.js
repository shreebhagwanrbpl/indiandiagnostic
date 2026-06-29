export async function generateMetadata({
  params,
}) {

  const { district = "jaipur" } =
    await params;

  const districtName =
    district
      .replace(/-/g, " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );

  const url =
    `https://indiandiagnostic.com/${district}`;

  return {
    title: `Diagnostic Lab Equipment in ${districtName} | Indian Diagnostic`,

    description: `Indian Diagnostic provides pathology machines, diagnostic lab equipment, reagents and biomedical products in ${districtName}.`,

    keywords: [
      `diagnostic equipment ${districtName}`,
      `pathology lab equipment ${districtName}`,
      `medical products ${districtName}`,
      `diagnostic center equipment ${districtName}`,
      `hospital equipment ${districtName}`,
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

      description: `Medical and diagnostic products in ${districtName}.`,

      url,

      type: "website",
    },
  };
}

export default function DistrictLayout({
  children,
}) {
  return children;
}