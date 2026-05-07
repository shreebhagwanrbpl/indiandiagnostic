import districts from "@/lib/districts.json";
import Home from "../Home/page";

export async function generateStaticParams() {
  return districts.map((item) => ({
    district: item.slug,
  }));
}

export default async function Page({ params }) {
  const { district } = await params;

  const found = districts.find(
    (item) => item.slug === district.toLowerCase()
  );

  if (!found) {
    return <h1>Not found</h1>;
  }

  //   if (!found) {
  //   return (
  //     <div>
  //       <Home city="India" />

  //       <div
  //         style={{
  //           position: "fixed",
  //           top: "110px",
  //           left: "50%",
  //           transform: "translateX(-50%)",
  //           background: "#fff",
  //           padding: "18px 22px",
  //           borderRadius: "14px",
  //           boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  //           zIndex: 9999,
  //           minWidth: "320px",
  //           border: "1px solid #eee",
  //         }}
  //       >
  //         <p
  //           style={{
  //             color: "#d32f2f",
  //             fontWeight: "600",
  //             marginBottom: "10px",
  //           }}
  //         >
  //           ⚠️ District spelling seems incorrect.
  //         </p>

  //         {suggestions.length > 0 && (
  //           <div>
  //             <p
  //               style={{
  //                 fontSize: "14px",
  //                 marginBottom: "8px",
  //                 color: "#555",
  //               }}
  //             >
  //               Did you mean:
  //             </p>

  //             <div
  //               style={{
  //                 display: "flex",
  //                 flexWrap: "wrap",
  //                 gap: "10px",
  //               }}
  //             >
  //               {suggestions.slice(0, 5).map((item) => (
  //                 <Link
  //                   key={item.slug}
  //                   href={`/${item.slug}`}
  //                   style={{
  //                     padding: "8px 14px",
  //                     background: "#f5f5f5",
  //                     borderRadius: "8px",
  //                     textDecoration: "none",
  //                     color: "#111",
  //                     fontWeight: "500",
  //                     transition: "0.3s",
  //                   }}
  //                 >
  //                   {item.district}
  //                 </Link>
  //               ))}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  return <Home city={found.district} />;
}