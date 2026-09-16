import { Suspense } from "react";
import ProductDetailClient from "@/app/items/[slug]/ProductDetailClient";
import { fetchProductBySlug } from "@/lib/data-fetcher";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const district = resolvedParams?.district || "India";
    const rawSlug = resolvedParams?.slug || "";
    const slug = decodeURIComponent(rawSlug);
    const product = await fetchProductBySlug(slug);

    const cityName = district
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    if (!product) {
        return {
            title: `Product Not Found in ${cityName} | Indian Diagnostic`,
            description: "The requested medical diagnostic product is not available.",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const title = product.title || product.name || "Medical Equipment";
    const desc = product.desc || product.description || `Buy ${title} in ${cityName} at best price. Trusted supplier of biomedical diagnostic equipment and laboratory solutions.`;

    return {
        title: `${title} in ${cityName} | Indian Diagnostic`,
        description: desc.slice(0, 160),
        openGraph: {
            title: `${title} in ${cityName} | Indian Diagnostic`,
            description: desc.slice(0, 160),
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        },
    };
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const district = resolvedParams?.district;
    const rawSlug = resolvedParams?.slug || "";
    const slug = decodeURIComponent(rawSlug);
    const initialProduct = await fetchProductBySlug(slug);

    if (!initialProduct && slug) {
        return (
            <div style={{
                minHeight: "75vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 20px",
                textAlign: "center",
                background: "#f8fafc",
            }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔍</div>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "10px" }}>
                    Product Not Found
                </h1>
                <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "480px", marginBottom: "24px" }}>
                    The product you are looking for is currently unavailable or has been removed.
                </p>
                <Link
                    href="/items"
                    style={{
                        padding: "12px 28px",
                        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                        color: "#ffffff",
                        borderRadius: "25px",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "15px",
                    }}
                >
                    Browse All Products
                </Link>
            </div>
        );
    }

    return (
        <Suspense fallback={<div style={{ minHeight: "80vh", padding: "100px 20px", textAlign: "center" }}>Loading product...</div>}>
            <ProductDetailClient initialSlug={slug} initialDistrict={district} initialProduct={initialProduct} />
        </Suspense>
    );
}