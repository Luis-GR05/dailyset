import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataItem {
  name: string;
  value: number;
}

interface LineChartElementProps {
  items: DataItem[];
  title: string;
  // Props para personalizar el tamaño y apariencia
  height?: number;          // Altura del contenedor (por defecto 150)
  width?: string | number;  // Ancho (por defecto "100%")
  showGrid?: boolean;       // Mostrar cuadrícula (por defecto true)
  showAxis?: boolean;       // Mostrar ejes X e Y (por defecto true)
  lineColor?: string;       // Color de la línea (por defecto tu variable de color)
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
