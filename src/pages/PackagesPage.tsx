import React, { useState, useEffect } from "react";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../services/packageService";
import type { Package } from "../types/package";
import Modal from "../components/common/Modal";
import Alert from "../components/common/Alert";
import PackageForm from "../components/packages/PackageForm";
import PackageList from "../components/packages/PackageList";
import { ApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

const PackagesPage: React.FC = () => {
  const { logout, isAuthenticated, isAdmin } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  console.log("PackagesPage rendered", { isAuthenticated, isAdmin });

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadPackages = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const data = await getPackages();
        //console.log("Packages loaded:", JSON.stringify(data, null, 2));
        setPackages(data);
      } catch (error: unknown) {
        if (isMounted) {
          const message =
            error instanceof ApiError
              ? error.message
              : "No se pudieron cargar los paquetes";
          setAlert({ type: "error", message });
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
  }, [logout]);

  const handleSubmit = async (data: {
    id?: number;
    title: string;
    description: string;
    price: number;
    file?: File;
    imageUrl: string;
    isActive: boolean;
    features: string[];
  }) => {
    setIsSubmitting(true);
    try {
      // Validar price
      const validatedPrice =
        isNaN(data.price) || data.price <= 0 ? 0 : data.price;
      const validatedData = { ...data, price: validatedPrice };

      if (data.id) {
        await updatePackage(data.id, validatedData);
        setPackages(
          packages.map((p) =>
            p.id === data.id ? { ...p, ...validatedData } : p
          )
        );
      } else if (data.file) {
        const newPackage = await createPackage(
          validatedData.title,
          validatedData.description,
          validatedData.price,
          data.file,
          validatedData.isActive,
          validatedData.features
        );
        setPackages([...packages, newPackage]);
      } else {
        throw new Error("El archivo es obligatorio para crear un paquete");
      }
      setModalOpen(false);
      setSelectedPackage(null);
      setAlert({ type: "success", message: "Paquete procesado con éxito" });
    } catch (error: unknown) {
      console.error("Error in handleSubmit:", error);
      const message =
        error instanceof ApiError
          ? error.message
          : "No se pudo procesar el paquete";
      setAlert({ type: "error", message });
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
      await deletePackage(id);
      setPackages(packages.filter((p) => p.id !== id));
      setDeleteModal(null);
      setAlert({ type: "success", message: "Paquete eliminado con éxito" });
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "No se pudo eliminar el paquete";
      setAlert({ type: "error", message });
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
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-lg p-6">
        <div className="flex animate-pulse space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-3 rounded bg-gray-200"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-3 rounded bg-gray-200"></div>
                <div className="col-span-1 h-3 rounded bg-gray-200"></div>
              </div>
              <div className="h-3 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {alert && (
        <Alert
          type={alert.type as "success" | "error"}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
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
