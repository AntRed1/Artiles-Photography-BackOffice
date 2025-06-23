import React from "react";
import type { CloudinaryResource } from "../../services/cloudinaryService";

interface RecentActivityProps {
  images: CloudinaryResource[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ images }) => {
  const maxActivities = 5; // Limitar a 5 actividades recientes

  const activities = images.slice(0, maxActivities).map((image) => ({
    description: `Imagen "${image.public_id}" subida`,
    timestamp: new Date(image.created_at).toLocaleString(),
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Actividad Reciente</h2>
        <button
          className="text-indigo-600 text-sm hover:underline"
          aria-label="Ver todas las actividades"
        >
          Ver todo
        </button>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                <i
                  className="fas fa-image text-indigo-600"
                  aria-hidden="true"
                ></i>
              </div>
              <div>
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No hay actividad reciente.</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
