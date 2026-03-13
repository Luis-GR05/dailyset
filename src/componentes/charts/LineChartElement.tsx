import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataItem {
  name: string;
  value: number;
}

interface LineChartElementProps {
  items: DataItem[];
  title: string;
  height?: number;
  width?: number | `${number}%`;
  showGrid?: boolean;
  showAxis?: boolean;
  lineColor?: string;
}

export default function LineChartElement({
  items,
  title,
  height = 150,
  width = "100%",
  showGrid = true,
  showAxis = true,
  lineColor = 'var(--color-brand-accent)'
}: LineChartElementProps) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-2 text-[var(--color-brand-accent)]">{title}</h3>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={items}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-white)" />}
          {showAxis && <XAxis dataKey="name" stroke="var(--color-white)" />}
          {showAxis && <YAxis stroke="var(--color-white)" />}
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
