import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Database, Filter } from "lucide-react";
import Filters from "../components/Filters";
import ProductCard from "../components/ProductCard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  const [cursor, setCursor] = useState(null);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalSeen, setTotalSeen] = useState(0);

  const fetchFirstPage = async (cat) => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (cat !== "All") params.category = cat;
      const res = await axios.get(`${API_BASE}/products`, { params });
      setProducts(res.data.data);
      setTotalSeen(res.data.data.length);
      setCursor(res.data.next_cursor);
      setHasMore(!!res.data.next_cursor);
    } catch (err) {
      console.error("Error fetching first page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCursor(null);
    setProducts([]);
    setTotalSeen(0);
    setHasMore(true);
    fetchFirstPage(category);
  }, [category]);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const params = { limit: 20, cursor };
      if (category !== "All") params.category = category;
      const res = await axios.get(`${API_BASE}/products`, { params });
      setProducts((prev) => [...prev, ...res.data.data]);
      setTotalSeen((prev) => prev + res.data.data.length);
      setCursor(res.data.next_cursor);
      setHasMore(!!res.data.next_cursor);
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoading(false);
    }
  };

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
            setCursor(null);
            setProducts([]);
            setTotalSeen(0);
            setHasMore(true);
            fetchFirstPage(category);
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
            Showing <strong>{totalSeen.toLocaleString()}</strong> products
            {category !== "All" && (
              <>
                {" "}
                in <strong style={{ color: "var(--accent-secondary)" }}>{category}</strong>
              </>
            )}
          </span>
        </div>
        {!hasMore && totalSeen > 0 && (
          <span style={s.endBadge}>All products loaded</span>
        )}
      </div>

      {/* Products Grid */}
      <div style={s.grid}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
          />
        ))}

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div style={s.emptyState}>
          <p>No products found in this category.</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && products.length > 0 && (
        <div style={s.loadMoreRow}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={s.loadMoreBtn}
            onClick={loadMore}
          >
            Load 20 More Products
          </motion.button>
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
  endBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--success)",
    backgroundColor: "var(--success-bg)",
    border: "1px solid var(--success-border)",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
    width: "100%",
  },
  loadMoreRow: {
    display: "flex",
    justifyContent: "center",
    margin: "40px 0 20px",
  },
  loadMoreBtn: {
    padding: "14px 36px",
    fontSize: "14px",
    fontWeight: "700",
    backgroundColor: "#fff",
    color: "var(--bg-primary)",
    border: "none",
    borderRadius: "28px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(255, 255, 255, 0.1)",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 0",
    color: "var(--text-secondary)",
    fontSize: "14px",
  },
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
