import React, { useState, useEffect } from "react";
import type { Config } from "../types/config";
import {
  getConfig,
  updateConfig,
  getContactInfo,
  updateContactInfo,
} from "../services/configService";

const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [contactInfo, setContactInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [configData, contactData] = await Promise.all([
          getConfig(),
          getContactInfo(),
        ]);
        setConfig(configData);
        setContactInfo(contactData);
      } catch (err) {
        setError("Error al cargar configuración");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setLoading(true);
    try {
      const updated = await updateConfig(config.id, config);
      setConfig(updated);
    } catch (err) {
      setError("Error al guardar configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo) return;
    setLoading(true);
    try {
      const updated = await updateContactInfo(contactInfo.id, contactInfo);
      setContactInfo(updated);
    } catch (err) {
      setError("Error al guardar información de contacto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuración General</h1>
      {loading && (
        <div className="text-center">
          <i className="fas fa-spinner animate-spin text-2xl"></i>
        </div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Site Configuration */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Configuración del Sitio</h2>
        </div>
        <div className="p-6">
          {config && (
            <form onSubmit={handleConfigSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del Sitio
                  </label>
                  <input
                    type="text"
                    value={config.siteTitle}
                    onChange={(e) =>
                      setConfig({ ...config, siteTitle: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) =>
                      setConfig({ ...config, description: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                    rows={4}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Palabras Clave
                  </label>
                  <input
                    type="text"
                    value={config.keywords}
                    onChange={(e) =>
                      setConfig({ ...config, keywords: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Principal
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })
                      }
                      className="h-10 w-20"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) =>
                        setConfig({ ...config, primaryColor: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuente Principal
                  </label>
                  <select
                    value={config.font}
                    onChange={(e) =>
                      setConfig({ ...config, font: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  >
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                    <option>Montserrat</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    {loading && <i className="fas fa-spinner animate-spin"></i>}
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Información de Contacto</h2>
        </div>
        <div className="p-6">
          {contactInfo && (
            <form onSubmit={handleContactSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <div className="flex">
                    <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                      +1
                    </div>
                    <input
                      type="text"
                      value={contactInfo.whatsapp}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          whatsapp: e.target.value,
                        })
                      }
                      className="rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <div className="flex">
                    <div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
                      +1
                    </div>
                    <input
                      type="text"
                      value={contactInfo.phone}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          phone: e.target.value,
                        })
                      }
                      className="rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, email: e.target.value })
                    }
                    className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={contactInfo.address}
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        address: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitud
                    </label>
                    <input
                      type="text"
                      value={contactInfo.latitude}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          latitude: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitud
                    </label>
                    <input
                      type="text"
                      value={contactInfo.longitude}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          longitude: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    {loading && <i className="fas fa-spinner animate-spin"></i>}
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
