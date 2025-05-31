import React, { useState, useEffect } from "react";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../services/packageService";
import type { Package } from "../types/package";
import Modal from "../components/common/Modal";
import PackageForm from "../components/packages/PackageForm";
import PackageList from "../components/packages/PackageList";
import { ApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../components/common/AlertManager";
import api from "../services/api";

const PackagesPage: React.FC = () => {
  const { logout } = useAuth();
  const { showAlert } = useAlert();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadPackages = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const data = await getPackages();
        setPackages(data);
      } catch (error: unknown) {
        if (isMounted) {
          const message =
            error instanceof ApiError
              ? error.message
              : "No se pudieron cargar los paquetes";
          showAlert("error", message, 4000);
          if (
            error instanceof ApiError &&
            (error.status === 401 || error.status === 403)
          ) {
            setTimeout(() => {
              logout();
              window.location.href = "/login";
            }, 2000);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    timeoutId = setTimeout(() => {
      loadPackages();
    }, 100);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [logout, showAlert]);

  const createNotification = async (
    text: string,
    icon: string = "image",
    color: string = "indigo",
    link?: string
  ) => {
    try {
      await api("/notifications", "POST", {
        icon,
        text,
        color,
        link,
      });
    } catch (error) {
      console.error("Failed to create notification:", error);
      showAlert("error", "No se pudo crear la notificación", 4000);
    }
  };

  const handleSubmit = async (data: {
    id?: number;
    title: string;
    description: string;
    price: number;
    file?: File;
    imageUrl: string;
    isActive: boolean;
    showPrice: boolean;
    features: string[];
  }) => {
    setIsSubmitting(true);
    try {
      const validatedPrice =
        isNaN(data.price) || data.price <= 0 ? 0 : data.price;
      const validatedData = {
        ...data,
        price: validatedPrice,
        imageUrl: data.imageUrl || "",
      };

      if (data.id) {
        await updatePackage(data.id, validatedData);
        setPackages(
          packages.map((p) =>
            p.id === data.id ? { ...p, ...validatedData } : p
          )
        );
        await createNotification(
          `Paquete "${data.title}" actualizado`,
          "image",
          "indigo",
          `/packages`
        );
        showAlert("success", "Paquete actualizado con éxito", 4000);
      } else if (data.file) {
        const newPackage = await createPackage(
          validatedData.title,
          validatedData.description,
          validatedData.price,
          data.file,
          validatedData.isActive,
          validatedData.showPrice,
          validatedData.features
        );
        setPackages([...packages, newPackage]);
        await createNotification(
          `Nuevo paquete "${data.title}" creado`,
          "image",
          "green",
          `/packages`
        );
        showAlert("success", "Paquete creado con éxito", 4000);
      } else {
        throw new Error("El archivo es obligatorio para crear un paquete");
      }
      setModalOpen(false);
      setSelectedPackage(null);
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "No se pudo procesar el paquete";
      showAlert("error", message, 4000);
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        setTimeout(() => {
          logout();
          window.location.href = "/login";
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsSubmitting(true);
    try {
      const packageToDelete = packages.find((p) => p.id === id);
      await deletePackage(id);
      setPackages(packages.filter((p) => p.id !== id));
      setDeleteModal(null);
      if (packageToDelete) {
        await createNotification(
          `Paquete "${packageToDelete.title}" eliminado`,
          "exclamation-triangle",
          "amber",
          `/packages`
        );
      }
      showAlert("success", "Paquete eliminado con éxito", 4000);
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "No se pudo eliminar el paquete";
      showAlert("error", message, 4000);
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        setTimeout(() => {
          logout();
          window.location.href = "/login";
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (pkg: Package | null = null) => {
    setSelectedPackage(pkg);
    setModalOpen(true);
  };

  if (loading && !packages.length) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm animate-pulse"
            >
              <div className="aspect-[4/3] bg-gray-200 rounded-t-xl"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Paquetes Fotográficos
        </h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
          disabled={isSubmitting}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Nuevo Paquete</span>
        </button>
      </div>
      <PackageList
        packages={packages}
        onEdit={openModal}
        onDelete={(id, title) => setDeleteModal({ id, title })}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPackage(null);
        }}
        title={selectedPackage ? "Editar Paquete" : "Nuevo Paquete"}
      >
        <PackageForm
          pkg={selectedPackage}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
      {deleteModal && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          title="Confirmar Eliminación"
        >
          <div className="space-y-6">
            <p className="text-gray-600">
              ¿Estás seguro de eliminar el paquete{" "}
              <strong>{deleteModal.title}</strong>? Esta acción es irreversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                      />
                    </svg>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PackagesPage;
