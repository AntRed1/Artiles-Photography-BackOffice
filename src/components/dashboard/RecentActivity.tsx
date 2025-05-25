import React, { useEffect, useState } from "react";
import { fetchRecentActivity } from "../../services/plausibleService";

interface RecentActivityProps {
  period: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ period }) => {
  const [activities, setActivities] = useState<string[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await fetchRecentActivity(period);
        setActivities(data);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };
    loadActivities();
  }, [period]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Actividad Reciente</h2>
        <button className="text-indigo-600 text-sm">Ver todo</button>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                <i className="fas fa-globe text-indigo-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium">{activity}</p>
                <p className="text-xs text-gray-500">Hace unos momentos</p>
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
