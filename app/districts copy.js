import Home from "../Home/page";

export default function Page({ params }) {

  const district = params?.district || "jaipur";

  // format city
  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  return (
    <Home city={city} />
  );
}

export async function generateMetadata({ params }) {

  const district = params?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  return {
    title: `Diagnostic Lab in ${city} | Raj Biosis`,
    description: `Best diagnostic lab services in ${city}. Medical equipment, analyzers, reagents and healthcare solutions.`,

    keywords: [
      `Diagnostic Lab in ${city}`,
      `Medical Equipment ${city}`,
      `Lab Equipment ${city}`,
      `Pathology Lab ${city}`,
      `Diagnostic Services ${city}`,
    ],
  };
}