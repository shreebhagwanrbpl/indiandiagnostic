import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 20px 40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "64px", fontWeight: "800", color: "#2563eb" }}>404</h1>
      <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "15px" }}>Page Not Found</h2>
      <p style={{ color: "#6b7280", maxWidth: "500px", marginBottom: "30px" }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "12px 28px",
          background: "#2563eb",
          color: "#ffffff",
          borderRadius: "30px",
          textDecoration: "none",
          fontWeight: "600",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
