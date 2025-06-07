 
import React, { useState, useEffect } from "react";
import { useAlert } from "../components/common/AlertManager";
import { useRealTime } from "../context/RealTimeContext";
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  sendManualReminder,
  syncToGoogleCalendar,
} from "../services/appointmentService";
import type { Appointment } from "../types/appointment";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faSync,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const AppointmentsPage: React.FC = () => {
  const { showAlert } = useAlert();
  const { subscribeToUpdates } = useRealTime();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    title: "",
    startTime: "",
    endTime: "",
    clientName: "",
    clientEmail: "",
    location: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const start = startOfWeek(new Date()).toISOString();
      const end = endOfWeek(new Date()).toISOString();
      const data = await getAppointments(start, end);
      setAppointments(data);
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al cargar citas",
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const unsubscribe = subscribeToUpdates("day", fetchAppointments);
    return () => unsubscribe();
  }, [fetchAppointments, subscribeToUpdates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showAlert("error", "Por favor, ingrese el email del cliente", 3000);
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        const updatedAppointment = await updateAppointment(
          editingId,
          {
            ...formData,
            reminderSent: false,
          } as Omit<Appointment, "id" | "googleEventId">,
          email
        );
        setAppointments(
          appointments.map((appt) =>
            appt.id === editingId ? updatedAppointment : appt
          )
        );
        showAlert("success", "Cita actualizada exitosamente", 3000);
      } else {
        const newAppointment = await createAppointment(
          formData as Omit<
            Appointment,
            "id" | "reminderSent" | "googleEventId"
          >,
          email
        );
        setAppointments([...appointments, newAppointment]);
        showAlert("success", "Cita creada exitosamente", 3000);
      }
      setFormData({
        title: "",
        startTime: "",
        endTime: "",
        clientName: "",
        clientEmail: "",
        location: "",
        description: "",
      });
      setEditingId(null);
      setEmail("");
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al guardar cita",
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData(appointment);
    setEditingId(appointment.id);
    setEmail(appointment.clientEmail);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta cita?")) return;
    setLoading(true);
    try {
      await deleteAppointment(id);
      setAppointments(appointments.filter((appt) => appt.id !== id));
      showAlert("success", "Cita eliminada exitosamente", 3000);
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al eliminar cita",
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (id: number) => {
    setLoading(true);
    try {
      await sendManualReminder(id);
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, reminderSent: true } : appt
        )
      );
      showAlert("success", "Recordatorio enviado exitosamente", 3000);
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al enviar recordatorio",
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToGoogle = async (id: number, clientEmail: string) => {
    setLoading(true);
    try {
      const updatedAppointment = await syncToGoogleCalendar(id, clientEmail);
      setAppointments(
        appointments.map((appt) => (appt.id === id ? updatedAppointment : appt))
      );
      showAlert("success", "Cita sincronizada con Google Calendar", 3000);
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al sincronizar cita",
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faBell} className="text-teal-600 mr-3" />
          Gestión de Citas
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Título
            </label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email del Cliente
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={formData.clientName || ""}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
              className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha y Hora de Inicio
            </label>
            <input
              type="datetime-local"
              value={
                formData.startTime
                  ? format(new Date(formData.startTime), "yyyy-MM-dd'T'HH:mm")
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startTime: new Date(e.target.value).toISOString(),
                })
              }
              className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha y Hora de Fin
            </label>
            <input
              type="datetime-local"
              value={
                formData.endTime
                  ? format(new Date(formData.endTime), "yyyy-MM-dd'T'HH:mm")
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endTime: new Date(e.target.value).toISOString(),
                })
              }
              className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors"
              rows={4}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
              disabled={loading}
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
              <span>{editingId ? "Actualizar Cita" : "Crear Cita"}</span>
            </button>
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recordatorio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Google Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(
                      new Date(appointment.startTime),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(appointment.endTime), "dd/MM/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.reminderSent ? (
                      <span className="text-green-600">Enviado</span>
                    ) : (
                      <button
                        onClick={() => handleSendReminder(appointment.id)}
                        className="text-teal-600 hover:text-teal-900"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faBell} className="mr-1" />
                        Enviar
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.googleEventId ? (
                      <span className="text-green-600">Sincronizado</span>
                    ) : (
                      <button
                        onClick={() =>
                          handleSyncToGoogle(
                            appointment.id,
                            appointment.clientEmail
                          )
                        }
                        className="text-teal-600 hover:text-teal-900"
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faSync} className="mr-1" />
                        Sincronizar
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="text-teal-600 hover:text-teal-900 mr-4"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
