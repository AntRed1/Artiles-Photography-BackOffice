import React, { useState, useEffect } from "react";
import { useGalleryContext } from "../context/GalleryContext";
import Modal from "../components/common/Modal";
import Alert from "../components/common/Alert";
import ImageForm from "../components/gallery/ImageForm";
import ImageList from "../components/gallery/ImageList";
import { deleteImage } from "../services/galleryService";
import type { GalleryItem } from "../types/gallery";

const GalleryPage: React.FC = () => {
  const { carouselImages, galleryImages, refreshImages, updateImages } =
    useGalleryContext();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    id: number;
    type: "carousel" | "gallery";
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadImages = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        await refreshImages();
      } catch (error) {
        console.error("Error loading images:", error);
        if (isMounted) {
          setAlert({
            type: "error",
            message: "No se pudieron cargar las imágenes",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    timeoutId = setTimeout(() => {
      loadImages();
    }, 100);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [refreshImages]);

  const handleDelete = async (id: number, type: "carousel" | "gallery") => {
    setIsSubmitting(true);
    try {
      await deleteImage(id, type);
      updateImages(type, { id } as GalleryItem, "delete");
      setAlert({
        type: "success",
        message: "Imagen eliminada con éxito",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: `No se pudo eliminar la imagen: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      });
    } finally {
      setIsSubmitting(false);
      setDeleteModal(null);
    }
  };

  const handleFormSubmit = (result: GalleryItem, action: "add" | "update") => {
    updateImages(result.type, result, action);
    setAlert({
      type: "success",
      message:
        action === "add"
          ? "Imagen creada con éxito"
          : "Imagen actualizada con éxito",
    });
  };

  const openModal = (image: GalleryItem | null = null) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  if (loading) {
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
          Gestión de Contenido
        </h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
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
          <span>Agregar Imagen</span>
        </button>
      </div>
      <ImageList
        carouselImages={carouselImages}
        galleryImages={galleryImages}
        onEdit={openModal}
        onDelete={(id, type) => setDeleteModal({ id, type })}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedImage ? "Editar Imagen" : "Nueva Imagen"}
      >
        <ImageForm
          image={selectedImage}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
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
              ¿Estás seguro de eliminar esta imagen? Esta acción es
              irreversible.
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
                onClick={() => handleDelete(deleteModal.id, deleteModal.type)}
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

export default GalleryPage;
