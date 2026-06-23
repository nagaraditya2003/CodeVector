import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import BenchmarkCenter from "./pages/BenchmarkCenter";
import InteractiveGuide from "./pages/InteractiveGuide";

export default function App() {
  return (
    <BrowserRouter>
      <div style={s.layout}>
        {/* Navigation bar */}
        <Navbar />
        
        {/* Main Content Area */}
        <main style={s.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/benchmark" element={<BenchmarkCenter />} />
            <Route path="/guide" element={<InteractiveGuide />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer style={s.footer}>
          <div className="container" style={s.footerInner}>
            <span>ProductBrowse Pagination Demo &middot; keyset queries index-backed</span>
            <span style={s.footerRight}>Powered by PostgreSQL + React</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

const s = {
  layout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--bg-primary)",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  footer: {
    borderTop: "1px solid var(--border-color)",
    padding: "24px 0",
    color: "var(--text-muted)",
    fontSize: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  footerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  footerRight: {
    color: "var(--text-secondary)",
  },
};
