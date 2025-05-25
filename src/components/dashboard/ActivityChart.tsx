import React, { useEffect, useState, useCallback } from "react";
import { fetchVisitors } from "../../services/plausibleService";
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

interface PlausibleTimeseries {
  date: string;
  visitors: number;
  pageviews: number;
}

interface ActivityChartProps {
  period: string;
}

const ActivityChart: React.FC<ActivityChartProps> = ({ period }) => {
  const [data, setData] = useState<PlausibleTimeseries[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const timeseries = await fetchVisitors(period);
      setData(timeseries);
      setError(null);
    } catch (error) {
      console.error("Error fetching Plausible data:", error);
      setError("No se pudo cargar el gráfico de actividad.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        Actividad del Sitio
      </h2>
      {loading && (
        <div className="text-center p-2 text-gray-600 text-sm animate-pulse">
          Cargando gráfico...
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          aria-label="Gráfico de actividad del sitio"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
          />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), ""]}
            labelFormatter={(label) =>
              new Date(label).toLocaleString([], {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#4f46e5"
            name="Visitantes Únicos"
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="pageviews"
            stroke="#22c55e"
            name="Vistas de Página"
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
