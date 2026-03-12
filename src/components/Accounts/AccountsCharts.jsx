import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './AccountsCharts.css';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#1a7f64', '#2c5282', '#d97706', '#dc2626', '#7c3aed', '#059669', '#0891b2', '#be185d', '#ca8a04'];

function AccountsCharts({ summary }) {
  const monthlyData = MONTH_LABELS.map((label, i) => {
    const month = String(i + 1).padStart(2, '0');
    const inc = summary?.monthly?.find((m) => m.month === month && m.type === 'income')?.total || 0;
    const exp = summary?.monthly?.find((m) => m.month === month && m.type === 'expense')?.total || 0;
    return { name: label, Income: inc, Expense: exp };
  });

  const categoryData = (summary?.byCategory || [])
    .filter((c) => c.type === 'expense')
    .map((c) => ({ name: c.category, value: c.total }));

  const hasMonthlyData = monthlyData.some((d) => d.Income > 0 || d.Expense > 0);
  const hasCategoryData = categoryData.length > 0;

  const formatCurrency = (val) => {
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val;
  };

  return (
    <div className="accounts-charts">
      <div className="chart-panel">
        <h3 className="chart-title">Monthly Overview</h3>
        {hasMonthlyData ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)} />
              <Bar dataKey="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">No data for this year</div>
        )}
      </div>

      <div className="chart-panel">
        <h3 className="chart-title">Expenses by Category</h3>
        {hasCategoryData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2} label={({ name }) => name}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">No expense data yet</div>
        )}
      </div>
    </div>
  );
}

export default AccountsCharts;
