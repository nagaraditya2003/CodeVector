import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, RefreshCw, ChevronRight, ChevronLeft, ArrowRight, ShieldCheck } from "lucide-react";

export default function InteractiveGuide() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "1. The Initial Database State",
      description: "Imagine we have a database list of products sorted by ID in descending order. The user is currently reading Page 1, which displays the first 4 products. Page 2 is waiting to be loaded.",
      offsetItems: [
        { id: 10, name: "Product A", active: true, page: 1 },
        { id: 9, name: "Product B", active: true, page: 1 },
        { id: 8, name: "Product C", active: true, page: 1 },
        { id: 7, name: "Product D", active: true, page: 1 },
        { id: 6, name: "Product E", active: false, page: 2 },
        { id: 5, name: "Product F", active: false, page: 2 },
        { id: 4, name: "Product G", active: false, page: 2 },
      ],
      keysetItems: [
        { id: 10, name: "Product A", active: true, page: 1 },
        { id: 9, name: "Product B", active: true, page: 1 },
        { id: 8, name: "Product C", active: true, page: 1 },
        { id: 7, name: "Product D", active: true, page: 1 },
        { id: 6, name: "Product E", active: false, page: 2 },
        { id: 5, name: "Product F", active: false, page: 2 },
        { id: 4, name: "Product G", active: false, page: 2 },
      ],
    },
    {
      title: "2. Concurrent Database Insert",
      description: "While the user is reading Page 1, a backend process inserts a brand new product (Product NEW with ID 11) at the beginning of the table. Notice how it shifts all indices down.",
      offsetItems: [
        { id: 11, name: "Product NEW", highlight: "new", page: 1 },
        { id: 10, name: "Product A", page: 1 },
        { id: 9, name: "Product B", page: 1 },
        { id: 8, name: "Product C", page: 1 },
        { id: 7, name: "Product D", highlight: "shifted", page: 2 },
        { id: 6, name: "Product E", page: 2 },
        { id: 5, name: "Product F", page: 2 },
      ],
      keysetItems: [
        { id: 11, name: "Product NEW", highlight: "new", page: null },
        { id: 10, name: "Product A", page: 1 },
        { id: 9, name: "Product B", page: 1 },
        { id: 8, name: "Product C", page: 1 },
        { id: 7, name: "Product D", page: 1 },
        { id: 6, name: "Product E", page: 2 },
        { id: 5, name: "Product F", page: 2 },
      ],
    },
    {
      title: "3. Loading Page 2",
      description: "Now, the client triggers a load for Page 2. Let's see what happens to the output under both methods. Notice the error in Offset vs the stability in Keyset.",
      offsetItems: [
        { id: 11, name: "Product NEW", page: 1 },
        { id: 10, name: "Product A", page: 1 },
        { id: 9, name: "Product B", page: 1 },
        { id: 8, name: "Product C", page: 1 },
        { id: 7, name: "Product D", highlight: "duplicate", page: "duplicate" },
        { id: 6, name: "Product E", active: true, page: 2 },
        { id: 5, name: "Product F", active: true, page: 2 },
      ],
      keysetItems: [
        { id: 11, name: "Product NEW", page: null },
        { id: 10, name: "Product A", page: 1 },
        { id: 9, name: "Product B", page: 1 },
        { id: 8, name: "Product C", page: 1 },
        { id: 7, name: "Product D", page: 1 },
        { id: 6, name: "Product E", active: true, page: 2 },
        { id: 5, name: "Product F", active: true, page: 2 },
      ],
    },
  ];

  const currentStep = steps[step];

  return (
    <div style={s.page} className="container">
      {/* Header */}
      <div style={s.header}>
        <h2 style={s.subtitle}>EDUCATION GUIDE</h2>
        <h1 style={s.title}>How Keyset Prevents Shifting</h1>
        <p style={s.desc}>
          An interactive walkthrough demonstrating why traditional offsets fail during concurrent database inserts and how keysets solve it.
        </p>
      </div>

      {/* Stepper controls */}
      <div style={s.stepperRow}>
        <button
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          disabled={step === 0}
          style={{ ...s.stepArrow, opacity: step === 0 ? 0.3 : 1 }}
        >
          <ChevronLeft size={20} />
        </button>

        <div style={s.stepsIndicator}>
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                ...s.stepDot,
                backgroundColor: step === i ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                transform: step === i ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))}
          disabled={step === steps.length - 1}
          style={{ ...s.stepArrow, opacity: step === steps.length - 1 ? 0.3 : 1 }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Step Description Card */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={s.stepCard}
      >
        <h3 style={s.stepTitle}>{currentStep.title}</h3>
        <p style={s.stepDesc}>{currentStep.description}</p>
      </motion.div>

      {/* Comparison Grid */}
      <div style={s.comparisonGrid}>
        {/* OFFSET COLUMN */}
        <div style={s.column}>
          <div style={s.colHeader}>
            <span style={s.badgeBad}>OFFSET METHOD</span>
            <span style={s.colSub}>LIMIT 4 OFFSET 4</span>
          </div>

          <div style={s.itemsList}>
            <AnimatePresence mode="popLayout">
              {currentStep.offsetItems.map((item, idx) => {
                let badgeStyle = {};
                let label = "";

                if (item.highlight === "new") {
                  badgeStyle = s.itemNew;
                  label = "Inserted";
                } else if (item.highlight === "shifted") {
                  badgeStyle = s.itemShifted;
                  label = "Shifted to Page 2";
                } else if (item.highlight === "duplicate") {
                  badgeStyle = s.itemDuplicate;
                  label = "DUPLICATE!";
                } else if (item.page === 1) {
                  badgeStyle = s.itemPage1;
                  label = "Page 1";
                } else if (item.active) {
                  badgeStyle = s.itemPage2Active;
                  label = "Page 2 Output";
                } else {
                  badgeStyle = s.itemInactive;
                  label = "Pending Page 2";
                }

                return (
                  <motion.div
                    key={`offset-${item.id}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    style={{ ...s.itemRow, ...badgeStyle }}
                  >
                    <div>
                      <span style={s.itemId}>#{item.id}</span>
                      <strong style={s.itemName}>{item.name}</strong>
                    </div>
                    <span style={s.itemLabel}>{label}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {step === 2 && (
            <div style={s.summaryCardBad}>
              🚨 <strong>Duplicate Item Bug:</strong> Product D (ID 7) was already viewed on Page 1. But since a new product was inserted, Product D was shifted down and loaded <em>again</em> on Page 2!
            </div>
          )}
        </div>

        {/* KEYSET COLUMN */}
        <div style={s.column}>
          <div style={s.colHeader}>
            <span style={s.badgeGood}>KEYSET METHOD</span>
            <span style={s.colSub}>WHERE id &lt; 7 LIMIT 4</span>
          </div>

          <div style={s.itemsList}>
            <AnimatePresence mode="popLayout">
              {currentStep.keysetItems.map((item, idx) => {
                let badgeStyle = {};
                let label = "";

                if (item.highlight === "new") {
                  badgeStyle = s.itemIgnored;
                  label = "Ignored (above boundary)";
                } else if (item.page === 1) {
                  badgeStyle = s.itemPage1;
                  label = "Page 1";
                } else if (item.active) {
                  badgeStyle = s.itemPage2Active;
                  label = "Page 2 Output";
                } else {
                  badgeStyle = s.itemInactive;
                  label = "Pending Page 2";
                }

                return (
                  <motion.div
                    key={`keyset-${item.id}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    style={{ ...s.itemRow, ...badgeStyle }}
                  >
                    <div>
                      <span style={s.itemId}>#{item.id}</span>
                      <strong style={s.itemName}>{item.name}</strong>
                    </div>
                    <span style={s.itemLabel}>{label}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {step === 2 && (
            <div style={s.summaryCardGood}>
              🟢 <strong>Stable Pagination:</strong> Because keyset queries records strictly smaller than the last viewed item (Product D, ID 7), the query correctly ignores Product NEW (ID 11) and yields clean, duplicate-free results.
            </div>
          )}
        </div>
      </div>
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
    marginBottom: "32px",
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
  stepperRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    marginBottom: "24px",
  },
  stepArrow: {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border-color)",
    color: "#fff",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  stepsIndicator: {
    display: "flex",
    gap: "10px",
  },
  stepDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  stepCard: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "800px",
    margin: "0 auto 40px",
    textAlign: "center",
  },
  stepTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "8px",
    fontFamily: "var(--font-heading)",
  },
  stepDesc: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  comparisonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "30px",
    width: "100%",
  },
  column: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  colHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "14px",
  },
  colSub: {
    fontSize: "12px",
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
  },
  badgeBad: {
    fontSize: "12px",
    fontWeight: "800",
    color: "var(--error)",
    letterSpacing: "0.5px",
  },
  badgeGood: {
    fontSize: "12px",
    fontWeight: "800",
    color: "var(--success)",
    letterSpacing: "0.5px",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minHeight: "350px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid transparent",
  },
  itemId: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    marginRight: "10px",
  },
  itemName: {
    fontSize: "14px",
  },
  itemLabel: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  itemPage1: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    opacity: 0.8,
  },
  itemPage2Active: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    color: "#fff",
  },
  itemNew: {
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    border: "1px solid rgba(236, 72, 153, 0.4)",
    color: "#fca5a5",
  },
  itemShifted: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    border: "1px dashed rgba(239, 68, 68, 0.3)",
    color: "var(--text-secondary)",
  },
  itemDuplicate: {
    backgroundColor: "var(--error-bg)",
    border: "1px solid var(--error-border)",
    color: "var(--error)",
    boxShadow: "0 0 10px rgba(239, 68, 68, 0.2)",
  },
  itemIgnored: {
    backgroundColor: "rgba(255, 255, 255, 0.01)",
    border: "1px dashed var(--border-color)",
    color: "var(--text-muted)",
    opacity: 0.5,
  },
  itemInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--border-color)",
    color: "var(--text-muted)",
    opacity: 0.6,
  },
  summaryCardBad: {
    backgroundColor: "var(--error-bg)",
    border: "1px solid var(--error-border)",
    padding: "16px",
    borderRadius: "12px",
    color: "var(--text-primary)",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  summaryCardGood: {
    backgroundColor: "var(--success-bg)",
    border: "1px solid var(--success-border)",
    padding: "16px",
    borderRadius: "12px",
    color: "var(--text-primary)",
    fontSize: "13px",
    lineHeight: "1.6",
  },
};
