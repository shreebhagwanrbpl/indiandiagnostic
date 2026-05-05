"use client";

import { useState, useEffect  } from "react";
import { db } from "@/lib/firebase";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import "./items.css"
import { doc, getDoc, collection, addDoc,onSnapshot  } from "firebase/firestore";
import { FiFilter } from "react-icons/fi";


export default function ItemsPage({ city }) {
const [showFilters, setShowFilters] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);
const [showForm, setShowForm] = useState(false);
const [products, setProducts] = useState([]); 
const [loadingProducts, setLoadingProducts] = useState(true);
const [search, setSearch] = useState("");
const [selectedBrand, setSelectedBrand] = useState("");
const [selectedUsage, setSelectedUsage] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(25);
const currentCity = city || "jaipur";
const [queryForm, setQueryForm] = useState({
  email: "",
  phone: ""
});

const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
const usages = [...new Set(products.map(p => p.usage).filter(Boolean))];

const filteredProducts = products
  .filter((item) => item.isPublished)
  .filter((item) => {
    const text = `${item.title} ${item.brand} ${item.usage}`.toLowerCase();

    return text.includes(search.toLowerCase()) &&
      (selectedBrand ? item.brand === selectedBrand : true) &&
      (selectedUsage ? item.usage === selectedUsage : true);
  });
const totalItems = products.length;            
const filteredCount = filteredProducts.length; 

const totalPages =
  itemsPerPage === "all"
    ? 1
    : Math.ceil(filteredCount / itemsPerPage);

const paginatedProducts =
  itemsPerPage === "all"
    ? filteredProducts
    : filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

useEffect(() => {
  setCurrentPage(1);
}, [search, selectedBrand, selectedUsage]);
// data fatch 
// useEffect(() => {
//   const unsub = onSnapshot(
//     doc(db, "websites", "indiandiagnostic", "pages", "products"),
//     (snap) => {
//       if (snap.exists()) {
//         // setProducts(snap.data().products || []);
//         const rawProducts = snap.data().products || [];

// const productsWithSEO = rawProducts.map(p => ({
//   ...p,
//   seoKeywords: generateKeywords(p.title)
// }));

// setProducts(productsWithSEO);
//       }
//       setLoadingProducts(false);
//     },
//     (error) => {
//       console.error(error);
//       toast.error("Failed to load products");
//       setLoadingProducts(false);
//     }
//   );

//   return () => unsub();
// }, []);


useEffect(() => {
  const unsub = onSnapshot(
    doc(db, "websites", "indiandiagnostic", "pages", "products"),
    (snap) => {
      if (snap.exists()) {

        const rawProducts = snap.data().products || [];

        // 🔥 slug function
        const slugify = (text = "") =>
          text.toLowerCase().replace(/\s+/g, "-");

        // 🔥 SEO + slug add
        const productsWithSEO = rawProducts.map((p) => ({
          ...p,
          slug: slugify(p.title), // ✅ ADD THIS
          seoKeywords: generateKeywords(p.title),
        }));

        setProducts(productsWithSEO);
      }

      setLoadingProducts(false);
    },
    (error) => {
      console.error(error);
      toast.error("Failed to load products");
      setLoadingProducts(false);
    }
  );

  return () => unsub();
}, []);



const handleFormChange = (e) => {
  setQueryForm({
    ...queryForm,
    [e.target.name]: e.target.value
  });
};

const handleSubmitQuery = async () => {
  try {
    const { email, phone } = queryForm;

    // required check
    if (!email || !phone) {
      return toast.error("Please fill all fields");
    }

    //  email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Invalid email");
    }

    // phone validation (India)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return toast.error("Invalid phone number");
    }

    const loading = toast.loading("Submitting...");

    await addDoc(collection(db, "websitesQueries", "indiandiagnostic","productQueries"), {
      productName: selectedProduct.title || "",
      email,
      phone,
      createdAt: new Date(),
    });

    toast.success("Query submitted successfully", { id: loading });

    // reset form
    setQueryForm({ email: "", phone: "" });
    setShowForm(false);

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }
};


const generateKeywords = (productName = "") => {
  const base = productName.toLowerCase();

  const prefixes = [
    "best", "cheap", "affordable", "top", "near me",
    "online", "trusted", "fast", "certified"
  ];

  const suffixes = [
    "lab", "test", "diagnostic", "center",
    "price", "booking", "home collection",
    "report", "clinic"
  ];

  const locations = ["india", "jaipur", "delhi"];

  let keywords = new Set();

  keywords.add(base);
  keywords.add(`${base} test`);
  keywords.add(`${base} lab`);
  keywords.add(`${base} near me`);

  prefixes.forEach(p => keywords.add(`${p} ${base}`));
  suffixes.forEach(s => keywords.add(`${base} ${s}`));

  prefixes.forEach(p => {
    suffixes.forEach(s => {
      keywords.add(`${p} ${base} ${s}`);
    });
  });

  locations.forEach(loc => {
    keywords.add(`${base} in ${loc}`);
    keywords.add(`${base} test in ${loc}`);
  });

  return Array.from(keywords).slice(0, 35);
};


useEffect(() => {
  if (selectedProduct?.title) {
    const keywords = generateKeywords(selectedProduct.title);
    console.log("SEO KEYWORDS 👉", keywords);
    document.title = selectedProduct.title;

    let meta = document.querySelector('meta[name="keywords"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "keywords";
      document.head.appendChild(meta);
    }

    meta.content = keywords.join(", ");
  }
}, [selectedProduct]);



  return (
    <>

      {/* 🔥 BANNER */}
      <section className="item-banner">
         <div className="container text-center">
        <h1>Our Products</h1>
        <p className="text-white">Explore our premium medical equipment</p>
        </div>
      </section>


      {/* 🔥 PRODUCTS GRID */}
      <section className="items-section">
        <div className="container">
          {/* 🔥 FILTERS */}
          <div className="filter-card mb-4 px-3 py-2 rounded shadow-sm bg-white">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

              {/* Toggle */}
              <button
                className="btn btn-sm btn-light border d-flex align-items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter />
                Filters
              </button>

              {/* Filters */}
              {showFilters && (
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="form-control form-control-sm filter-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <select
                    className="form-select form-select-sm filter-select"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  >
                    <option value="">Brand</option>
                    {brands.map((b, i) => (
                      <option key={i} value={b}>{b}</option>
                    ))}
                  </select>

                  <select
                    className="form-select form-select-sm filter-select"
                    value={selectedUsage}
                    onChange={(e) => setSelectedUsage(e.target.value)}
                  >
                    <option value="">Usage</option>
                    {usages.map((u, i) => (
                      <option key={i} value={u}>{u}</option>
                    ))}
                  </select>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setSearch("");
                      setSelectedBrand("");
                      setSelectedUsage("");
                    }}
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Showing */}
              <div className="text-muted small fw-medium">
                Showing: <b>{filteredCount}</b>
              </div>

            </div>
          </div>

          {/* 🔥 PRODUCTS */}
          <div className="row g-4 product-container">

            {loadingProducts ? (
              <div className="col-12">
                <div className="loader-box">
                  <p>Loading products...</p>
                </div>
              </div>

            ) : filteredProducts.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p>No products found</p>
              </div>

            ) : (
              paginatedProducts.map((item) => (
                <div
                  className="col-md-3"
                  key={`${item.title}-${item.brand}-${item.size}-${item.usage}`}
                >
                  <div className="product-card">
                  <div
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      height: "1px",
                      overflow: "hidden"
                    }}
                  >
                    {item.seoKeywords?.join(", ")}
                  </div>
                      <div className="img-box">
                      <img
                        src={item.image || "/no-image.png"}
                        className="product-img"
                        loading="lazy"
                      />
                    </div>

                    <div className="product-info">
                      <h5>{item.title}</h5>
                          <p className="text-muted small">
                       <p><b>Brand:</b> {item.brand || "-"}</p>
                      <p><b>Size:</b> {item.size || "-"}</p>
                      <p><b>Usage:</b> {item.usage || "-"}</p>
                    </p>
                    </div>

                    {/* <button
                      className="btn-view"
                      onClick={() => {
                        setSelectedProduct(item);
                        setShowForm(false);
                      }}
                    >
                      More Info
                    </button> */}
                    <div
                      className="product-card"
                      onClick={() => {
                        setSelectedProduct(item); // modal
                        setShowForm(false);
                      }}
                    >
                      {/* IMAGE + INFO */}

                      <Link
                        // href={`/${city}/${item.slug}`}
                        // onClick={(e) => e.stopPropagation()} 
                         href={`/${currentCity}/${item.slug}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="btn-view">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* 🔥 PAGINATION */}
          <div className="pagination-card mt-4 px-3 py-2 rounded shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

              {/* Per Page */}
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold text-muted">Per Page:</span>

                <select
                  className="custom-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    const value = e.target.value === "all" ? "all" : Number(e.target.value);
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="all">All</option>
                </select>
              </div>

              {/* Right */}
              <div className="d-flex align-items-center gap-3 ms-auto">

                <div className="text-muted small fw-medium">
                  Total: <span className="fw-bold">{totalItems}</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-light border"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ◀
                  </button>

                  <button className="btn btn-sm btn-primary px-3">
                    {currentPage}
                  </button>

                  <button
                    className="btn btn-sm btn-light border"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    <div className={`drawer ${selectedProduct ? "open" : ""}`}>

        {selectedProduct && (
          <>
            <div className="drawer-header">
             <h4>{selectedProduct.title}</h4>
              <button onClick={() => setSelectedProduct(null)}>✖</button>
            </div>

      {/* SCROLLABLE CONTENT */}
      <div className="drawer-content">
        <img
          src={selectedProduct.image || "/no-image.png"}
          className="drawer-img"
        />

        <div className="drawer-details">
          <p><b>Description:</b> {selectedProduct.desc}</p>
          <p><b>Brand:</b> {selectedProduct.brand}</p>
          <p><b>Size:</b> {selectedProduct.size}</p>
          <p><b>Usage:</b> {selectedProduct.usage}</p>
          <p><b>Model:</b> {selectedProduct.model}</p>
          <p><b>Instrument:</b> {selectedProduct.instrument}</p>
          <p><b>Automation:</b> {selectedProduct.automation}</p>
          <p><b>Availability:</b> {selectedProduct.availability}</p>
        </div>
      </div>

      {/* FIXED FOOTER */}
      <div className="drawer-footer">
        {!showForm ? (
          <button
            className="btn-main"
            onClick={() => setShowForm(true)}
          >
            Get Details
          </button>
        ) : (
          <div className="form-box">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={queryForm.email}
              onChange={handleFormChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Contact number"
              value={queryForm.phone}
              onChange={handleFormChange}
              required
            />

            <button className="btn-main" onClick={handleSubmitQuery}>
              Submit
            </button>
          </div>
        )}
      </div>
    </>
  )}
</div>

      {/* 🔥 OVERLAY */}
      {selectedProduct && (
        <div className="overlay" onClick={() => setSelectedProduct(null)}></div>
      )}

    </>
  );
}
