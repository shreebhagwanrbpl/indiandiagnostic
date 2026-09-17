"use client";
import { FiArrowUp } from "react-icons/fi";
import { useState, useEffect, useMemo } from "react";
import {
  db,
  doc,
  getDoc,
  collection,
  getDocs,
} from "@/lib/firebase";

import {
  FiFilter,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCache, setCache } from "@/lib/productsCache";
import { fetchFullCatalog, slugify, isProductVisibleOnCurrentSite } from "@/lib/data-fetcher";
import "./items.css";

export default function ItemsPage({ city }) {

  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [sidebarSearch, setSidebarSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [selectedBrand, setSelectedBrand] = useState("");

  const [selectedUsage, setSelectedUsage] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const currentCity = city || "";

  const citySlug = currentCity
    ?.toLowerCase()
    ?.replace(/\s+/g, "-");

  // Sync category search from URL query parameter (e.g. ?search=Hematology)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const search = params.get("search") || params.get("category");
      if (search) {
        setProductSearch(search);
      }
    }
  }, []);







  /* -------------------------------- */

  /* FETCH PRODUCTS VIA CATALOG API */

  /* -------------------------------- */

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      // 1. Instant display from IndexedDB cache if available
      try {
        const rawCached = await getCache();
        if (Array.isArray(rawCached) && rawCached.length > 0 && isMounted) {
          const validCached = rawCached.filter((p) => isProductVisibleOnCurrentSite(p));
          if (validCached.length > 0) {
            setProducts(validCached);
            setLoadingProducts(false);
          }
        }
      } catch (e) {
        console.warn("IndexedDB cache read skipped:", e);
      }

      // 2. Fetch fresh catalog from API (Real-time sync)
      try {
        const catalogData = await fetchFullCatalog(true);
        const allProducts = (catalogData.products || []).filter((p) => isProductVisibleOnCurrentSite(p));

        if (isMounted) {
          setProducts(allProducts);
        }
        await setCache(allProducts);
      } catch (err) {
        console.error("Error fetching catalog in ItemsPage:", err);
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);




  /* -------------------------------- */
  /* FILTER PRODUCTS */
  /* -------------------------------- */
  const filteredProducts = useMemo(() => {
    const searchLow = productSearch.toLowerCase().trim();
    return products
      .filter((p) => p.isPublished !== false)
      .filter((item) => {
        const txt = `
          ${item.title || ""}
          ${item.name || ""}
          ${item.brand || ""}
          ${item.usage || ""}
          ${item.model || ""}
          ${item.instrument || ""}
          ${item.category || ""}
          ${item.subCategory || ""}
        `.toLowerCase();

        return (
          (!searchLow || txt.includes(searchLow)) &&
          (selectedBrand ? item.brand === selectedBrand : true) &&
          (selectedUsage ? item.usage === selectedUsage : true)
        );
      });
  }, [products, productSearch, selectedBrand, selectedUsage]);

  const sidebarProducts = useMemo(() => {
    const sideLow = sidebarSearch.toLowerCase().trim();
    return products.filter((item) => {
      if (!sideLow) return true;
      const txt = `
        ${item.title || ""}
        ${item.name || ""}
        ${item.category || ""}
        ${item.subCategory || ""}
        ${item.brand || ""}
      `.toLowerCase();

      return txt.includes(sideLow);
    });
  }, [products, sidebarSearch]);

  /* -------------------------------- */
  /* GROUP CATEGORY & SUBCATEGORY */
  /* -------------------------------- */
  const groupedProducts = useMemo(() => {
    const obj = {};

    sidebarProducts.forEach((item) => {
      const cat = item.category || (item.type === "normal" ? "Normal Products" : "General Products");
      if (!obj[cat]) {
        obj[cat] = {};
      }

      const subCategory = item.subCategory || "General";

      if (!obj[cat][subCategory]) {
        obj[cat][subCategory] = [];
      }

      obj[cat][subCategory].push(item);
    });

    return obj;
  }, [sidebarProducts]);



  const categoryNames =
    Object.keys(groupedProducts);



  const [categoryLimits, setCategoryLimits] = useState({});

  const [activeCategory,
    setActiveCategory] =
    useState("");



  useEffect(() => {
    if (
      categoryNames.length > 0 &&
      activeCategory === ""
    ) {
      setTimeout(() => {
        setActiveCategory(categoryNames[0]);
      }, 0);
    }
  }, [categoryNames, activeCategory]);

  /* ============================================================
   FILTER OPTIONS
============================================================ */

  const brands = useMemo(() => {

    return [
      ...new Set(
        products
          .map((item) => item.brand)
          .filter(Boolean)
      )
    ];

  }, [products]);



  const usages = useMemo(() => {

    return [
      ...new Set(
        products
          .map((item) => item.usage)
          .filter(Boolean)
      )
    ];

  }, [products]);


  /* ============================================================
     GROUP PAGINATION
  ============================================================ */

  const paginatedGroupedProducts = useMemo(() => {
    const obj = {};

    filteredProducts.forEach((item) => {
      const cat = item.category || (item.type === "normal" ? "Normal Products" : "General Products");
      if (!obj[cat]) {
        obj[cat] = [];
      }

      obj[cat].push(item);
    });

    return obj;
  }, [filteredProducts]);


  /* ============================================================
     SIDEBAR ACCORDION
  ============================================================ */

  const [openedCategory,
    setOpenedCategory] =
    useState("");

  const [openedSubCategory, setOpenedSubCategory] = useState({});

  useEffect(() => {

    const categories = Object.keys(groupedProducts);

    if (!categories.length) return;

    queueMicrotask(() => {
      setOpenedCategory((prev) => {
        return prev || categories[0];
      });
    });

  }, [groupedProducts]);
  useEffect(() => {

    if (Object.keys(groupedProducts).length === 0) return;

    const initialState = {};

    Object.entries(groupedProducts).forEach(([category, subCategories]) => {

      const firstSubCategory = Object.keys(subCategories)[0];

      if (firstSubCategory) {
        initialState[`${category}-${firstSubCategory}`] = true;
      }

    });

    queueMicrotask(() => {
      setOpenedSubCategory(initialState);
    });

  }, [groupedProducts]);

  const toggleCategory = (category) => {

    setOpenedCategory((prev) =>
      prev === category ? "" : category
    );

  };

  const toggleSubCategory = (category, subCategory) => {

    const key = `${category}-${subCategory}`;

    setOpenedSubCategory((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

  };
  /* ============================================================
     SCROLL TO CATEGORY
  ============================================================ */

  const scrollToProduct = (slug, category) => {

    setOpenedCategory(category);
    setActiveCategory(category);

    setCategoryLimits((prev) => ({
      ...prev,
      [category]: Infinity,
    }));

    setTimeout(() => {

      const product = document.getElementById(`product-${slug}`);

      if (product) {

        product.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }

    }, 150);

  };



  /* ============================================================
     ACTIVE CATEGORY WHILE SCROLL
  ============================================================ */

  useEffect(() => {

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      let current = "";

      Object.keys(
        groupedProducts
      ).forEach((category) => {

        const section =
          document.getElementById(

            category
              .replace(/\s+/g, "-")
              .toLowerCase()

          );

        if (!section) return;

        const top =
          section.getBoundingClientRect().top;

        if (top <= 180) {

          current = category;

        }

      });
      if (current && current !== activeCategory) {
        setActiveCategory(current);
      }

    };

    window.addEventListener(

      "scroll",

      handleScroll

    );

    return () =>

      window.removeEventListener(

        "scroll",

        handleScroll

      );

  }, [

    groupedProducts,

    activeCategory

  ]);



  /* ============================================================
     RESET FILTER
  ============================================================ */

  const resetFilters = () => {
    setSidebarSearch("");
    setProductSearch("");
    setSelectedBrand("");
    setSelectedUsage("");

  };



  /* ============================================================
     VIEW DETAILS & SLUG HELPERS
  ============================================================ */

  const getProductSlug = (item) => {
    if (!item) return "";
    return (
      (item.slug && item.slug.trim()) ||
      slugify(
        item.title ||
        item.name ||
        item.instrument ||
        item.model ||
        item.id ||
        item.categoryProductId ||
        item.productId ||
        ""
      )
    );
  };

  const getProductUrl = (item) => {
    const slug = getProductSlug(item);
    if (!slug) return "/items";
    return citySlug ? `/${citySlug}/items/${slug}` : `/items/${slug}`;
  };

  const viewDetails = (item) => {
    const url = getProductUrl(item);
    router.push(url);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>

      {/* ===========================
            HERO
    =========================== */}

      <section className="item-banner">
        <div className="item-content">
          <span className="page-badge">● OUR CATALOGUE</span>
          <h1>Medical Products</h1>
          <p>
            Find Advanced Diagnostic &amp; Laboratory Products Across India
          </p>
        </div>
      </section>

      {/* ===========================
            MAIN
    =========================== */}

      <section className="items-section">

        <div className="container-fluid">

          <div className="products-layout">

            {/* ===========================
                LEFT SIDEBAR
          =========================== */}
            <aside className="category-sidebar">



              <div className="sidebar-head">

                <h4>
                  Categories
                </h4>

              </div>

              <div className="category-search">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search Product..."
                  suppressHydrationWarning
                  value={sidebarSearch}
                  onChange={(e) => {
                    setSidebarSearch(e.target.value);
                  }}
                />

              </div>

              <div className="category-list">

                {

                  Object.keys(
                    groupedProducts
                  ).map((category) => (

                    <div
                      className="category-item"
                      key={category}
                    >

                      <button

                        className={`category-btn

                        ${activeCategory === category
                            ? "active"
                            : ""}

                        `}

                        onClick={() =>
                          toggleCategory(
                            category
                          )
                        }

                      >

                        <span>

                          {

                            openedCategory === category

                              ?

                              <FiChevronDown />

                              :

                              <FiChevronRight />

                          }

                          {category}

                        </span>

                        <span
                          className="count"
                        >

                          {

                            Object.values(groupedProducts[category])
                              .flat()
                              .length

                          }

                        </span>

                      </button>

                      <div
                        className={`category-content
  ${openedCategory === category ? "show" : ""}
`}
                      >

                        <div className="category-scroll">

                          {

                            // groupedProducts[
                            //   category
                            // ].map((item) => (
                            Object.entries(groupedProducts[category]).map(
                              ([subCategory, products]) => (
                                <div
                                  key={subCategory}
                                  className="subcategory-item"
                                >

                                  <button
                                    className={`subcategory-btn ${openedSubCategory[`${category}-${subCategory}`]
                                      ? "active"
                                      : ""
                                      }`}
                                    onClick={() =>
                                      toggleSubCategory(category, subCategory)
                                    }
                                  >
                                    <span>
                                      {openedSubCategory[`${category}-${subCategory}`]
                                        ? <FiChevronDown />
                                        : <FiChevronRight />}
                                      {subCategory}
                                    </span>

                                    <span className="count">
                                      {products.length}
                                    </span>
                                  </button>
                                  {openedSubCategory[`${category}-${subCategory}`] && (
                                    <div className="subcategory-products">

                                      {products.map((item, index) => (

                                        <button
                                          key={`${item.slug}-${index}`}
                                          className="product-link"
                                          onClick={() =>
                                            scrollToProduct(item.slug, category)
                                          }
                                        >
                                          {item.title}
                                        </button>

                                      ))}

                                    </div>
                                  )}

                                </div>
                              )
                            )

                          }

                        </div>

                      </div>
                    </div>

                  ))

                }

              </div>



            </aside>

            {/* ===========================
                RIGHT SIDE
          =========================== */}

            <div className="products-content">

              {/* FILTER */}

              <div className="filter-card">

                <div className="row g-3">

                  <div className="col-lg-4">

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      suppressHydrationWarning
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                      }}
                    />

                  </div>

                  <div className="col-lg-3">

                    <select
                      className="form-select"
                      suppressHydrationWarning
                      value={selectedBrand}
                      onChange={(e) =>
                        setSelectedBrand(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Brand
                      </option>

                      {

                        brands.map((b) => (

                          <option
                            key={b}
                            value={b}
                          >
                            {b}
                          </option>

                        ))

                      }

                    </select>

                  </div>

                  <div className="col-lg-3">

                    <select
                      className="form-select"
                      suppressHydrationWarning
                      value={selectedUsage}
                      onChange={(e) =>
                        setSelectedUsage(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Usage
                      </option>

                      {

                        usages.map((u) => (

                          <option
                            key={u}
                            value={u}
                          >
                            {u}
                          </option>

                        ))

                      }

                    </select>

                  </div>

                  <div className="col-lg-2">

                    <button

                      className="btn-reset"
                      suppressHydrationWarning

                      onClick={
                        resetFilters
                      }

                    >

                      Reset

                    </button>

                  </div>

                </div>

              </div>

              {/* PRODUCT LIST START */}

              {

                loadingProducts && products.length === 0 ? (

                  <div className="skeleton-container">

                    {[...Array(3)].map((_, i) => (

                      <div className="skeleton-card" key={i}>

                        <div className="row align-items-center">

                          <div className="col-lg-3 col-md-4">

                            <div className="skeleton-shimmer skeleton-img"></div>

                          </div>

                          <div className="col-lg-6 col-md-8">

                            <div className="skeleton-shimmer skeleton-title"></div>

                            <div className="skeleton-shimmer skeleton-text"></div>

                            <div className="skeleton-shimmer skeleton-text-short"></div>

                            <div className="row">

                              <div className="col-6"><div className="skeleton-shimmer skeleton-meta"></div></div>

                              <div className="col-6"><div className="skeleton-shimmer skeleton-meta"></div></div>

                            </div>

                          </div>

                          <div className="col-lg-3">

                            <div className="skeleton-shimmer skeleton-meta" style={{ height: "45px" }}></div>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                ) : Object.keys(paginatedGroupedProducts).length === 0 ? (

                  <div className="products-loading" style={{ minHeight: "250px" }}>

                    <div className="loading-text">No Products Found</div>

                  </div>

                ) : (

                  Object.entries(
                    paginatedGroupedProducts
                  ).map(

                    ([category, list]) => {
                      const limit = categoryLimits[category] || 15;
                      const visibleList = list.slice(0, limit);

                      return (

                        <div

                          key={category}

                          id={category
                            .replace(/\s+/g, "-")
                            .toLowerCase()}

                          className="product-section"

                        >

                          <div className="section-title">

                            <h3>

                              {category}

                            </h3>

                            <span>

                              {

                                list.length

                              }

                              Products

                            </span>

                          </div>

                          {
                            visibleList.map((item, index) => {
                              const itemSlug = getProductSlug(item);
                              const productUrl = getProductUrl(item);

                              return (
                                <div
                                  id={`product-${itemSlug}`}
                                  className="product-list-card"
                                  key={`${itemSlug}-${index}`}
                                >
                                  <div className="row align-items-center">
                                    {/* IMAGE */}
                                    <div className="col-lg-3 col-md-4">
                                      <Link href={productUrl} scroll={true} style={{ textDecoration: "none" }}>
                                        <div className="list-image">
                                          <img
                                            src={
                                              item.images?.[0] ||
                                              item.image ||
                                              "/no-image.png"
                                            }
                                            alt={item.title || item.name || "Medical Equipment"}
                                          />
                                        </div>
                                      </Link>
                                    </div>

                                    {/* DETAILS */}
                                    <div className="col-lg-6 col-md-8">
                                      <div className="list-content">
                                        <h4>
                                          <Link href={productUrl} scroll={true} style={{ color: "inherit", textDecoration: "none" }}>
                                            {item.title || item.name}
                                          </Link>
                                        </h4>

                                        <p>
                                          {item.desc || item.description || ""}
                                        </p>

                                        <div className="spec-grid">
                                          <div>
                                            <b>Brand</b>
                                            <span>
                                              {item.brand || "-"}
                                            </span>
                                          </div>

                                          <div>
                                            <b>Usage</b>
                                            <span>
                                              {item.usage || "-"}
                                            </span>
                                          </div>

                                          <div>
                                            <b>Model</b>
                                            <span>
                                              {item.model || "-"}
                                            </span>
                                          </div>

                                          <div>
                                            <b>Availability</b>
                                            <span>
                                              {item.availability || "-"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* ACTION */}
                                    <div className="col-lg-3">
                                      <div className="product-action">
                                        <Link
                                          href={productUrl}
                                          scroll={true}
                                          className="btn-view"
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            textDecoration: "none",
                                            width: "100%",
                                          }}
                                        >
                                          View Details
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          }

                          {list.length > limit && (
                            <div style={{ textAlign: "center", margin: "20px 0" }}>
                              <button
                                className="btn-view"
                                style={{ maxWidth: "260px", background: "linear-gradient(135deg, #1e3c72, #2a5298)" }}
                                onClick={() => {
                                  setCategoryLimits(prev => ({
                                    ...prev,
                                    [category]: (prev[category] || 15) + 30
                                  }));
                                }}
                              >
                                Show More Products ({list.length - limit} remaining)
                              </button>
                            </div>
                          )}

                        </div>

                      );

                    }

                  )

                )

              }



            </div>

          </div>

        </div>

      </section >
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={scrollToTop}
        >
          <FiArrowUp />
        </button>
      )}
    </>

  );
}