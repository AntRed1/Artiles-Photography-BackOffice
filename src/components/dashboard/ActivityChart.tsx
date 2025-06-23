import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CloudinaryTrend {
  date: string;
  transformations: number;
  storage: number;
}

interface ActivityChartProps {
  trendData: CloudinaryTrend[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ trendData }) => {
  const [error, setError] = useState<string | null>(null);

  if (!trendData || trendData.length === 0) {
    setError("No hay datos disponibles para el gráfico de tendencias.");
  }

  if (error) {
    return (
      <div
        className="text-center p-6 text-red-600"
        role="alert"
        aria-live="assertive"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Tendencias de Cloudinary
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={trendData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          aria-label="Gráfico de tendencias de Cloudinary"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString([], {
                day: "numeric",
                month: "short",
              })
            }
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `${value.toFixed(0)} MB`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === "transformations"
                ? value.toLocaleString()
                : `${value.toFixed(2)} MB`,
              name === "transformations"
                ? "Transformaciones"
                : "Almacenamiento",
            ]}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString([], {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            }
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="transformations"
            stroke="#8b5cf6"
            name="Transformaciones"
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="storage"
            stroke="#3b82f6"
            name="Almacenamiento (MB)"
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
