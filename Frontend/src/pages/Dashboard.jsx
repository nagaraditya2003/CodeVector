import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, Zap, ShieldCheck, ArrowRight, BookOpen, Layers } from "lucide-react";

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const cards = [
    {
      icon: Database,
      title: "Huge Dataset Scale",
      value: "200,000+",
      desc: "Simulating enterprise volume where traditional offset pagination slows to a crawl.",
      color: "#3b82f6",
    },
    {
      icon: Zap,
      title: "Sub-millisecond Latency",
      value: "O(1) Keyset",
      desc: "Query execution times remain constant regardless of how deep the user pages.",
      color: "#10b981",
    },
    {
      icon: ShieldCheck,
      title: "Cryptographic Security",
      value: "HMAC signed",
      desc: "Cursors are cryptographically signed using HMAC sha256 to prevent clients from tampering with boundaries.",
      color: "#a855f7",
    },
    {
      icon: Layers,
      title: "Stable Paging state",
      value: "Consistent state",
      desc: "No duplicate or skipped products when records are added or deleted concurrently.",
      color: "#ec4899",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={s.page}
      className="container"
    >
      {/* Hero section */}
      <motion.div variants={itemVariants} style={s.hero}>
        <div style={s.heroGlow} />
        <h2 style={s.tagline}>FAST & SECURE PAGINATION DEMO</h2>
        <h1 style={s.title}>
          Infinite Pagination, <span className="text-gradient">Zero Latency Degradation</span>
        </h1>
        <p style={s.subtitle}>
          Compare the performance of standard SQL <code>OFFSET</code> pagination against cryptographic <code>KEYSET</code> pagination using a database populated with over 200,000 records.
        </p>

        <div style={s.ctaGroup}>
          <Link to="/catalog" style={s.primaryBtn}>
            Browse Products <ArrowRight size={18} />
          </Link>
          <Link to="/benchmark" style={s.secondaryBtn}>
            Run Speed Benchmark <Zap size={16} />
          </Link>
          <Link to="/guide" style={s.outlineBtn}>
            <BookOpen size={16} /> Explain Mechanics
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} style={s.grid}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -8, borderColor: "var(--border-hover)", boxShadow: "var(--shadow-glow)" }}
              style={s.card}
            >
              <div style={{ ...s.iconWrapper, backgroundColor: `${card.color}15`, color: card.color }}>
                <Icon size={24} />
              </div>
              <span style={s.cardValue}>{card.value}</span>
              <h3 style={s.cardTitle}>{card.title}</h3>
              <p style={s.cardDesc}>{card.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Informative banner */}
      <motion.div variants={itemVariants} style={s.banner}>
        <div style={s.bannerContent}>
          <h3 style={s.bannerTitle}>The Keyset Pagination Advantage</h3>
          <p style={s.bannerText}>
            Traditional database pagination uses <code>OFFSET</code>, which forces the database engine to scan and discard thousands of rows. Keyset pagination remembers the values of the last record seen and queries directly after it using database indices, making it blisteringly fast even at huge depths.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const s = {
  page: {
    padding: "60px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "60px",
    flex: 1,
  },
  hero: {
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "var(--accent-gradient)",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: 0.15,
    top: "-50px",
    left: "calc(50% - 150px)",
    zIndex: -1,
  },
  tagline: {
    fontSize: "13px",
    fontWeight: "800",
    color: "var(--accent-primary)",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "800",
    color: "#fff",
    lineHeight: "1.2",
    marginBottom: "24px",
    letterSpacing: "-1px",
    fontFamily: "var(--font-heading)",
  },
  subtitle: {
    fontSize: "16px",
    color: "var(--text-secondary)",
    lineHeight: "1.7",
    marginBottom: "40px",
  },
  ctaGroup: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    borderRadius: "28px",
    background: "var(--accent-gradient)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    textDecoration: "none",
    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  secondaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    borderRadius: "28px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--border-color)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    textDecoration: "none",
    transition: "background-color 0.2s, border-color 0.2s",
  },
  outlineBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    borderRadius: "28px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    fontWeight: "600",
    fontSize: "14px",
    textDecoration: "none",
    transition: "color 0.2s, border-color 0.2s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
    width: "100%",
  },
  card: {
    backgroundColor: "var(--bg-card)",
    borderRadius: "16px",
    border: "1px solid var(--border-color)",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "8px",
    fontFamily: "var(--font-heading)",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "12px",
    fontFamily: "var(--font-heading)",
  },
  cardDesc: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  banner: {
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    padding: "32px",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  bannerContent: {
    position: "relative",
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "12px",
    fontFamily: "var(--font-heading)",
  },
  bannerText: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.7",
  },
};
