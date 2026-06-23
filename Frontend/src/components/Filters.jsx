import { motion } from "framer-motion";

const CATEGORY_COLORS = {
  All: { bg: "rgba(99, 102, 241, 0.1)", text: "#a5b4fc", dot: "#6366f1" },
  Electronics: { bg: "rgba(59, 130, 246, 0.1)", text: "#93c5fd", dot: "#3b82f6" },
  Clothing: { bg: "rgba(236, 72, 153, 0.1)", text: "#f9a8d4", dot: "#ec4899" },
  Books: { bg: "rgba(245, 158, 11, 0.1)", text: "#fde047", dot: "#f59e0b" },
  "Home & Kitchen": { bg: "rgba(16, 185, 129, 0.1)", text: "#6ee7b7", dot: "#10b981" },
  "Sports & Outdoors": { bg: "rgba(239, 68, 68, 0.1)", text: "#fca5a5", dot: "#ef4444" },
  "Beauty & Personal Care": { bg: "rgba(139, 92, 246, 0.1)", text: "#c4b5fd", dot: "#8b5cf6" },
  "Toys & Games": { bg: "rgba(249, 115, 22, 0.1)", text: "#fed7aa", dot: "#f97316" },
  Automotive: { bg: "rgba(20, 184, 166, 0.1)", text: "#99f6e4", dot: "#14b8a6" },
};

export default function Filters({ categories, selected, onSelect }) {
  return (
    <div style={styles.container}>
      {categories.map((cat) => {
        const isActive = selected === cat;
        const colorData = CATEGORY_COLORS[cat] || CATEGORY_COLORS.All;

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              ...styles.btn,
              color: isActive ? "#ffffff" : "var(--text-secondary)",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                style={{
                  ...styles.activeIndicator,
                  background: `linear-gradient(135deg, ${colorData.dot} 0%, rgba(99, 102, 241, 0.8) 100%)`,
                  boxShadow: `0 4px 12px ${colorData.dot}40`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span style={{ ...styles.content, zIndex: 2 }}>
              <span
                style={{
                  ...styles.dot,
                  backgroundColor: isActive ? "#ffffff" : colorData.dot,
                }}
              />
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    padding: "24px 0",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  btn: {
    padding: "8px 18px",
    borderRadius: "20px",
    border: "1px solid var(--border-color)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "color 0.2s ease, border-color 0.2s ease",
    position: "relative",
    outline: "none",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    display: "inline-block",
    transition: "background-color 0.2s ease",
  },
  activeIndicator: {
    position: "absolute",
    inset: -1,
    borderRadius: "20px",
    zIndex: 1,
  },
};
