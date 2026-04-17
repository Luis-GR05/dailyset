import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BarConfig {
  key: string;
  color: string;
  name?: string;
  radius?: [number, number, number, number];
}

interface ColumnChartProps {
  data: any[];
  xAxisKey: string;
  bars: BarConfig[];
  className?: string;
  height?: number | string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-2 border rounded shadow-lg text-xs"
        style={{
          backgroundColor: 'var(--color-neutral-800)',
          borderColor: 'var(--color-neutral-900)',
          color: 'var(--color-white)',
        }}
      >
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name || entry.dataKey}: <span className="ml-1" style={{ color: 'var(--color-white)' }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ColumnChart = ({ data, xAxisKey, bars, className, height = 300 }: ColumnChartProps) => {
  const axisTickColor = 'var(--color-neutral-2000)';

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisTickColor, fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisTickColor, fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-primary-muted)' }} />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color}
              radius={bar.radius || [4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ColumnChart;