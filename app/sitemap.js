import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    lastModified: new Date(),
  }));

  try {
    const districtSnapshot =
      await adminDb
        .collection("websites")
        .doc("indiandiagnostic")
        .collection("districts")
        .get();

    const districtPromises =
      districtSnapshot.docs.map(
        async (districtDoc) => {
          const districtSlug =
            districtDoc.id;

          const districtPages = [
            {
              url: `${baseUrl}/${districtSlug}`,
              lastModified:
                new Date(),
            },
            {
              url: `${baseUrl}/${districtSlug}/items`,
              lastModified:
                new Date(),
            },
            {
              url: `${baseUrl}/${districtSlug}/about`,
              lastModified:
                new Date(),
            },
            {
              url: `${baseUrl}/${districtSlug}/contact`,
              lastModified:
                new Date(),
            },
            {
              url: `${baseUrl}/${districtSlug}/services`,
              lastModified:
                new Date(),
            },
          ];

          // parallel item fetch
          const itemsSnapshot =
            await adminDb
              .collection(
                "websites"
              )
              .doc(
                "indiandiagnostic"
              )
              .collection(
                "districts"
              )
              .doc(districtSlug)
              .collection(
                "items"
              )
              .get();

          const itemPages =
            itemsSnapshot.docs.map(
              (itemDoc) => ({
                url: `${baseUrl}/${districtSlug}/items/${itemDoc.id}`,
                lastModified:
                  new Date(),
              })
            );

          return [
            ...districtPages,
            ...itemPages,
          ];
        }
      );

    const districtResults =
      await Promise.all(
        districtPromises
      );

    return [
      ...staticPages,
      ...districtResults.flat(),
    ];
  } catch (err) {
    console.error(
      "SITEMAP ERROR:",
      err
    );

    return [];
  }
}