import districts from "@/lib/districts.json";

export const dynamic = "force-static";

export default async function sitemap() {
  const baseUrl = "https://indiandiagnostic.com";

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

  const districtPages = districts.flatMap((d) => [
    {
      url: `${baseUrl}/${d.slug}`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/${d.slug}/items`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/${d.slug}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/${d.slug}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/${d.slug}/services`,
      lastModified: new Date(),
    },
  ]);

  return [...staticPages, ...districtPages];
}