"use client";

import { useState, useEffect  } from "react";
import { db } from "@/lib/firebase";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import "./items.css"
import { doc, getDoc, collection, addDoc,onSnapshot  } from "firebase/firestore";
import { FiFilter } from "react-icons/fi";


export default function ItemsPage() {
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
useEffect(() => {
  const unsub = onSnapshot(
    doc(db, "websites", "webfirst", "pages", "products"),
    (snap) => {
      if (snap.exists()) {
        setProducts(snap.data().products || []);
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

    await addDoc(collection(db, "productQueries"), {
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

                    <div className="img-box">
                      <img
                        src={item.image || "/no-image.png"}
                        className="product-img"
                        loading="lazy"
                      />
                    </div>

                    <div className="product-info">
                      <h5>{item.title}</h5>
                      <p><b>Brand:</b> {item.brand || "-"}</p>
                      <p><b>Size:</b> {item.size || "-"}</p>
                      <p><b>Usage:</b> {item.usage || "-"}</p>
                    </div>

                    <button
                      className="btn-view"
                      onClick={() => {
                        setSelectedProduct(item);
                        setShowForm(false);
                      }}
                    >
                      More Info
                    </button>

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
            <p><b>Usage:</b> {selectedProduct.usage}</p>
            <p><b>Model:</b> {selectedProduct.model}</p>
            <p><b>Instrument:</b> {selectedProduct.instrument}</p>
            <p><b>Automation:</b> {selectedProduct.automation}</p>
            <p><b>Availability:</b> {selectedProduct.availability}</p>
            <p><b>Usage:</b> {selectedProduct.usage}</p>
            <p><b>Model:</b> {selectedProduct.model}</p>
            <p><b>Instrument:</b> {selectedProduct.instrument}</p>
            <p><b>Automation:</b> {selectedProduct.automation}</p>
            <p><b>Availability:</b> {selectedProduct.availability}</p>
          </div>

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
                inputMode="numeric"
              />

                <button className="btn-main" onClick={handleSubmitQuery}>
                  Submit
                </button>
              </div>
            )}
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

//   .items-banner {
//          background: linear-gradient(135deg, #1e3c72, #2a5298);
//           color: white;
//           padding: 140px 0 80px;
//          height:370px;
//         }

//         .items-section {
//           padding: 80px 0;
//           background: #fffaf3;
//         }
// .product-card {
//   background: white;
//   padding: 20px;
//   border-radius: 15px;
//   text-align: center;
//   box-shadow: 0 10px 25px rgba(0,0,0,0.08);
//   transition: 0.3s;

//   height: 100%;              
//   display: flex;            
//   flex-direction: column;
//   justify-content: space-between;
// }

//         .product-card:hover {
//           transform: translateY(-10px);
//         }

//         .product-img {
//           height: 120px;
//           margin-bottom: 15px;
//         }

//         .price {
//           font-weight: 600;
//           color: #dc2626;
//         }

//         .btn-view {
//           background: linear-gradient(135deg,#dc2626,#f97316);
//           border: none;
//           color: white;
//           padding: 8px 20px;
//           border-radius: 20px;
//         }

//         .drawer {
//           position: fixed;
//           top: 0;
//           right: -400px;
//           width: 350px;
//           height: 100%;
//           background: white;
//           padding: 20px;
//           box-shadow: -5px 0 20px rgba(0,0,0,0.1);
//           transition: 0.3s;
//           z-index: 1000;
//         }

//         .drawer.open {
//           right: 0;
//         }

//         .drawer-header {
//           display: flex;
//           justify-content: space-between;
//         }

//         .drawer-img {
//           width: 100%;
//           margin: 15px 0;
//         }

//   .btn-main {
//   width: 100%;
//   background: linear-gradient(135deg,#dc2626,#f97316) !important;
//   color: white !important;
//   border: none !important;
//   padding: 12px;
//   border-radius: 25px;
//   font-weight: 600;
//   cursor: pointer;
//   display: block;
// }
// .drawer-footer .btn-main {
//   background: linear-gradient(135deg,#dc2626,#f97316) !important;
//   color: #fff !important;
// }
//         .form-box input {
//           width: 100%;
//           margin: 8px 0;
//           padding: 8px;
//           border: 1px solid #ccc;
//           border-radius: 8px;
//         }

//         /* 🔥 OVERLAY */
//         .overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background: rgba(0,0,0,0.4);
//           z-index: 999;
//         }
// .product-img {
//   width: 100%;
//   height: 180px; /* fixed height */
//   /* object-fit: cover; */
//   background: #f3f4f6; /* fallback background */
//   border-radius: 10px;
// }
// .drawer-img {
//   width: 100%;
//   height: 220px; /* fixed height */
//   object-fit: cover;
//   background: #f3f4f6; /* fallback bg */
//   border-radius: 10px;
// }
// .product-info {
//   padding: 10px 5px;
//   text-align: left;
// }

// .product-info h5 {
//   font-size: 16px;
//   font-weight: 600;
//   margin-bottom: 6px;
// }

// .product-info p {
//   font-size: 13px;
//   margin: 2px 0;
//   color: #555;
// }
// .drawer-details {
//   margin-top: 10px;
// }

// .drawer-details p {
//   font-size: 14px;
//   margin: 4px 0;
//   color: #444;
// }
// .img-box {
//   width: 100%;
//   height: 180px;
//   background: #f3f4f6;
//   border-radius: 10px;

//   display: flex;
//   align-items: center;
//   justify-content: center;
//   overflow: hidden;
// }

// .product-img {
//   max-width: 100%;
//   max-height: 100%;
//   object-fit: contain; 
// }

// .form-control, .form-select {
//   border-radius: 8px;
// }

// .btn-secondary {
//   border-radius: 8px;
// }
// .filter-row {
//   flex-wrap: nowrap;
//   overflow-x: auto;
// }

// /* toggle button */
// .filter-toggle {
//   min-width: 40px;
//   height: 40px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   border: 1px solid #ddd;
//   border-radius: 8px;
//   cursor: pointer;
// }

// /* input sizes */
// .filter-input {
//   width: 180px;
//   min-width: 140px;
// }

// .filter-select {
//   width: auto;
//   min-width: 120px;
// }

// @keyframes fadeIn {
//   from {
//     opacity: 0;
//     transform: translateY(-5px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }