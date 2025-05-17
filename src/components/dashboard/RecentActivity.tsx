import React from "react";

const RecentActivity: React.FC = () => {
  const activities = [
    {
      icon: "fa-user-edit",
      text: "Carlos actualizó un paquete fotográfico",
      time: "Hace 35 minutos",
      color: "indigo",
    },
    {
      icon: "fa-image",
      text: "María subió 12 nuevas fotos",
      time: "Hace 2 horas",
      color: "green",
    },
    {
      icon: "fa-user-plus",
      text: "Nuevo usuario registrado: Ana Martínez",
      time: "Hace 5 horas",
      color: "amber",
    },
    {
      icon: "fa-exclamation-circle",
      text: "Alerta: 3 intentos fallidos de inicio de sesión",
      time: "Hace 1 día",
      color: "red",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Actividad Reciente</h2>
        <button className="text-indigo-600 text-sm">Ver todo</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start">
            <div className={`bg-${activity.color}-100 p-2 rounded-full mr-3`}>
              <i
                className={`fas ${activity.icon} text-${activity.color}-600`}
              ></i>
            </div>
            <div>
              <p className="text-sm font-medium">{activity.text}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
