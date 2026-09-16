import { Suspense } from "react";
import ProductDetailClient from "./ProductDetailClient";
import { fetchAllProductSlugs } from "@/lib/fetchProductSlugs";

export const dynamic = "force-static";

export async function generateStaticParams() {
    return await fetchAllProductSlugs();
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || "medical-equipment";
    const formattedTitle = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
        title: `${formattedTitle} | Indian Diagnostic`,
        description: `Buy ${formattedTitle} at best price. Leading biomedical and diagnostic equipment supplier in India.`,
    };
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    return (
        <Suspense fallback={<div style={{ minHeight: "80vh", padding: "100px 20px", textAlign: "center" }}>Loading product...</div>}>
            <ProductDetailClient initialSlug={slug} />
        </Suspense>
    );
}