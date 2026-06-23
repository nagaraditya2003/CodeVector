import { NavLink } from "react-router-dom";
import { LayoutDashboard, Database, BarChart3, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/catalog", label: "Catalog", icon: Database },
    { to: "/benchmark", label: "Benchmark", icon: BarChart3 },
    { to: "/guide", label: "How it Works", icon: HelpCircle },
  ];

  return (
    <header style={s.header}>
      <div className="container" style={s.container}>
        <NavLink to="/" style={s.logoSection}>
          <div style={s.logoGlow} />
          <span style={s.logoIcon}>📦</span>
          <div>
            <h1 style={s.logoText}>ProductBrowse</h1>
            <span style={s.logoSub}>Stable Pagination Demo</span>
          </div>
        </NavLink>

        <nav style={s.nav}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  ...s.navLink,
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                })}
              >
                {({ isActive }) => (
                  <div style={s.linkContent}>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        style={s.activeIndicator}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon size={16} style={{ zIndex: 2 }} />
                    <span style={{ ...s.navLabel, zIndex: 2 }}>{link.label}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

const s = {
  header: {
    backgroundColor: "rgba(9, 13, 22, 0.8)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border-color)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    padding: "12px 0",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    position: "relative",
  },
  logoGlow: {
    position: "absolute",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--accent-gradient)",
    filter: "blur(20px)",
    opacity: 0.4,
    left: "-10px",
    zIndex: -1,
  },
  logoIcon: {
    fontSize: "24px",
  },
  logoText: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    letterSpacing: "-0.5px",
    fontFamily: "var(--font-heading)",
  },
  logoSub: {
    fontSize: "11px",
    color: "var(--text-muted)",
    display: "block",
    marginTop: "-2px",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "4px",
    borderRadius: "24px",
  },
  navLink: {
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "20px",
    position: "relative",
    display: "inline-block",
    transition: "color 0.2s ease",
  },
  linkContent: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "20px",
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    inset: 0,
    background: "var(--accent-gradient)",
    borderRadius: "20px",
    zIndex: 1,
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
  },
  navLabel: {
    display: "inline-block",
  },
};
