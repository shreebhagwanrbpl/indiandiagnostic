"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { db } from "@/lib/firebase";

import {
  doc,
  getDoc
} from "firebase/firestore";

export default function Page({ params }) {

  const [found, setFound] = useState(null);

const resolvedParams = use(params);

const district =
  resolvedParams?.district || "";

const product =
  resolvedParams?.product || "";

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const snap = await getDoc(
          doc(
            db,
            "websites",
            "indiandiagnostic",
            "pages",
            "products"
          )
        );

        const products =
          snap.data()?.products || [];

        const matched =
          products.find(
            (p) =>
              p.title
                .toLowerCase()
                .replace(/\s+/g, "-") === product
          );

        setFound(matched || null);

      } catch (err) {

        console.error(err);

      }
    };

    fetchProduct();

  }, [product]);

  if (!found) {
    return <h1>Loading...</h1>;
  }

  const city =
    district.replace(/-/g, " ");

  return (
    <div style={{ padding: "120px 20px" }}>

      <h1>
        {found.title} in {city}
      </h1>

      <p>{found.desc}</p>

      <img
        src={found.image || "/no-image.png"}
        width="300"
        alt={found.title}
      />

    </div>
  );
}