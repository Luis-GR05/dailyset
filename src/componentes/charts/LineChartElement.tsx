import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataItem {
  name: string;
  value: string | number;
}

interface LineChartElementProps {
  items: DataItem[];
  title: string;
}

export default function LineChartElement({ items, title }: LineChartElementProps) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-2 text-[var(--color-brand-accent)]">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={items}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-white)" />
          <XAxis dataKey="name" stroke="var(--color-white)" />
          <YAxis stroke="var(--color-white)" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="var(--color-brand-accent)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
