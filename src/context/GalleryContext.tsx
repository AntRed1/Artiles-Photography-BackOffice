/* eslint-disable react-hooks/exhaustive-deps */

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  getCarouselImages,
  getGalleryImages,
} from "../services/galleryService";
import type { GalleryItem } from "../types/gallery";

interface GalleryContextType {
  carouselImages: GalleryItem[];
  galleryImages: GalleryItem[];
  refreshImages: () => Promise<void>;
  updateImages: (
    type: "carousel" | "gallery",
    image: GalleryItem,
    action: "add" | "update" | "delete"
  ) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [carouselImages, setCarouselImages] = useState<GalleryItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshImages = useCallback(async () => {
    if (isRefreshing) {
      //console.log("refreshImages skipped: already refreshing");
      return;
    }
    //console.log("refreshImages called");
    setIsRefreshing(true);
    try {
      const [carousel, gallery] = await Promise.all([
        getCarouselImages(),
        getGalleryImages(),
      ]);
      setCarouselImages(carousel);
      setGalleryImages(gallery);
      //console.log("refreshImages completed", { carousel, gallery });
    } catch (error) {
      console.error("Error refreshing images:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []); // Eliminada [isRefreshing] como dependencia

  const updateImages = useCallback(
    (
      type: "carousel" | "gallery",
      image: GalleryItem,
      action: "add" | "update" | "delete"
    ) => {
      if (type === "carousel") {
        setCarouselImages((prev) => {
          if (action === "add") return [...prev, image];
          if (action === "update")
            return prev.map((item) =>
              item.id === image.id ? { ...item, ...image } : item
            );
          if (action === "delete")
            return prev.filter((item) => item.id !== image.id);
          return prev;
        });
      } else {
        setGalleryImages((prev) => {
          if (action === "add") return [...prev, image];
          if (action === "update")
            return prev.map((item) =>
              item.id === image.id ? { ...item, ...image } : item
            );
          if (action === "delete")
            return prev.filter((item) => item.id !== image.id);
          return prev;
        });
      }
    },
    []
  );

  const value: GalleryContextType = {
    carouselImages,
    galleryImages,
    refreshImages,
    updateImages,
  };

  //console.log("GalleryProvider rendered");

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGalleryContext = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGalleryContext must be used within a GalleryProvider");
  }
  return context;
};
