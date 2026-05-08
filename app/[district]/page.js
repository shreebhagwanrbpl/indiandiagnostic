// import districts from "@/lib/districts.json";
// import Home from "../Home/page";

// export async function generateStaticParams() {
//   return districts.map((item) => ({
//     district: item.slug,
//   }));
// }

// export default async function Page({ params }) {
//   const { district } = await params;

//   const found = districts.find(
//     (item) => item.slug === district.toLowerCase()
//   );

//   if (!found) {
//     return <h1>Not found</h1>;
//   } 
//   return <Home city={found.district} />;
// }

import districts from "@/lib/districts.json";
import Home from "../Home/page";

export async function generateStaticParams() {
  return districts.map((item) => ({
    district: item.slug,
  }));
}

export default async function Page({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district;

  if (!district || typeof district !== "string") {
    return <h1>Invalid district</h1>;
  }

  const found = districts.find(
    (item) =>
      item?.slug?.toLowerCase() === district.toLowerCase()
  );

  if (!found) {
    return <h1>Not found</h1>;
  }

  return <Home city={found.district} />;
}