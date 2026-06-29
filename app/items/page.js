"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import "./items.css";
import toast, { Toaster } from "react-hot-toast";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  FiFilter,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function ItemsPage({ city }) {

  const router = useRouter();
  const [categorySearch, setCategorySearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [search, setSearch] = useState("");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [selectedUsage, setSelectedUsage] = useState("");
  const [pendingScroll, setPendingScroll] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [openedCategory,
    setOpenedCategory] =
    useState(null);
  const currentCity = city || "";

  const citySlug = currentCity
    ?.toLowerCase()
    ?.replace(/\s+/g, "-");


  /* -------------------------------- */

  /* FETCH PRODUCTS */

  /* -------------------------------- */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const allProducts = [];

        // CATEGORY PRODUCTS
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

        categorySnap.forEach((categoryDoc) => {

          const data = categoryDoc.data();

          const products =
            (data.products || []).map((item) => ({
              ...item,
              category:
                data.category ||
                categoryDoc.id
            }));

          allProducts.push(...products);

        });

        // OLD PRODUCTS
        const productSnap = await getDoc(
          doc(
            db,
            "websites",
            "indiandiagnostic",
            "pages",
            "products"
          )
        );

        if (productSnap.exists()) {

          const oldProducts =
            (productSnap.data().products || []).map(
              (item) => ({
                ...item,
                category:
                  item.category || "Other Products"
              })
            );

          allProducts.push(...oldProducts);
        }

        setProducts(allProducts);

      } catch (err) {

        console.log(err);

      } finally {

        setLoadingProducts(false);

      }

    };

    fetchProducts();

  }, []);




  /* -------------------------------- */

  /* FILTER PRODUCTS */

  /* -------------------------------- */

  const filteredProducts =
    useMemo(() => {

      return products

        .filter((p) => p.isPublished)

        .filter((item) => {

          const txt =
            `${item.title}
             ${item.brand}
             ${item.usage}`
              .toLowerCase();

          return (

            txt.includes(
              search.toLowerCase()
            )

            &&

            (
              selectedBrand
                ? item.brand === selectedBrand
                : true
            )

            &&

            (
              selectedUsage
                ? item.usage === selectedUsage
                : true
            )

          );

        });

    }, [
      products,
      search,
      selectedBrand,
      selectedUsage
    ]);



  /* -------------------------------- */

  /* GROUP CATEGORY */

  /* -------------------------------- */

  const groupedProducts =
    useMemo(() => {

      const obj = {};

      filteredProducts.forEach((item) => {

        if (!obj[item.category]) {

          obj[item.category] = [];

        }

        obj[item.category].push(item);

      });

      return obj;

    }, [filteredProducts]);



  const categoryNames =
    Object.keys(groupedProducts);



  const [activeCategory, setActiveCategory] =
    useState("");

  const currentActiveCategory =
    categoryNames.includes(activeCategory)
      ? activeCategory
      : categoryNames[0] || "";
  /* ============================================================
   FILTER OPTIONS
============================================================ */

  const brands = useMemo(() => {

    return [
      ...new Set(
        filteredProducts
          .map((item) => item.brand)
          .filter(Boolean)
      )
    ];

  }, [filteredProducts]);



  const usages = useMemo(() => {

    return [
      ...new Set(
        filteredProducts
          .map((item) => item.usage)
          .filter(Boolean)
      )
    ];

  }, [filteredProducts]);

  const scrollToProduct = (slug, category) => {
    setPendingScroll(slug);
    setOpenedCategory(category);
    setActiveCategory(category);
  };
  useEffect(() => {
    if (!pendingScroll) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(
        `product-${pendingScroll}`
      );

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      setPendingScroll(null);
    }, 300);

    return () => clearTimeout(timer);
  }, [openedCategory, pendingScroll]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const totalItems = filteredProducts.length;

  const totalPages =
    itemsPerPage === "all"
      ? 1
      : Math.ceil(
        totalItems /
        itemsPerPage
      );



  const paginatedProducts =
    itemsPerPage === "all"

      ? filteredProducts

      : filteredProducts.slice(

        (currentPage - 1) *
        itemsPerPage,

        currentPage *
        itemsPerPage

      );



  /* ============================================================
     GROUP PAGINATION
  ============================================================ */

  const paginatedGroupedProducts =
    useMemo(() => {

      const obj = {};

      paginatedProducts.forEach((item) => {

        if (!obj[item.category]) {

          obj[item.category] = [];

        }

        obj[item.category].push(item);

      });

      return obj;

    }, [paginatedProducts]);



  /* ============================================================
     SIDEBAR ACCORDION
  ============================================================ */



  // const currentOpenedCategory =
  //   groupedProducts[openedCategory]
  //     ? openedCategory
  //     : Object.keys(groupedProducts)[0] || "";
  const currentOpenedCategory = openedCategory;

  // useEffect(() => {
  //   if (
  //     openedCategory === null &&
  //     Object.keys(groupedProducts).length > 0
  //   ) {
  //     setOpenedCategory(
  //       Object.keys(groupedProducts)[0]
  //     );
  //   }
  // }, [groupedProducts]);
  const toggleCategory = (category) => {

    if (openedCategory === category) {

      setOpenedCategory(null);
      return;

    }

    setOpenedCategory(category);
    setActiveCategory(category);

  };



  /* ============================================================
     SCROLL TO CATEGORY
  ============================================================ */

  const scrollToCategory = (category) => {

    setOpenedCategory(category);

    setActiveCategory(category);

    const section =
      document.getElementById(

        category
          .replace(/\s+/g, "-")
          .toLowerCase()

      );

    if (section) {

      section.scrollIntoView({

        behavior: "smooth",

        block: "start"

      });

    }

  };



  /* ============================================================
     ACTIVE CATEGORY WHILE SCROLL
  ============================================================ */

  useEffect(() => {

    const handleScroll = () => {

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

      if (
        current &&
        current !== currentActiveCategory
      ) {
        // setOpenedCategory(current);
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
    currentActiveCategory
  ]);



  /* ============================================================
     RESET FILTER
  ============================================================ */

  const resetFilters = () => {

    setSearch("");

    setSelectedBrand("");

    setSelectedUsage("");

    setCurrentPage(1);
    setCategorySearch("");

  };



  /* ============================================================
     VIEW DETAILS
  ============================================================ */

  const viewDetails = (item) => {

    router.push(

      citySlug

        ? `/${citySlug}/items/${item.slug}`

        : `/items/${item.slug}`

    );

  };
  useEffect(() => {

    const handleTopButton = () => {

      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }

    };

    window.addEventListener(
      "scroll",
      handleTopButton
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleTopButton
      );

  }, []);
  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };
  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{
          zIndex: 99999,
        }}
      />

      {/* ===========================
            HERO
    =========================== */}

      <section className="item-banner">
        <div className="item-content">

          <h1>
            Medical Products
          </h1>

          <p>
            Find Diagnostic &
            Laboratory Products
          </p>

        </div>
      </section>

      {/* ===========================
            MAIN
    =========================== */}

      <section
        className="items-section"
        style={{
          overflow: "visible"
        }}
      >

        <div
          className="container-fluid"
          style={{
            overflow: "visible"
          }}
        >

          <div
            className="row"
            style={{
              alignItems: "flex-start",
            }}
          >

            {/* ===========================
                LEFT SIDEBAR
          =========================== */}

            <aside
              className="col-lg-3"
              style={{
                position: "sticky",
                top: "120px",
                alignSelf: "flex-start"
              }}
            >

              <div className="category-sidebar">

                <div className="sidebar-head">

                  <h4>
                    Categories
                  </h4>

                </div>

                <div className="category-search">

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Category..."
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                    }}
                  />

                </div>

                <div className="category-list">

                  {

                    Object.keys(
                      groupedProducts
                    )
                      .filter((category) =>
                        category
                          .toLowerCase()
                          .includes(
                            categorySearch.toLowerCase()
                          )
                      )
                      .map((category) => (

                        <div
                          className="category-item"
                          key={category}
                        >

                          <button

                            className={`category-btn

${currentActiveCategory === category
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

                                currentOpenedCategory === category

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

                                groupedProducts[
                                  category
                                ].length

                              }

                            </span>

                          </button>

                          <div

                            className={`category-content

                        ${currentOpenedCategory === category
                                ? "show"
                                : ""}

                        `}

                          >

                            {

                              // groupedProducts[
                              //   category
                              // ].map((item) => (
                              groupedProducts[category].map((item, index) => (

                                <button

                                  // key={item.slug}
                                  key={`${item.slug}-${index}`}

                                  className="product-link"

                                  onClick={() =>
                                    scrollToProduct(
                                      item.slug,
                                      category
                                    )
                                  }

                                >

                                  {item.title}

                                </button>

                              ))

                            }

                          </div>

                        </div>

                      ))

                  }

                </div>

              </div>

            </aside>

            {/* ===========================
                RIGHT SIDE
          =========================== */}

            <div className="col-lg-9">

              {/* FILTER */}

              <div className="filter-card">

                <div className="row g-3">

                  <div className="col-lg-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Product..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />

                  </div>

                  <div className="col-lg-3">

                    <select
                      className="form-select"
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
                Object.keys(groupedProducts).length === 0 ? (

                  <div
                    className="product-section"
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                      background: "#fff",
                      borderRadius: "16px",
                      marginTop: "20px"
                    }}
                  >
                    <h3>No Products Found</h3>

                    <p>
                      No products available for the selected filters.
                    </p>

                  </div>

                ) : (

                  Object.entries(
                    groupedProducts
                  ).map(

                    ([category, list]) => (

                      <div

                        key={category}

                        id={category
                          .replace(/\s+/g, "-")
                          .toLowerCase()}

                        className="product-section"

                      >

                        <div className="section-title">

                          <h3>{category}</h3>

                          <span>
                            {list.length}  Products per page
                          </span>

                        </div>

                        {

                          list.map((item, index) => (

                            <div
                              id={`product-${item.slug}`}
                              className="product-list-card"
                              key={`${item.slug}-${index}`}
                            >

                              <div className="row align-items-center">

                                <div className="col-lg-3">

                                  <div className="list-image">

                                    <img
                                      src={
                                        item.image ||
                                        "/no-image.png"
                                      }
                                      alt={item.title}
                                    />

                                  </div>

                                </div>

                                <div className="col-lg-6 col-md-8">

                                  <div className="list-content">

                                    <h4>{item.title}</h4>

                                    <p>{item.desc}</p>

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

                                <div className="col-lg-3">

                                  <div className="product-action">

                                    <button

                                      className="btn-view"

                                      onClick={() =>
                                        viewDetails(item)
                                      }

                                    >

                                      View Details

                                    </button>

                                  </div>

                                </div>

                              </div>

                            </div>

                          ))

                        }

                      </div>

                    )

                  )

                )
              }

              {/* PAGINATION */}

              <div className="pagination-card">

                <div className="pagination-wrapper">

                  <div className="page-left">

                    <span>

                      Per Page

                    </span>

                    <select

                      className="custom-select"

                      value={itemsPerPage}

                      onChange={(e) => {

                        const value =
                          e.target.value === "all"
                            ? "all"
                            : Number(
                              e.target.value
                            );

                        setItemsPerPage(
                          value
                        );

                        setCurrentPage(1);

                      }}

                    >

                      <option value={10}>10</option>

                      <option value={25}>25</option>

                      <option value={50}>50</option>

                      <option value={100}>100</option>

                      <option value="all">
                        All
                      </option>

                    </select>

                  </div>

                  <div className="page-right">

                    <button

                      className="btn"

                      disabled={
                        currentPage === 1
                      }

                      onClick={() =>

                        setCurrentPage(

                          p => p - 1

                        )

                      }

                    >

                      ◀

                    </button>

                    <button
                      className="btn btn-primary"
                    >

                      {

                        currentPage

                      }

                    </button>

                    <button

                      className="btn"

                      disabled={

                        currentPage ===

                        totalPages

                      }

                      onClick={() =>

                        setCurrentPage(

                          p => p + 1

                        )

                      }

                    >

                      ▶

                    </button>

                  </div>

                </div>

                {showTopBtn && (
                  <button
                    className="back-to-top-btn"
                    onClick={scrollToTop}
                  >
                    ↑
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </section >

    </>

  );
}