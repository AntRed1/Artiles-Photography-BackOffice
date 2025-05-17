/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faSearch,
  faLocationCrosshairs,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faFacebookF,
  faTwitter,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import type { Config, ContactInfo, LegalResponse } from "../types/config";
import {
  getConfig,
  updateConfig,
  updateConfigWithLogo,
  getContactInfo,
  updateContactInfo,
  createContactInfo,
  deleteContactInfo,
  getLegalByType,
  updateLegal,
} from "../services/configService";
import { useAlert } from "../components/common/AlertManager";
import api from "../services/api";

const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [privacyPolicy, setPrivacyPolicy] = useState<LegalResponse | null>(
    null
  );
  const [termsAndConditions, setTermsAndConditions] =
    useState<LegalResponse | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [configData, contactData, privacyData, termsData] =
          await Promise.all([
            getConfig(),
            getContactInfo(),
            getLegalByType("PRIVACY").catch((err) => {
              console.warn("No se encontró PRIVACY:", err.message);
              return null;
            }),
            getLegalByType("TERMS").catch((err) => {
              console.warn("No se encontró TERMS:", err.message);
              return null;
            }),
          ]);
        setConfig(configData);
        setContactInfo(contactData);
        setPrivacyPolicy(privacyData);
        setTermsAndConditions(termsData);
      } catch (err: any) {
        setError(
          `Error al cargar configuración: ${err.message || "Error desconocido"}`
        );
        showAlert(
          "error",
          `Error al cargar configuración: ${err.message || "Error desconocido"}`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showAlert]);

  const handleConfigSubmit = async (e: React.FormEvent, section: string) => {
    e.preventDefault();
    if (!config) return;
    setLoading(true);
    try {
      let updated: Config;
      if (logoFile) {
        console.log(
          "Enviando PUT /api/admin/config/",
          config.id,
          "con archivo"
        );
        updated = await updateConfigWithLogo(config.id, logoFile, config);
      } else {
        console.log(
          "Enviando PUT /api/admin/config/",
          config.id,
          "sin archivo"
        );
        updated = await updateConfig(config.id, config);
      }
      setConfig(updated);
      setLogoFile(null); // Reset logo file after successful upload
      showAlert(
        "success",
        `Cambios en ${section} guardados exitosamente`,
        3000
      );
    } catch (err: any) {
      console.error("Error en handleConfigSubmit:", err);
      let errorMessage = err.message || "Error desconocido";
      if (err.message.includes("Cloudinary")) {
        errorMessage = "Error al subir el logo a Cloudinary. Intenta de nuevo.";
      } else if (err.status === 403) {
        errorMessage =
          "Acceso denegado. Verifica que tienes permisos de administrador.";
      } else if (err.status === 500) {
        errorMessage =
          "Error del servidor al actualizar la configuración. Contacta al soporte.";
      }
      setError(`Error al guardar ${section.toLowerCase()}: ${errorMessage}`);
      showAlert(
        "error",
        `Error al guardar ${section.toLowerCase()}: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent, section: string) => {
    e.preventDefault();
    if (!contactInfo) return;
    setLoading(true);
    try {
      console.log(
        "Enviando PUT /api/contact-info/admin/",
        contactInfo.id,
        contactInfo
      );
      const updated = await updateContactInfo(contactInfo.id, contactInfo);
      setContactInfo(updated);
      showAlert(
        "success",
        `Cambios en ${section} guardados exitosamente`,
        3000
      );
    } catch (err: any) {
      console.error("Error en handleContactSubmit:", err);
      setError(
        `Error al guardar ${section.toLowerCase()}: ${
          err.message || "Error desconocido"
        }`
      );
      showAlert(
        "error",
        `Error al guardar ${section.toLowerCase()}: ${
          err.message || "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLegalSubmit = async (
    e: React.FormEvent,
    section: string,
    legal: LegalResponse | null
  ) => {
    e.preventDefault();
    if (!legal) return;
    setLoading(true);
    try {
      console.log(`Enviando PUT /api/legal/admin/${legal.id}`, legal);
      const updated = await updateLegal(legal.id, {
        type: legal.type,
        content: legal.content,
      });
      if (legal.type === "PRIVACY") {
        setPrivacyPolicy(updated);
      } else if (legal.type === "TERMS") {
        setTermsAndConditions(updated);
      }
      showAlert(
        "success",
        `Cambios en ${section} guardados exitosamente`,
        3000
      );
    } catch (err: any) {
      console.error(`Error en handleLegalSubmit para ${section}:`, err);
      let errorMessage = err.message || "Error desconocido";
      if (err.status === 403) {
        errorMessage =
          "Acceso denegado. Verifica que tienes permisos de administrador.";
      } else if (err.status === 500) {
        errorMessage =
          "Error del servidor al actualizar el documento. Contacta al soporte.";
      }
      setError(`Error al guardar ${section.toLowerCase()}: ${errorMessage}`);
      showAlert(
        "error",
        `Error al guardar ${section.toLowerCase()}: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLegal = async (type: string, section: string) => {
    setLoading(true);
    try {
      const response = await api<LegalResponse>("/legal/admin", "POST", {
        type,
        content: `Contenido inicial para ${type}`,
      });
      if (type === "PRIVACY") {
        setPrivacyPolicy(response);
      } else if (type === "TERMS") {
        setTermsAndConditions(response);
      }
      showAlert("success", `Documento ${section} creado exitosamente`, 3000);
    } catch (err: any) {
      console.error(`Error al crear ${section}:`, err);
      setError(
        `Error al crear ${section.toLowerCase()}: ${
          err.message || "Error desconocido"
        }`
      );
      showAlert(
        "error",
        `Error al crear ${section.toLowerCase()}: ${
          err.message || "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContactInfo = async () => {
    if (!contactInfo) return;
    setLoading(true);
    try {
      console.log("Enviando POST /api/contact-info/admin", contactInfo);
      const newContactInfo = await createContactInfo(contactInfo);
      setContactInfo(newContactInfo);
      showAlert("success", "Información de contacto creada exitosamente", 3000);
    } catch (err: any) {
      console.error("Error en handleCreateContactInfo:", err);
      setError(
        `Error al crear información de contacto: ${
          err.message || "Error desconocido"
        }`
      );
      showAlert(
        "error",
        `Error al crear información de contacto: ${
          err.message || "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContactInfo = async () => {
    if (!contactInfo) return;
    setLoading(true);
    try {
      console.log("Enviando DELETE /api/contact-info/admin/", contactInfo.id);
      await deleteContactInfo(contactInfo.id);
      setContactInfo(null);
      showAlert(
        "success",
        "Información de contacto eliminada exitosamente",
        3000
      );
    } catch (err: any) {
      console.error("Error en handleDeleteContactInfo:", err);
      setError(
        `Error al eliminar información de contacto: ${
          err.message || "Error desconocido"
        }`
      );
      showAlert(
        "error",
        `Error al eliminar información de contacto: ${
          err.message || "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError("El archivo excede el tamaño máximo de 2MB");
        showAlert("error", "El archivo excede el tamaño máximo de 2MB");
        return;
      }
      if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
        setError("Solo se permiten archivos PNG, JPG o SVG");
        showAlert("error", "Solo se permiten archivos PNG, JPG o SVG");
        return;
      }
      setLogoFile(file);
      setConfig({
        ...config!,
        logoUrl: URL.createObjectURL(file),
      });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Configuración General
      </h1>
      {loading &&
        !config &&
        !contactInfo &&
        !privacyPolicy &&
        !termsAndConditions && (
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-orange-500 mx-auto"
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
          </div>
        )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 flex items-center space-x-3 shadow-sm">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Gestión del Logo */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-orange-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon
                  icon={faUpload}
                  className="text-orange-500 mr-3 text-lg"
                />
                Gestión del Logo
              </h2>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => handleConfigSubmit(e, "Gestión del Logo")}
                className="space-y-6"
              >
                <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50">
                  <div className="text-center">
                    <img
                      src={
                        config?.logoUrl ||
                        "https://readdy.ai/api/search-image?query=minimalist%20photography%20studio%20logo%20design%20with%20elegant%20typography%20and%20camera%20icon%2C%20professional%20branding%2C%20clean%20modern%20style%20on%20white%20background&width=200&height=80&seq=4&orientation=landscape"
                      }
                      alt={config?.logoAltText || "Logo actual"}
                      className="mx-auto mb-4 h-24 object-contain"
                    />
                    <div className="space-y-3">
                      <label className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg cursor-pointer inline-flex items-center space-x-2 transition-transform hover:scale-105">
                        <FontAwesomeIcon icon={faUpload} className="text-lg" />
                        <span>Cambiar Logo</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml"
                          onChange={handleLogoChange}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                      <p className="text-sm text-gray-500">
                        PNG, JPG o SVG (Max. 2MB)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Texto Alternativo
                    </label>
                    <input
                      type="text"
                      value={config?.logoAltText || ""}
                      onChange={(e) =>
                        setConfig({ ...config!, logoAltText: e.target.value })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                      placeholder="Artiles Photography Studio Logo"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Dimensiones Recomendadas
                    </label>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>• Header: 200x80px</p>
                      <p>• Favicon: 32x32px</p>
                      <p>• Redes sociales: 500x500px</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    {loading && (
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
                    )}
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-teal-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon
                  icon={faLocationCrosshairs}
                  className="text-teal-600 mr-3 text-lg"
                />
                Información de Contacto
              </h2>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) =>
                  handleContactSubmit(e, "Información de Contacto")
                }
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      WhatsApp
                    </label>
                    <div className="flex">
                      <div className="flex-shrink-0 inline-flex items-center py-3 px-4 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-l-lg">
                        +1
                      </div>
                      <input
                        type="text"
                        value={contactInfo?.whatsapp || ""}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo!,
                            whatsapp: e.target.value,
                          })
                        }
                        className="rounded-none rounded-r-lg border border-gray-200 text-gray-900 flex-1 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
                        placeholder="809-555-5678"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Teléfono
                    </label>
                    <div className="flex">
                      <div className="flex-shrink-0 inline-flex items-center py-3 px-4 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-l-lg">
                        +1
                      </div>
                      <input
                        type="text"
                        value={contactInfo?.phone || ""}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo!,
                            phone: e.target.value,
                          })
                        }
                        className="rounded-none rounded-r-lg border border-gray-200 text-gray-900 flex-1 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
                        placeholder="809-555-5678"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={contactInfo?.email || ""}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo!, email: e.target.value })
                    }
                    className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
                    placeholder="contacto@artilesphotography.com"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Dirección
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={contactInfo?.address || ""}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo!,
                            address: e.target.value,
                          })
                        }
                        className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
                        placeholder="Buscar ubicación..."
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSearch} className="text-lg" />
                        <span>Buscar</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      URL de Google Maps
                    </label>
                    <input
                      type="text"
                      value={contactInfo?.googleMapsUrl || ""}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo!,
                          googleMapsUrl: e.target.value,
                        })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      disabled={loading}
                    />
                  </div>
                  <div className="relative w-full h-[350px] bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                    <iframe
                      src={
                        contactInfo?.googleMapsUrl ||
                        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.225307807289!2d-69.93663492414066!3d18.47150796791757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea561f4a5b48f3d%3A0x9c5b0c6c3e9397a4!2sAv.%20Winston%20Churchill%2C%20Santo%20Domingo!5e0!3m2!1sen!2sdo!4v1683244669374!5m2!1sen!2sdo"
                      }
                      className="absolute inset-0 w-full h-full border-none"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                    <div className="absolute bottom-4 right-4 z-10">
                      <button
                        type="button"
                        className="bg-white text-teal-600 px-4 py-2.5 rounded-lg shadow-md flex items-center space-x-2 hover:bg-teal-50 transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        <FontAwesomeIcon
                          icon={faLocationCrosshairs}
                          className="text-lg"
                        />
                        <span>Usar mi ubicación</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Detalles adicionales
                    </label>
                    <input
                      type="text"
                      value={contactInfo?.addressDetails || ""}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo!,
                          addressDetails: e.target.value,
                        })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
                      placeholder="Ej: Local 102, Edificio Plaza Paraíso"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="pt-6 flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    {loading && (
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
                    )}
                    <span>Guardar Cambios</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateContactInfo}
                    disabled={loading || !!contactInfo}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    <span>Crear Nuevo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteContactInfo}
                    disabled={loading || !contactInfo}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    <span>Eliminar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          {/* Redes Sociales */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-indigo-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="text-indigo-600 mr-3 text-lg"
                />
                Redes Sociales
              </h2>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => handleContactSubmit(e, "Redes Sociales")}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Instagram
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <FontAwesomeIcon
                        icon={faInstagram}
                        className="text-indigo-500 text-lg"
                      />
                    </div>
                    <input
                      type="text"
                      value={contactInfo?.instagram || ""}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo!,
                          instagram: e.target.value,
                        })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                      placeholder="@artilesphotography"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Facebook
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <FontAwesomeIcon
                        icon={faFacebookF}
                        className="text-indigo-500 text-lg"
                      />
                    </div>
                    <input
                      type="text"
                      value={contactInfo?.facebook || ""}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo!,
                          facebook: e.target.value,
                        })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                      placeholder="ArtilesPhotographyStudio"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Twitter
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <FontAwesomeIcon
                        icon={faTwitter}
                        className="text-indigo-500 text-lg"
                      />
                    </div>
                    <input
                      type="text"
                      value={contactInfo?.twitter || ""}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo!,
                          twitter: e.target.value,
                        })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                      placeholder="@ArtilesPhoto"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    TikTok
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <FontAwesomeIcon
                        icon={faTiktok}
                        className="text-indigo-500 text-lg"
                      />
                    </div>
                    <input
                      type="text"
                      value={contactInfo?.tiktok || ""}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo!,
                          tiktok: e.target.value,
                        })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                      placeholder="@artilesphotography"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    {loading && (
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
                    )}
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Horario de Atención */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-cream-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-orange-500 mr-3 text-lg"
                />
                Horario de Atención
              </h2>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => handleConfigSubmit(e, "Horario de Atención")}
                className="space-y-6"
              >
                <div className="bg-cream-100 rounded-lg p-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-orange-500 text-xl"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-800">
                        Horario Flexible
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Nuestros servicios están disponibles bajo demanda. Nos
                        adaptamos a sus necesidades y horarios preferidos.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mensaje de Disponibilidad
                    </label>
                    <textarea
                      value={config?.availabilityMessage || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config!,
                          availabilityMessage: e.target.value,
                        })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                      rows={4}
                      placeholder="Estamos disponibles para sesiones fotográficas según su conveniencia..."
                      disabled={loading}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tiempo de Respuesta Estimado
                    </label>
                    <select
                      value={config?.responseTime || ""}
                      onChange={(e) =>
                        setConfig({ ...config!, responseTime: e.target.value })
                      }
                      className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                      disabled={loading}
                    >
                      <option value="1">Menos de 1 hora</option>
                      <option value="2">1-2 horas</option>
                      <option value="4">2-4 horas</option>
                      <option value="24">Dentro de 24 horas</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={config?.notificationsEnabled || false}
                      onChange={(e) =>
                        setConfig({
                          ...config!,
                          notificationsEnabled: e.target.checked,
                        })
                      }
                      className="rounded border-gray-200 text-orange-500 focus:ring-orange-400"
                      disabled={loading}
                    />
                    <label
                      htmlFor="notifications"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Recibir notificaciones de solicitudes de cita 24/7
                    </label>
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    {loading && (
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
                    )}
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Política de Privacidad */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">
                Política de Privacidad
              </h2>
            </div>
            <div className="p-6">
              {privacyPolicy ? (
                <form
                  onSubmit={(e) =>
                    handleLegalSubmit(
                      e,
                      "Política de Privacidad",
                      privacyPolicy
                    )
                  }
                >
                  <textarea
                    value={privacyPolicy.content || ""}
                    onChange={(e) =>
                      setPrivacyPolicy({
                        ...privacyPolicy,
                        content: e.target.value,
                      })
                    }
                    className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                    rows={8}
                    placeholder="En Artiles Photography Studio, respetamos su privacidad..."
                    disabled={loading}
                  ></textarea>
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                    >
                      {loading && (
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
                      )}
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    No se encontró una política de privacidad.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handleCreateLegal("PRIVACY", "Política de Privacidad")
                    }
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 mx-auto transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    <span>Crear Política de Privacidad</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">
                Términos y Condiciones
              </h2>
            </div>
            <div className="p-6">
              {termsAndConditions ? (
                <form
                  onSubmit={(e) =>
                    handleLegalSubmit(
                      e,
                      "Términos y Condiciones",
                      termsAndConditions
                    )
                  }
                >
                  <textarea
                    value={termsAndConditions.content || ""}
                    onChange={(e) =>
                      setTermsAndConditions({
                        ...termsAndConditions,
                        content: e.target.value,
                      })
                    }
                    className="border border-gray-200 rounded-lg text-gray-900 w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
                    rows={8}
                    placeholder="Al utilizar los servicios de Artiles Photography Studio, usted acepta estos términos..."
                    disabled={loading}
                  ></textarea>
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
                    >
                      {loading && (
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
                      )}
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    No se encontraron términos y condiciones.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handleCreateLegal("TERMS", "Términos y Condiciones")
                    }
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 mx-auto transition-transform hover:scale-105 disabled:opacity-50"
                  >
                    <span>Crear Términos y Condiciones</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
