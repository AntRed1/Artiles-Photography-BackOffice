import React from "react";
import type { GalleryItem } from "../../types/gallery";

interface ImageListProps {
  carouselImages: GalleryItem[];
  galleryImages: GalleryItem[];
  onEdit: (image: GalleryItem) => void;
  onDelete: (id: number, type: "carousel" | "gallery") => void;
}

const ImageCard: React.FC<{
  image: GalleryItem;
  onEdit: (image: GalleryItem) => void;
  onDelete: (id: number, type: "carousel" | "gallery") => void;
}> = ({ image, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <img
        src={image.url}
        alt={image.title || image.description}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        {image.title && (
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {image.title}
          </h3>
        )}
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {image.description}
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(image)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label="Editar imagen"
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
            onClick={() => onDelete(image.id, image.type)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Eliminar imagen"
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
    </div>
  );
};

const ImageList: React.FC<ImageListProps> = ({
  carouselImages,
  galleryImages,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Carrusel</h2>
        {carouselImages.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No hay imágenes en el carrusel.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {carouselImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Galería</h2>
        {galleryImages.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No hay imágenes en la galería.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageList;
