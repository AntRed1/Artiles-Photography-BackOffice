import React from "react";
import ActivityChart from "../components/dashboard/ActivityChart";
import RecentActivity from "../components/dashboard/RecentActivity";

const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Usuarios Totales</p>
              <h2 className="text-3xl font-bold">248</h2>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <i className="fas fa-users text-indigo-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-500 text-sm">
              <i className="fas fa-arrow-up"></i> 12% desde el mes pasado
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Contenido Publicado</p>
              <h2 className="text-3xl font-bold">156</h2>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <i className="fas fa-images text-green-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-500 text-sm">
              <i className="fas fa-arrow-up"></i> 8% desde el mes pasado
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Visitas al Sitio</p>
              <h2 className="text-3xl font-bold">1,893</h2>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <i className="fas fa-chart-line text-amber-600 text-xl"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-500 text-sm">
              <i className="fas fa-arrow-up"></i> 24% desde el mes pasado
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Actividad del Sistema</h2>
          <ActivityChart />
        </div>
        <RecentActivity />
      </div>
    </div>
  );
};

export default DashboardPage;
