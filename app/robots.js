export const dynamic = "force-static";
export default function robots() {

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap:
      "https://indiandiagnostic.com/sitemap.xml",
  };
}


// export default function robots() {
//   return {
//     rules: {
//       userAgent: "*",
//       allow: "/",
//     },
//   };
// }