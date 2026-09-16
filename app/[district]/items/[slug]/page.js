import { Suspense } from "react";
import ProductDetailClient from "@/app/items/[slug]/ProductDetailClient";

export const dynamic = "force-static";

export async function generateStaticParams() {
    return [
        { district: "jaipur", slug: "autobio-autolumo-a1860" },
        { district: "delhi", slug: "medical-equipment" },
        { district: "mumbai", slug: "diagnostic-analyzer" },
    ];
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const district = resolvedParams?.district || "India";
    const slug = resolvedParams?.slug || "medical-equipment";

    const cityName = district
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const productName = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
        title: `${productName} in ${cityName} | Indian Diagnostic`,
        description: `Buy ${productName} in ${cityName} at best price. Trusted supplier of biomedical diagnostic equipment and laboratory solutions.`,
    };
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const district = resolvedParams?.district;
    const slug = resolvedParams?.slug;

    return (
        <Suspense fallback={<div style={{ minHeight: "80vh", padding: "100px 20px", textAlign: "center" }}>Loading product...</div>}>
            <ProductDetailClient initialSlug={slug} initialDistrict={district} />
        </Suspense>
    );
}