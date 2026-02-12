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
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={items}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
