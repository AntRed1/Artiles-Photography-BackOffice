import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { EChartsType } from "echarts";

const ActivityChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const myChart: EChartsType = echarts.init(chartRef.current);

      const option = {
        animation: true,
        tooltip: { trigger: "axis" as const },
        legend: {
          data: ["Nuevos Usuarios", "Subidas de Imágenes", "Inicios de Sesión"],
        },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category" as const,
          boundaryGap: false,
          data: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
        },
        yAxis: { type: "value" as const },
        series: [
          {
            name: "Nuevos Usuarios",
            type: "line",
            stack: "Total",
            data: [120, 132, 101, 134, 90, 230],
          },
          {
            name: "Subidas de Imágenes",
            type: "line",
            stack: "Total",
            data: [220, 182, 191, 234, 290, 330],
          },
          {
            name: "Inicios de Sesión",
            type: "line",
            stack: "Total",
            data: [150, 232, 201, 154, 190, 330],
          },
        ],
      };

      myChart.setOption(option);

      const resizeChart = () => myChart.resize();
      window.addEventListener("resize", resizeChart);

      return () => {
        window.removeEventListener("resize", resizeChart);
        myChart.dispose();
      };
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Actividad General</h2>
      <div ref={chartRef} style={{ height: "400px" }}></div>
    </div>
  );
};

export default ActivityChart;
