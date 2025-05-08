import React, { useState, useEffect } from "react";
import type { Package } from "../types/package";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../services/packageService";

const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    id?: number;
    title: string;
    description: string;
    price: number;
    file?: File;
  }>({ title: "", description: "", price: 0 });

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await getPackages();
        setPackages(data);
      } catch (err) {
        setError("Error al cargar paquetes");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await updatePackage(formData.id, {
          title: formData.title,
          description: formData.description,
          price: formData.price,
        });
      } else if (formData.file) {
        await createPackage(
          formData.title,
          formData.description,
          formData.price,
          formData.file
        );
      }
      const data = await getPackages();
      setPackages(data);
      setModalOpen(false);
      setFormData({ title: "", description: "", price: 0 });
    } catch (err) {
      setError("Error al guardar paquete");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deletePackage(id);
      const data = await getPackages();
      setPackages(data);
    } catch (err) {
      setError("Error al eliminar paquete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Paquetes Fotográficos</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Nuevo Paquete
        </button>
      </div>

      {loading && (
        <div className="text-center">
          <i className="fas fa-spinner animate-spin text-2xl"></i>
        </div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-lg shadow">
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
              <img
                src={pkg.imageUrl}
                alt={pkg.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setFormData({
                      id: pkg.id,
                      title: pkg.title,
                      description: pkg.description,
                      price: pkg.price,
                    })
                  }
                  className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{pkg.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-indigo-600 font-semibold">
                  ${pkg.price.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <button className="text-gray-600 hover:text-gray-800">
                    <i className="fas fa-arrow-up"></i>
                  </button>
                  <button className="text-gray-600 hover:text-gray-800">
                    <i className="fas fa-arrow-down"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {formData.id ? "Editar Paquete" : "Nuevo Paquete"}
            </h2>
            <form onSubmit={handleSubmit}>
              {!formData.id && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files?.[0] })
                    }
                    className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  rows={4}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  {loading && <i className="fas fa-spinner animate-spin"></i>}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesPage;
