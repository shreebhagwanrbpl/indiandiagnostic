export const dynamic =
  "force-static";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
        ],
      },

      {
        userAgent:
          "Googlebot",
        allow: "/",
      },
    ],

    sitemap:
      "https://indiandiagnostic.com/sitemap.xml",

    host:
      "https://indiandiagnostic.com",
  };
}