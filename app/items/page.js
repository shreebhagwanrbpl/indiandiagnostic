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
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedBrand, setSelectedBrand] = useState("");

  const [selectedUsage, setSelectedUsage] = useState("");

  const [showFilters, setShowFilters] = useState(false);


  const currentCity = city || "";

  const citySlug = currentCity
    ?.toLowerCase()
    ?.replace(/\s+/g, "-");



  /* -------------------------------- */

  /* TEMP CATEGORY GENERATOR */

  /* -------------------------------- */

  const getCategory = (item) => {

    const title = (item.title || "").toLowerCase();

    const usage = (item.usage || "").toLowerCase();

    if (
      title.includes("rapid") ||
      usage.includes("rapid")
    )
      return "Rapid Test Kits";

    if (
      title.includes("elisa")
    )
      return "ELISA Kits";

    if (
      title.includes("electrolyte")
    )
      return "Electrolyte Reagents";

    if (
      title.includes("hematology")
    )
      return "Hematology";

    if (
      title.includes("biochemistry")
    )
      return "Biochemistry";

    if (
      title.includes("urine")
    )
      return "Urine Test";

    return "Other Products";
  };



  /* -------------------------------- */

  /* FETCH PRODUCTS */

  /* -------------------------------- */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

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

        const raw =
          snap.data().products || [];

        const slugify = (text = "") =>
          text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        const formatted =
          raw.map((item) => ({

            ...item,

            title:
              item.title ||
              item.instrument ||
              item.model ||
              "Medical Equipment",

            slug:
              item.slug?.trim()
                ? item.slug
                : slugify(
                  item.title ||
                  item.instrument ||
                  item.model ||
                  `product-${item.productId}`
                ),

            category:
              getCategory(item),

          }));

        // Normal Products
        const normalProducts = formatted;

        // Category Products
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

        let categoryProducts = [];

        for (const categoryDoc of categorySnap.docs) {

          const categoryData = categoryDoc.data();

          const subSnap = await getDocs(
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
          );

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

        // Merge Both
        setProducts([
          ...normalProducts,
          ...categoryProducts,
        ]);

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

  const groupedProducts = useMemo(() => {

    const obj = {};

    filteredProducts.forEach((item) => {

      if (!obj[item.category]) {
        obj[item.category] = {};
      }

      const subCategory = item.subCategory || "Other";

      if (!obj[item.category][subCategory]) {
        obj[item.category][subCategory] = [];
      }

      obj[item.category][subCategory].push(item);

    });

    return obj;

  }, [filteredProducts]);



  const categoryNames =
    Object.keys(groupedProducts);



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


  /* ============================================================
     GROUP PAGINATION
  ============================================================ */

  const paginatedGroupedProducts = useMemo(() => {

    const obj = {};

    filteredProducts.forEach((item) => {

      if (!obj[item.category]) {
        obj[item.category] = [];
      }

      obj[item.category].push(item);

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

    setOpenedCategory((prev) => {
      return prev || categories[0];
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

    setSearch("");

    setSelectedBrand("");

    setSelectedUsage("");


  };



  /* ============================================================
     VIEW DETAILS
  ============================================================ */

  const viewDetails = (item) => {

    console.log("CLICKED");
    console.log("ITEM =", item);
    console.log(
      citySlug
        ? `/${citySlug}/items/${item.slug}`
        : `/items/${item.slug}`
    );

    router.push(
      citySlug
        ? `/${citySlug}/items/${item.slug}`
        : `/items/${item.slug}`
    );

  };



  return (
    <>

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
                  value={search}
                  onChange={(e) => {

                    setSearch(
                      e.target.value
                    );

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
                      value={search}
                      onChange={(e) => {

                        setSearch(
                          e.target.value
                        );

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

                Object.entries(
                  paginatedGroupedProducts
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

                        // list.map((item) => (
                        list.map((item, index) => (

                          <div
                            id={`product-${item.slug}`}
                            className="product-list-card"
                            key={`${item.slug}-${index}`}
                          >

                            <div className="row align-items-center">

                              {/* IMAGE */}

                              <div className="col-lg-3 col-md-4">

                                <div className="list-image">

                                  <img
                                    src={
                                      item.images?.[0] ||
                                      item.image ||
                                      "/no-image.png"
                                    }
                                    alt={item.title}
                                  />

                                </div>

                              </div>

                              {/* DETAILS */}

                              <div className="col-lg-6 col-md-8">

                                <div className="list-content">

                                  <h4>
                                    {item.title}
                                  </h4>

                                  <p>
                                    {item.desc}
                                  </p>

                                  <div className="spec-grid">

                                    <div>
                                      <b>Brand</b>

                                      <span>

                                        {
                                          item.brand ||
                                          "-"

                                        }

                                      </span>

                                    </div>

                                    <div>

                                      <b>Usage</b>

                                      <span>

                                        {
                                          item.usage ||
                                          "-"

                                        }

                                      </span>

                                    </div>

                                    <div>

                                      <b>Model</b>

                                      <span>

                                        {
                                          item.model ||
                                          "-"

                                        }

                                      </span>

                                    </div>

                                    <div>

                                      <b>Availability</b>

                                      <span>

                                        {
                                          item.availability ||
                                          "-"

                                        }

                                      </span>

                                    </div>

                                  </div>

                                </div>

                              </div>

                              {/* ACTION */}

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

                                  {/* <button

                                  className="btn-enquiry"

                                >

                                  Get Quote

                                </button> */}

                                </div>

                              </div>

                            </div>

                          </div>

                        ))

                      }

                    </div>

                  )

                )

              }



            </div>

          </div>

        </div>

      </section >

    </>

  );
}