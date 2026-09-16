"use client";
import { useEffect } from "react";
import styles from "./page.module.css";

export default function Loading() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  return (
    <section className={styles.productDetailPage}>
      <div className="container">
        <div className={styles.productCardWrap}>
          <div className="row align-items-center">
            <div className="col-lg-5">
              <div style={{
                height: "450px",
                background: "#f1f5f9",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "4px solid #cbd5e1",
                  borderTopColor: "#1e3c72",
                  animation: "spin 1s linear infinite",
                }} />
              </div>
            </div>
            <div className="col-lg-7">
              <div style={{ height: "36px", width: "80%", background: "#e2e8f0", borderRadius: "8px", marginBottom: "16px" }} />
              <div style={{ height: "24px", width: "40%", background: "#e2e8f0", borderRadius: "6px", marginBottom: "24px" }} />
              <div style={{ height: "80px", width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", marginBottom: "20px" }} />
              <div style={{ height: "120px", width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px" }} />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
