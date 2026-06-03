import { adminDb } from "@/lib/firebase-admin";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function sitemap() {
  const baseUrl =
    "https://indiandiagnostic.com";

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/services",
    "/items",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified:
      new Date(),
  }));

  try {
    const snapshot =
      await adminDb
        .collection("websites")
        .doc("indiandiagnostic")
        .collection("districts")
        .get();

    console.log(
      "TOTAL DISTRICTS:",
      snapshot.size
    );

    const districtPages =
      snapshot.docs.flatMap(
        (doc) => {
          const slug =
            doc.id;

          return [
            {
              url: `${baseUrl}/${slug}`,
            },
            {
              url: `${baseUrl}/${slug}/items`,
            },
            {
              url: `${baseUrl}/${slug}/about`,
            },
            {
              url: `${baseUrl}/${slug}/contact`,
            },
            {
              url: `${baseUrl}/${slug}/services`,
            },
          ];
        }
      );

    return [
      ...staticPages,
      ...districtPages,
    ];
  } catch (err) {
    console.error(
      "SITEMAP ERROR:",
      err
    );

    return [
      {
        url:
          "https://indiandiagnostic.com/error",
      },
    ];
  }
}