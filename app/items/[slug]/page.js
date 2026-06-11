"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast, { Toaster } from "react-hot-toast";
import styles from "./page.module.css";

export default function ProductDetailPage() {
    const { slug } = useParams();

    const [product, setProduct] = useState(null);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            const snap = await getDoc(
                doc(
                    db,
                    "websites",
                    "indiandiagnostic",
                    "pages",
                    "products"
                )
            );

            if (!snap.exists()) return;

            const products = snap.data().products || [];

            const found = products.find(
                (p) =>
                    p.slug === slug ||
                    p.title?.toLowerCase().replace(/\s+/g, "-") === slug
            );

            setProduct(found);
        };

        fetchProduct();
    }, [slug]);

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
                    productName: product.title,
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

    return (
        <>
            <Toaster position="top-right" />

            <section className={styles.productDetailPage}>
                <div className="container">
                    <div className={styles.productCardWrap}>

                        <div className="row align-items-center">

                            <div className="col-lg-5">
                                <div className={styles.productImageBox}>
                                    <img
                                        src={product.image || "/no-image.png"}
                                        alt={product.title}
                                    />
                                </div>
                            </div>

                            <div className="col-lg-7">
                                <div className={styles.productContent}>

                                    <h1>{product.title}</h1>

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

                    </div>
                </div>
            </section>
        </>
    );
}