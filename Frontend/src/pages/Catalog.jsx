import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Database,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const PAGE_SIZE = 20;

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Beauty & Personal Care",
  "Toys & Games",
  "Automotive",
];

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [goToInput, setGoToInput] = useState("");

  const fetchPage = async (page, cat) => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (cat !== "All") params.category = cat;
      const res = await axios.get(`${API_BASE}/products/paged`, { params });
      setProducts(res.data.data);
      setTotalPages(res.data.total_pages);
      setTotalCount(res.data.total_count);
      setCurrentPage(res.data.page);
    } catch (err) {
      console.error("Error fetching page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchPage(1, category);
  }, [category]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage || loading) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchPage(page, category);
  };

  const handleGoToPage = () => {
    const page = parseInt(goToInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      goToPage(page);
      setGoToInput("");
    }
  };

  // Build the array of page numbers to display
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      const leftBound = Math.max(2, currentPage - 2);
      const rightBound = Math.min(totalPages - 1, currentPage + 2);

      if (leftBound > 2) pages.push("...");
      for (let i = leftBound; i <= rightBound; i++) pages.push(i);
      if (rightBound < totalPages - 1) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div style={s.page} className="container">
      {/* Page Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.subtitle}>REAL-TIME KEYSET PAGINATION</h2>
          <h1 style={s.title}>Product Catalog</h1>
          <p style={s.desc}>
            Browse items inside our indexed database. Changing categories triggers a clean keyset reset.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentPage(1);
            fetchPage(1, category);
          }}
          style={s.refreshBtn}
          title="Reset and refresh"
        >
          <RefreshCw size={16} /> Reset
        </button>
      </div>

      {/* Category selector */}
      <div style={s.filterSection}>
        <div style={s.filterLabel}>
          <Filter size={16} />
          <span>Filter by Category</span>
        </div>
        <Filters
          categories={CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      {/* Stats Bar */}
      <div style={s.statsBar}>
        <div style={s.statsText}>
          <Database size={14} style={{ color: "var(--accent-primary)" }} />
          <span>
            Showing <strong>{startItem.toLocaleString()}</strong>–<strong>{endItem.toLocaleString()}</strong> of{" "}
            <strong>{totalCount.toLocaleString()}</strong> products
            {category !== "All" && (
              <>
                {" "}
                in <strong style={{ color: "var(--accent-secondary)" }}>{category}</strong>
              </>
            )}
          </span>
        </div>
        <span style={s.pageBadge}>
          Page {currentPage} of {totalPages.toLocaleString()}
        </span>
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${category}-${currentPage}`}
          style={s.grid}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div style={s.emptyState}>
          <p>No products found in this category.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={s.paginationWrapper}>
          <div style={s.paginationBar}>
            {/* First */}
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1 || loading}
              style={{
                ...s.pageBtn,
                ...s.navBtn,
                ...(currentPage === 1 ? s.pageBtnDisabled : {}),
              }}
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              style={{
                ...s.pageBtn,
                ...s.navBtn,
                ...(currentPage === 1 ? s.pageBtnDisabled : {}),
              }}
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            <div style={s.pageNumbers}>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} style={s.ellipsis}>
                    •••
                  </span>
                ) : (
                  <motion.button
                    key={p}
                    onClick={() => goToPage(p)}
                    disabled={loading}
                    whileHover={p !== currentPage ? { scale: 1.08 } : {}}
                    whileTap={p !== currentPage ? { scale: 0.94 } : {}}
                    style={{
                      ...s.pageBtn,
                      ...(p === currentPage ? s.pageBtnActive : {}),
                    }}
                  >
                    {p}
                  </motion.button>
                )
              )}
            </div>

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              style={{
                ...s.pageBtn,
                ...s.navBtn,
                ...(currentPage === totalPages ? s.pageBtnDisabled : {}),
              }}
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>

            {/* Last */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages || loading}
              style={{
                ...s.pageBtn,
                ...s.navBtn,
                ...(currentPage === totalPages ? s.pageBtnDisabled : {}),
              }}
              title="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>

          {/* Go to Page */}
          <div style={s.goToRow}>
            <span style={s.goToLabel}>Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={goToInput}
              onChange={(e) => setGoToInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
              placeholder={`1–${totalPages}`}
              style={s.goToInput}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToPage}
              disabled={loading || !goToInput}
              style={{
                ...s.goToBtn,
                ...(loading || !goToInput ? { opacity: 0.4, pointerEvents: "none" } : {}),
              }}
            >
              Go
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={s.skeleton}>
      <div style={s.skeletonBadge} className="shimmer" />
      <div style={s.skeletonTitle} className="shimmer" />
      <div style={s.skeletonTitleShort} className="shimmer" />
      <div style={s.skeletonBottom}>
        <div style={s.skeletonPrice} className="shimmer" />
        <div style={s.skeletonDate} className="shimmer" />
      </div>
      <style>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.03) 25%,
            rgba(255, 255, 255, 0.08) 37%,
            rgba(255, 255, 255, 0.03) 63%
          );
          background-size: 400% 100%;
          animation: shimmer-anim 1.4s ease infinite;
        }
        @keyframes shimmer-anim {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    padding: "40px 24px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  subtitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "var(--accent-primary)",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 8px 0",
    fontFamily: "var(--font-heading)",
  },
  desc: {
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    border: "1px solid var(--border-color)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s, border-color 0.2s",
  },
  filterSection: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    padding: "16px 24px",
    marginBottom: "24px",
  },
  filterLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  statsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  statsText: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  pageBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--accent-primary)",
    backgroundColor: "var(--accent-glow)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
    width: "100%",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 0",
    color: "var(--text-secondary)",
    fontSize: "14px",
  },

  /* ── Pagination Styles ── */
  paginationWrapper: {
    display: "flex",
    justifyContent: "center",
    margin: "40px 0 20px",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
  },
  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px",
    height: "36px",
    padding: "0 10px",
    borderRadius: "10px",
    border: "1px solid transparent",
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "var(--font-sans)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    userSelect: "none",
  },
  pageBtnActive: {
    background: "var(--accent-gradient)",
    color: "#fff",
    fontWeight: "700",
    border: "1px solid transparent",
    boxShadow: "0 2px 10px rgba(99, 102, 241, 0.35)",
    cursor: "default",
  },
  pageBtnDisabled: {
    opacity: 0.3,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  navBtn: {
    color: "var(--text-muted)",
  },
  ellipsis: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "36px",
    color: "var(--text-muted)",
    fontSize: "12px",
    letterSpacing: "2px",
    userSelect: "none",
  },

  /* ── Go to Page ── */
  goToRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "12px",
    justifyContent: "center",
  },
  goToLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  goToInput: {
    width: "90px",
    height: "34px",
    padding: "0 10px",
    borderRadius: "10px",
    border: "1px solid var(--border-color)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "var(--font-sans)",
    outline: "none",
    textAlign: "center",
    transition: "border-color 0.2s",
    MozAppearance: "textfield",
  },
  goToBtn: {
    height: "34px",
    padding: "0 18px",
    borderRadius: "10px",
    border: "none",
    background: "var(--accent-gradient)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "var(--font-sans)",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
  },

  /* ── Skeleton ── */
  skeleton: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "14px",
    border: "1px solid var(--border-color)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "172px",
  },
  skeletonBadge: {
    width: "80px",
    height: "20px",
    borderRadius: "10px",
  },
  skeletonTitle: {
    width: "80%",
    height: "16px",
    borderRadius: "4px",
    marginTop: "8px",
  },
  skeletonTitleShort: {
    width: "40%",
    height: "16px",
    borderRadius: "4px",
  },
  skeletonBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "14px",
    borderTop: "1px solid var(--border-color)",
  },
  skeletonPrice: {
    width: "60px",
    height: "20px",
    borderRadius: "4px",
  },
  skeletonDate: {
    width: "70px",
    height: "12px",
    borderRadius: "3px",
  },
};
