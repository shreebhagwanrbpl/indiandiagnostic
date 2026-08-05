"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { doc, getDoc, getDocs, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast, { Toaster } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./page.module.css";
import { getCache, setCache } from "@/lib/productsCache";

export default function ProductDetailPage() {
    const { slug } = useParams();
    console.log("URL Slug =", slug);
    const [product, setProduct] = useState(null);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedMedia, setSelectedMedia] = useState("image");
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const cardRef = useRef(null);
  useEffect(() => {

    const fetchProduct = async () => {

        const slugify = (text = "") =>
            text
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-");

        let allProducts = await getCache();

        if (allProducts) {
            const found = allProducts.find((p) => {
                const productSlug =
                    p.slug?.trim()
                        ? p.slug
                        : slugify(
                            p.title ||
                            p.instrument ||
                            p.model ||
                            `product-${p.productId}`
                        );

                return productSlug === slug;
            });

            if (found) {
                setSelectedImage(found.images?.[0] || found.image || "");
                setProduct(found);
                return;
            }
        }

        try {

            let normalProducts = [];

            // Categories
            const categorySnap = await getDocs(
                collection(
                    db,
                    "websites",
                    "indiandiagnostic",
                    "pages",
                    "categoryproducts",
                    "categories"
                )
            );

            const subQueries = categorySnap.docs.map((categoryDoc) => {
                return getDocs(
                    collection(
                        db,
                        "websites",
                        "indiandiagnostic",
                        "pages",
                        "categoryproducts",
                        "categories",
                        categoryDoc.id,
                        "subcategories"
                    )
                ).then((subSnap) => ({
                    categoryDoc,
                    subSnap,
                }));
            });

            const results = await Promise.all(subQueries);

            let categoryProducts = [];

            for (const { categoryDoc, subSnap } of results) {

                const categoryData = categoryDoc.data();

                subSnap.forEach((subDoc) => {

                    const subData = subDoc.data();

                    (subData.products || []).forEach((item) => {

                        categoryProducts.push({
                            ...item,
                            category: categoryData.category,
                            subCategory: subData.subCategory,
                        });

                    });

                });

            }

            allProducts = [
                ...normalProducts,
                ...categoryProducts,
            ];

            await setCache(allProducts);

            console.log("Total Products =", allProducts.length);

            const found = allProducts.find((p) => {

                const productSlug =
                    p.slug?.trim()
                        ? p.slug
                        : slugify(
                            p.title ||
                            p.instrument ||
                            p.model ||
                            `product-${p.productId}`
                        );

                return productSlug === slug;

            });

            console.log("Found Product =", found);

            if (found) {
                setSelectedImage(found.images?.[0] || found.image || "");
            }

            setProduct(found);

        } catch (err) {

            console.error(
                "Error fetching product in detail page:",
                err
            );

        }

    };

    fetchProduct();

}, [slug]);
    
    
    const pathname = usePathname();
    const pathParts = pathname
        .split("/")
        .filter(Boolean);
    const reservedRoutes = [
        "about",
        "contact",
        "items",
        "services",
    ];

    const city =
        pathParts[0] &&
            !reservedRoutes.includes(pathParts[0])
            ? pathParts[0]
                .replace(/-/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase())
            : "India";
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

        const loading = toast.loading("Submitting...");

        try {
            await addDoc(
                collection(
                    db,
                    "websitesQueries",
                    "indiandiagnostic",
                    "productQueries"
                ),
                {
                    productName,
                    email,
                    phone,
                    createdAt: new Date(),
                }
            );

            toast.success("Query submitted successfully", {
                id: loading,
            });

            setEmail("");
            setPhone("");

        } catch (error) {
            console.error(error);

            toast.error("Something went wrong", {
                id: loading,
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

    if (!product) {
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
    const productName =
        product.title ||
        product.instrument ||
        product.model ||
        "Laboratory Equipment";
    return (
        <>
            <Toaster position="top-right" />

            <section className={styles.productDetailPage}>
                <div className="container">
                    <div className={styles.productCardWrap} ref={cardRef}>

                        <div className="row align-items-center">

                            <div className="col-lg-5">
                                <div className={styles.productImageBox}>
                                    {selectedMedia === "image" && (
                                        <img
                                            src={selectedImage || "/no-image.png"}
                                            alt={product.title || productName}
                                            className={styles.productDetailImage}
                                        />
                                    )}

                                    {selectedMedia === "video" && (
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
                                <div className={styles.thumbnailGallery}>

                                    {(product.images?.length
                                        ? product.images
                                        : [product.image]
                                    ).map((img, index) => (

                                        <img
                                            key={index}
                                            src={img}
                                            alt={`thumb-${index}`}
                                            className={`${styles.thumbnailItem}
            ${selectedImage === img &&
                                                    selectedMedia === "image"
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
                                            className={`${styles.mediaThumb}
            ${selectedMedia === "video"
                                                    ? styles.active
                                                    : ""
                                                }`}
                                            onClick={() =>
                                                setSelectedMedia("video")
                                            }
                                        >
                                            ▶
                                            <span>Video</span>
                                        </div>
                                    )}

                                    {product.pdf && (
                                        <a
                                            href={product.pdf}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.mediaThumb}
                                        >
                                            📄
                                            <span>Document</span>
                                        </a>
                                    )}

                                    <div
                                        className={`${styles.mediaThumb} ${styles.pdfThumbBtn}`}
                                        onClick={handleDownloadPDF}
                                        title="Download Product PDF"
                                        data-html2canvas-ignore="true"
                                    >
                                        📥
                                        <span>Save PDF</span>
                                    </div>

                                </div>
                            </div>

                            <div className="col-lg-7">
                                <div className={styles.productContent}>

                                    <h1>{productName}</h1>

                                    <p className={styles.productDesc}>
                                        {product.desc}
                                    </p>

                                    <div className={styles.productInfoList}>
                                        <p><b>Brand:</b> {product.brand}</p>
                                        <p><b>Size:</b> {product.size}</p>
                                        <p><b>Usage:</b> {product.usage}</p>
                                        <p><b>Model:</b> {product.model}</p>
                                        <p><b>Instrument:</b> {product.instrument}</p>
                                        <p><b>Automation:</b> {product.automation}</p>
                                        <p><b>Availability:</b> {product.availability}</p>
                                    </div>

                                    <div className={styles.queryBox}>
                                        <h3>Get Product Details</h3>

                                        <input
                                            type="email"
                                            className={styles.queryInput}
                                            placeholder="Enter Email Address"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />

                                        <input
                                            type="tel"
                                            className={styles.queryInput}
                                            placeholder="Enter Mobile Number"
                                            value={phone}
                                            maxLength={10}
                                            onChange={(e) =>
                                                setPhone(
                                                    e.target.value.replace(/\D/g, "")
                                                )
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
                        <div className={styles.seoContent}>

                            <section className={styles.seoSection}>
                                <h2>{productName} Supplier in {city}</h2>

                                <p>
                                    Raj Biosis is a trusted supplier and dealer of <strong>{productName}</strong> in {city}.
                                    We provide advanced laboratory instruments, pathology equipment,
                                    diagnostic analyzers, hospital devices, blood bank equipment and
                                    research laboratory solutions for healthcare organizations across {city}.
                                </p>
                            </section>

                            <section className={styles.seoSection}>
                                <h2>Leading {productName} Dealer in {city}</h2>

                                <p>
                                    As a reputed {productName} dealer in {city}, we offer premium quality
                                    equipment from globally recognized manufacturers. Our team provides
                                    installation support, user training, maintenance guidance and
                                    after-sales assistance to ensure smooth laboratory operations.
                                </p>
                            </section>

                            <section className={styles.seoSection}>
                                <h2>Buy {productName} in {city} at Best Price</h2>

                                <p>
                                    Looking to buy {productName} in {city}? Raj Biosis offers genuine
                                    products, competitive pricing and fast delivery. We help hospitals,
                                    diagnostic centres, pathology laboratories and healthcare institutions
                                    choose the right equipment according to their workflow and budget.
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
                </div>
            </section>
        </>
    );
}