import { motion } from 'framer-motion';
import './SummaryCards.css';

function SummaryCards({ summary }) {
  const totalIncome = summary?.totals?.find((t) => t.type === 'income')?.total || 0;
  const totalExpense = summary?.totals?.find((t) => t.type === 'expense')?.total || 0;
  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(totalIncome),
      className: 'income',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
        </svg>
      ),
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(totalExpense),
      className: 'expense',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
        </svg>
      ),
    },
    {
      label: 'Net Balance',
      value: formatCurrency(netBalance),
      className: netBalance >= 0 ? 'positive' : 'negative',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className={`summary-card ${card.className}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="summary-card-icon">{card.icon}</div>
          <div className="summary-card-info">
            <span className="summary-card-label">{card.label}</span>
            <span className="summary-card-value">{card.value}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default SummaryCards;
