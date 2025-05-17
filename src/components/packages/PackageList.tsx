import React from "react";
import type { Package } from "../../types/package";

interface PackageListProps {
  packages: Package[];
  onEdit: (pkg: Package) => void;
  onDelete: (id: number, title: string) => void;
}

const PackageCard: React.FC<{
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (id: number, title: string) => void;
}> = ({ pkg, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={pkg.imageUrl || "/placeholder-image.jpg"}
          alt={pkg.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(pkg)}
            className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Editar paquete"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657 1.414 1.414-5.657L15.586 3.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(pkg.id, pkg.title)}
            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
            aria-label="Eliminar paquete"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 4v12m4-12v12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {pkg.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
        {pkg.showPrice ? (
          <p className="text-lg font-bold text-indigo-600 mt-2">
            ${pkg.price.toFixed(2)}
          </p>
        ) : (
          <p className="text-sm text-gray-600 mt-2">Precio no disponible</p>
        )}
        <p
          className={`text-sm mt-1 ${
            pkg.isActive ? "text-green-600" : "text-red-600"
          }`}
        >
          {pkg.isActive ? "Activo" : "Inactivo"}
        </p>
        {pkg.features.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {pkg.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="w-4 h-4 mr-1 mt-0.5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const PackageList: React.FC<PackageListProps> = ({
  packages,
  onEdit,
  onDelete,
}) => {
  return (
    <div>
      {packages.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay paquetes disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageList;
