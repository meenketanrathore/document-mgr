import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, LabelList,
} from 'recharts';
import './ExpenseSplit.css';

const ALL_MEMBERS = [
  'Chemendra', 'Meenketan', 'Chandresh', 'Harish',
  'Mukesh', 'Yogendra', 'Pankaj', 'Panna', 'Prawesh',
];

const MEMBER_COUNT = ALL_MEMBERS.length;

const currencyFmt = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v);

const shortFmt = (v) => {
  const abs = Math.abs(v);
  if (abs >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toFixed(0);
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const amount = d.settlement;
  return (
    <div className="split-tooltip">
      <p className="split-tooltip-name">{d.name}</p>
      <p className="split-tooltip-spent">Spent: {currencyFmt(d.spent)}</p>
      <p className="split-tooltip-share">Fair Share: {currencyFmt(d.fairShare)}</p>
      <hr className="split-tooltip-hr" />
      {amount > 0 ? (
        <p className="split-tooltip-result gets">Gets back {currencyFmt(amount)}</p>
      ) : amount < 0 ? (
        <p className="split-tooltip-result owes">Needs to pay {currencyFmt(Math.abs(amount))}</p>
      ) : (
        <p className="split-tooltip-result settled">Settled!</p>
      )}
    </div>
  );
}

function ExpenseSplit({ summary }) {
  const splitData = useMemo(() => {
    const byPerson = summary?.byPerson || [];
    const expenseByPerson = {};
    byPerson
      .filter((p) => p.type === 'expense')
      .forEach((p) => {
        expenseByPerson[p.person] = (expenseByPerson[p.person] || 0) + p.total;
      });

    const totalExpenses = Object.values(expenseByPerson).reduce((a, b) => a + b, 0);
    const fairShare = totalExpenses / MEMBER_COUNT;

    const members = ALL_MEMBERS.map((name) => {
      const spent = expenseByPerson[name] || 0;
      const settlement = spent - fairShare;
      return { name, spent, fairShare, settlement };
    });

    members.sort((a, b) => b.settlement - a.settlement);

    const overpayers = members.filter((m) => m.settlement > 0);
    const underpayers = members.filter((m) => m.settlement < 0);

    const transfers = [];
    let oi = 0;
    let ui = 0;
    const oBalances = overpayers.map((o) => o.settlement);
    const uBalances = underpayers.map((u) => Math.abs(u.settlement));

    while (oi < overpayers.length && ui < underpayers.length) {
      const amount = Math.min(oBalances[oi], uBalances[ui]);
      if (amount > 0.5) {
        transfers.push({
          from: underpayers[ui].name,
          to: overpayers[oi].name,
          amount: Math.round(amount),
        });
      }
      oBalances[oi] -= amount;
      uBalances[ui] -= amount;
      if (oBalances[oi] < 0.5) oi++;
      if (uBalances[ui] < 0.5) ui++;
    }

    return { totalExpenses, fairShare, members, transfers };
  }, [summary]);

  const { totalExpenses, fairShare, members, transfers } = splitData;
  const hasData = totalExpenses > 0;

  return (
    <div className="expense-split-section">
      <div className="split-header">
        <div className="split-header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <h3 className="split-title">Equal Expense Split</h3>
          <p className="split-subtitle">{MEMBER_COUNT} members &middot; Fair share per person</p>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="split-summary-row">
            <div className="split-stat">
              <span className="split-stat-label">Total Expenses</span>
              <span className="split-stat-value total">{currencyFmt(totalExpenses)}</span>
            </div>
            <div className="split-stat-divider" />
            <div className="split-stat">
              <span className="split-stat-label">Per Person Share</span>
              <span className="split-stat-value share">{currencyFmt(fairShare)}</span>
            </div>
            <div className="split-stat-divider" />
            <div className="split-stat">
              <span className="split-stat-label">Members</span>
              <span className="split-stat-value members">{MEMBER_COUNT}</span>
            </div>
          </div>

          <div className="split-chart-container">
            <p className="split-chart-legend">
              <span className="legend-dot gets" /> Gets back
              <span className="legend-dot owes" /> Needs to pay
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={members}
                layout="vertical"
                margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={shortFmt}
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13, fontWeight: 500 }}
                  width={95}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Bar dataKey="settlement" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {members.map((m, i) => (
                    <Cell
                      key={i}
                      fill={m.settlement >= 0 ? '#16a34a' : '#dc2626'}
                      fillOpacity={0.85}
                    />
                  ))}
                  <LabelList
                    dataKey="settlement"
                    position="right"
                    formatter={(v) => currencyFmt(Math.abs(v))}
                    style={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {transfers.length > 0 && (
            <div className="split-transfers">
              <h4 className="transfers-title">Settlement Transfers</h4>
              <p className="transfers-subtitle">Minimum transfers to settle all balances</p>
              <div className="transfers-list">
                {transfers.map((t, i) => (
                  <div key={i} className="transfer-row">
                    <span className="transfer-from">{t.from}</span>
                    <span className="transfer-arrow">
                      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                        <path d="M1 7h16M13 1l5 6-5 6" stroke="#1a7f64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="transfer-to">{t.to}</span>
                    <span className="transfer-amount">{currencyFmt(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="split-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>No expenses recorded yet for this year.<br />Add expense transactions to see the split.</p>
        </div>
      )}
    </div>
  );
}

export default ExpenseSplit;
