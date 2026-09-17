"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import {
    db,
    doc,
    getDoc,
    getDocs,
    addDoc,
    collection,
} from "@/lib/firebase";

import toast, { Toaster } from "react-hot-toast";
import styles from "./page.module.css";
import { getCache, setCache } from "@/lib/productsCache";
import { fetchProductBySlug, slugify, isProductVisibleOnCurrentSite } from "@/lib/data-fetcher";

const WEBSITE = "indiandiagnostic";

export default function ProductDetailClient({ initialSlug, initialDistrict, initialProduct }) {
    const params = useParams();
    const pathname = usePathname();

    const slug = initialSlug || params?.slug || "";
    const districtParam = initialDistrict || params?.district || "";

    const [product, setProduct] = useState(initialProduct || null);
    const [loading, setLoading] = useState(!initialProduct);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedImage, setSelectedImage] = useState(
        initialProduct?.images?.[0] || initialProduct?.image || ""
    );
    const [selectedMedia, setSelectedMedia] = useState("image");
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const cardRef = useRef(null);

    const pathParts = (pathname || "").split("/").filter(Boolean);
    const reservedRoutes = ["about", "contact", "items", "services"];

    const district = districtParam || (
        pathParts[0] && !reservedRoutes.includes(pathParts[0])
            ? pathParts[0]
            : ""
    );

    const city = district
        ? district
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "India";

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }

        if (initialProduct && isProductVisibleOnCurrentSite(initialProduct)) {
            setProduct(initialProduct);
            setSelectedImage(initialProduct.images?.[0] || initialProduct.image || "");
            setLoading(false);
            return;
        }

        if (!slug) return;

        const loadProduct = async () => {
            setLoading(true);
            try {
                const decodedSlug = decodeURIComponent(slug);

                // Try cache first
                const cached = await getCache();
                if (cached && cached.length > 0) {
                    const foundInCache = cached.find((p) => {
                        const pSlug = p.slug?.trim() || slugify(p.title || p.name || "");
                        return pSlug === decodedSlug || slugify(pSlug) === slugify(decodedSlug);
                    });
                    if (foundInCache && isProductVisibleOnCurrentSite(foundInCache)) {
                        setProduct(foundInCache);
                        setSelectedImage(foundInCache.images?.[0] || foundInCache.image || "");
                        setLoading(false);
                    }
                }

                // Fetch from catalog API
                const found = await fetchProductBySlug(decodedSlug, true);
                if (found && isProductVisibleOnCurrentSite(found)) {
                    setProduct(found);
                    setSelectedImage(found.images?.[0] || found.image || "");
                } else {
                    setProduct(null);
                }
            } catch (err) {
                console.error("Error fetching product detail:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [slug, initialProduct]);

    const productName =
        product?.title ||
        product?.instrument ||
        product?.model ||
        "Laboratory Equipment";

    const handleSubmit = async () => {
        if (!email.trim() || !phone.trim()) {
            toast.error("Please fill all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email");
            return;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            toast.error("Please enter a valid 10 digit mobile number");
            return;
        }

        const loadingToast = toast.loading("Submitting...");

        try {
            await addDoc(
                collection(db, "websitesQueries", WEBSITE, "productQueries"),
                {
                    productName,
                    email,
                    phone,
                    city,
                    createdAt: new Date(),
                }
            );

            toast.success("Query submitted successfully", {
                id: loadingToast,
            });

            setEmail("");
            setPhone("");
        } catch (error) {
            console.error("Query submit error:", error);
            toast.error("Something went wrong", {
                id: loadingToast,
            });
        }
    };

    const handleDownloadPDF = async () => {
        if (!product || isGeneratingPDF) return;

        const toastId = toast.loading("Generating product PDF brochure...");
        setIsGeneratingPDF(true);

        try {
            const { generateProductPDF } = await import("@/lib/generateProductPDF");
            await generateProductPDF(product, selectedImage, city);
            toast.success("PDF Brochure Downloaded!", { id: toastId });
        } catch (err) {
            console.error("PDF generation error:", err);
            toast.error("Failed to generate PDF. Please try again.", { id: toastId });
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (loading) {
        return (
            <section className={styles.productDetailPage}>
                <div className="container">
                    <div className={styles.productCardWrap}>
                        <div className="row align-items-center">
                            <div className="col-lg-5">
                                <div className={styles.skeletonImage}></div>
                            </div>
                            <div className="col-lg-7">
                                <div className={styles.skeletonTitle}></div>
                                <div className={styles.skeletonText}></div>
                                <div className={styles.skeletonText}></div>
                                <div className={styles.skeletonText}></div>
                                <div className={styles.skeletonBtn}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!product) {
        return (
            <section className={styles.productDetailPage}>
                <div className="container">
                    <div className={styles.productCardWrap}>
                        <h2>Product Not Found</h2>
                        <p>The requested product could not be found.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <Toaster position="top-right" />

            <section className={styles.productDetailPage}>
                <div className="container">
                    <div className={styles.productCardWrap} ref={cardRef}>
                        <div className="row align-items-center">
                            {/* IMAGE SECTION */}
                            <div className="col-lg-5">
                                <div className={styles.productImageBox}>
                                    {selectedMedia === "image" && (
                                        <img
                                            src={selectedImage || "/no-image.png"}
                                            alt={product.title || productName}
                                            className={styles.productDetailImage}
                                        />
                                    )}

                                    {selectedMedia === "video" && product.video && (
                                        <video
                                            controls
                                            width="100%"
                                            className={styles.productVideo}
                                        >
                                            <source
                                                src={product.video}
                                                type="video/mp4"
                                            />
                                        </video>
                                    )}
                                </div>

                                {/* THUMBNAILS */}
                                <div className={styles.thumbnailGallery}>
                                    {(product.images?.length
                                        ? product.images
                                        : product.image
                                            ? [product.image]
                                            : []
                                    ).map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`thumb-${index}`}
                                            className={`${styles.thumbnailItem} ${
                                                selectedImage === img && selectedMedia === "image"
                                                    ? styles.active
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                setSelectedImage(img);
                                                setSelectedMedia("image");
                                            }}
                                        />
                                    ))}

                                    {product.video && (
                                        <div
                                            className={`${styles.mediaThumb} ${
                                                selectedMedia === "video" ? styles.active : ""
                                            }`}
                                            onClick={() => setSelectedMedia("video")}
                                        >
                                            ▶<span>Video</span>
                                        </div>
                                    )}

                                    {product.pdf && (
                                        <a
                                            href={product.pdf}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.mediaThumb}
                                        >
                                            📄<span>Document</span>
                                        </a>
                                    )}

                                    <div
                                        className={`${styles.mediaThumb} ${styles.pdfThumbBtn}`}
                                        onClick={handleDownloadPDF}
                                        title="Download Product PDF"
                                        data-html2canvas-ignore="true"
                                    >
                                        📥<span>Save PDF</span>
                                    </div>
                                </div>
                            </div>

                            {/* PRODUCT CONTENT */}
                            <div className="col-lg-7">
                                <div className={styles.productContent}>
                                    <h1>{productName}</h1>
                                    {product.desc && (
                                        <p className={styles.productDesc}>{product.desc}</p>
                                    )}

                                    <div className={styles.productInfoList}>
                                        {product.price && (
                                            <p><b>Price:</b> ₹{product.price}</p>
                                        )}
                                        {product.brand && (
                                            <p><b>Brand:</b> {product.brand}</p>
                                        )}
                                        {product.category && (
                                            <p><b>Category:</b> {product.category}</p>
                                        )}
                                        {product.subCategory && (
                                            <p><b>Subcategory:</b> {product.subCategory}</p>
                                        )}
                                        {product.model && (
                                            <p><b>Model:</b> {product.model}</p>
                                        )}
                                        {product.instrument && (
                                            <p><b>Instrument:</b> {product.instrument}</p>
                                        )}
                                        {product.capacity && (
                                            <p><b>Capacity:</b> {product.capacity}</p>
                                        )}
                                        {product.throughput && (
                                            <p><b>Throughput:</b> {product.throughput}</p>
                                        )}
                                        {product.parameters && (
                                            <p><b>Parameters:</b> {product.parameters}</p>
                                        )}
                                        {product.automation && (
                                            <p><b>Automation:</b> {product.automation}</p>
                                        )}
                                        {product.usage && (
                                            <p><b>Usage:</b> {product.usage}</p>
                                        )}
                                        {product.size && (
                                            <p><b>Size:</b> {product.size}</p>
                                        )}
                                        {product.availability && (
                                            <p><b>Availability:</b> {product.availability}</p>
                                        )}
                                    </div>

                                    {/* QUERY BOX */}
                                    <div className={styles.queryBox}>
                                        <h3>Get Product Details</h3>
                                        <input
                                            type="email"
                                            className={styles.queryInput}
                                            placeholder="Enter Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <input
                                            type="tel"
                                            className={styles.queryInput}
                                            placeholder="Enter Mobile Number"
                                            value={phone}
                                            maxLength={10}
                                            onChange={(e) =>
                                                setPhone(e.target.value.replace(/\D/g, ""))
                                            }
                                        />
                                        <button
                                            className={styles.queryBtn}
                                            onClick={handleSubmit}
                                        >
                                            Submit Query
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO CONTENT */}
                    <div className={styles.seoContent}>
                        <section className={styles.seoSection}>
                            <h2>{productName} Supplier in {city}</h2>
                            <p>
                                Raj Biosis is a trusted supplier and dealer of{" "}
                                <strong>{productName}</strong> in {city}. We provide
                                advanced laboratory instruments, pathology equipment,
                                diagnostic analyzers, hospital devices, blood bank equipment
                                and research laboratory solutions for healthcare organizations
                                across {city}.
                            </p>
                        </section>

                        <section className={styles.seoSection}>
                            <h2>Leading {productName} Dealer in {city}</h2>
                            <p>
                                As a reputed {productName} dealer in {city}, we offer
                                premium quality equipment from globally recognized
                                manufacturers. Our team provides installation support, user
                                training, maintenance guidance and after-sales assistance to
                                ensure smooth laboratory operations.
                            </p>
                        </section>

                        <section className={styles.seoSection}>
                            <h2>Buy {productName} in {city} at Best Price</h2>
                            <p>
                                Looking to buy {productName} in {city}? Raj Biosis
                                offers genuine products, competitive pricing and fast
                                delivery. We help hospitals, diagnostic centres, pathology
                                laboratories and healthcare institutions choose the right
                                equipment according to their workflow and budget.
                            </p>
                        </section>

                        <section className={styles.seoSection}>
                            <h2>Applications of {productName}</h2>
                            <ul>
                                <li>Clinical Diagnostics Laboratories</li>
                                <li>Hospitals & Healthcare Centres</li>
                                <li>Pathology Laboratories</li>
                                <li>Blood Banks</li>
                                <li>Medical Colleges</li>
                                <li>Research & Development Laboratories</li>
                            </ul>
                        </section>

                        <section className={styles.seoSection}>
                            <h2>Why Choose Raj Biosis in {city}</h2>
                            <ul>
                                <li>Trusted Biomedical Equipment Supplier</li>
                                <li>Original Products From Leading Brands</li>
                                <li>Competitive Pricing</li>
                                <li>Quick Delivery Across {city}</li>
                                <li>Technical Support & Service Assistance</li>
                                <li>Experienced Healthcare Equipment Team</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </section>
        </>
    );
}
