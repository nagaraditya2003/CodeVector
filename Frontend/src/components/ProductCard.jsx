import { motion } from "framer-motion";

const CATEGORY_COLORS = {
  Electronics: { bg: "rgba(59, 130, 246, 0.1)", text: "#93c5fd", dot: "#3b82f6" },
  Clothing: { bg: "rgba(236, 72, 153, 0.1)", text: "#f9a8d4", dot: "#ec4899" },
  Books: { bg: "rgba(245, 158, 11, 0.1)", text: "#fde047", dot: "#f59e0b" },
  "Home & Kitchen": { bg: "rgba(16, 185, 129, 0.1)", text: "#6ee7b7", dot: "#10b981" },
  "Sports & Outdoors": { bg: "rgba(239, 68, 68, 0.1)", text: "#fca5a5", dot: "#ef4444" },
  "Beauty & Personal Care": { bg: "rgba(139, 92, 246, 0.1)", text: "#c4b5fd", dot: "#8b5cf6" },
  "Toys & Games": { bg: "rgba(249, 115, 22, 0.1)", text: "#fed7aa", dot: "#f97316" },
  Automotive: { bg: "rgba(20, 184, 166, 0.1)", text: "#99f6e4", dot: "#14b8a6" },
};

export default function ProductCard({ product, index }) {
  const color = CATEGORY_COLORS[product.category] || {
    bg: "rgba(156, 163, 175, 0.1)",
    text: "#d1d5db",
    dot: "#9ca3af",
  };

  const formattedPrice = parseFloat(product.price).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const date = new Date(product.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Calculate staggering delays for initial page load entry animations
  const delay = index ? Math.min((index % 20) * 0.04, 0.5) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
      whileHover={{ y: -5, borderColor: "var(--border-hover)", boxShadow: "var(--shadow-glow)" }}
      style={s.card}
    >
      <div style={s.cardTop}>
        <span
          style={{ ...s.badge, backgroundColor: color.bg, color: color.text }}
        >
          <span style={{ ...s.badgeDot, backgroundColor: color.dot }} />
          {product.category}
        </span>
        <span style={s.cardId}>#{product.id}</span>
      </div>
      
      <h3 style={s.cardName}>{product.name}</h3>
      
      <div style={s.cardBottom}>
        <div style={s.priceWrapper}>
          <span style={s.currency}>₹</span>
          <span style={s.price}>{formattedPrice}</span>
        </div>
        <span style={s.cardDate}>{date}</span>
      </div>
    </motion.div>
  );
}

const s = {
  card: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "14px",
    border: "1px solid var(--border-color)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    position: "relative",
    overflow: "hidden",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    display: "inline-block",
  },
  cardId: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontWeight: "500",
  },
  cardName: {
    margin: "4px 0 0 0",
    fontSize: "15px",
    fontWeight: "600",
    color: "#fff",
    lineHeight: "1.5",
    fontFamily: "var(--font-heading)",
  },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "14px",
    borderTop: "1px solid var(--border-color)",
  },
  priceWrapper: {
    display: "flex",
    alignItems: "baseline",
    gap: "2px",
  },
  currency: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--accent-primary)",
  },
  price: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    fontFamily: "var(--font-heading)",
  },
  cardDate: {
    fontSize: "11px",
    color: "var(--text-secondary)",
  },
};
