// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import Swal from 'sweetalert2';
const App: React.FC = () => {
const [activeMenu, setActiveMenu] = useState('dashboard');
const [menuCollapsed, setMenuCollapsed] = useState(false);
const [userDropdownOpen, setUserDropdownOpen] = useState(false);
const [notificationsOpen, setNotificationsOpen] = useState(false);
// Estado para el gráfico de actividad
useEffect(() => {
const chartDom = document.getElementById('activity-chart');
if (chartDom) {
const myChart = echarts.init(chartDom);
const option = {
animation: false,
tooltip: {
trigger: 'axis'
},
legend: {
data: ['Usuarios', 'Contenido', 'Visitas']
},
grid: {
left: '3%',
right: '4%',
bottom: '3%',
containLabel: true
},
xAxis: {
type: 'category',
boundaryGap: false,
data: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
},
yAxis: {
type: 'value'
},
series: [
{
name: 'Usuarios',
type: 'line',
data: [120, 132, 101, 134, 90, 30, 20],
color: '#4F46E5'
},
{
name: 'Contenido',
type: 'line',
data: [220, 182, 191, 234, 290, 330, 310],
color: '#10B981'
},
{
name: 'Visitas',
type: 'line',
data: [150, 232, 201, 154, 190, 330, 410],
color: '#F59E0B'
}
]
};
myChart.setOption(option);
const handleResize = () => {
myChart.resize();
};
window.addEventListener('resize', handleResize);
return () => {
window.removeEventListener('resize', handleResize);
myChart.dispose();
};
}
}, [activeMenu]);
// Datos de ejemplo para usuarios
const users = [
{ id: 1, nombre: 'Carlos Rodríguez', email: 'carlos@example.com', rol: 'Administrador', estado: 'Activo', ultimoAcceso: '04/05/2025 09:45' },
{ id: 2, nombre: 'María González', email: 'maria@example.com', rol: 'Editor', estado: 'Activo', ultimoAcceso: '03/05/2025 14:30' },
{ id: 3, nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'Visualizador', estado: 'Inactivo', ultimoAcceso: '28/04/2025 11:20' },
{ id: 4, nombre: 'Ana Martínez', email: 'ana@example.com', rol: 'Editor', estado: 'Activo', ultimoAcceso: '02/05/2025 16:15' },
];
// Función para renderizar el contenido según el menú activo
const renderContent = () => {
switch (activeMenu) {
case 'dashboard':
return (
<div className="p-6">
<h1 className="text-2xl font-bold mb-6">Panel de Control</h1>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<div className="bg-white rounded-lg shadow p-6">
<div className="flex items-center justify-between">
<div>
<p className="text-gray-500 text-sm">Usuarios Totales</p>
<h2 className="text-3xl font-bold">248</h2>
</div>
<div className="bg-indigo-100 p-3 rounded-full">
<i className="fas fa-users text-indigo-600 text-xl"></i>
</div>
</div>
<div className="mt-4">
<span className="text-green-500 text-sm"><i className="fas fa-arrow-up"></i> 12% desde el mes pasado</span>
</div>
</div>
<div className="bg-white rounded-lg shadow p-6">
<div className="flex items-center justify-between">
<div>
<p className="text-gray-500 text-sm">Contenido Publicado</p>
<h2 className="text-3xl font-bold">156</h2>
</div>
<div className="bg-green-100 p-3 rounded-full">
<i className="fas fa-images text-green-600 text-xl"></i>
</div>
</div>
<div className="mt-4">
<span className="text-green-500 text-sm"><i className="fas fa-arrow-up"></i> 8% desde el mes pasado</span>
</div>
</div>
<div className="bg-white rounded-lg shadow p-6">
<div className="flex items-center justify-between">
<div>
<p className="text-gray-500 text-sm">Visitas al Sitio</p>
<h2 className="text-3xl font-bold">1,893</h2>
</div>
<div className="bg-amber-100 p-3 rounded-full">
<i className="fas fa-chart-line text-amber-600 text-xl"></i>
</div>
</div>
<div className="mt-4">
<span className="text-green-500 text-sm"><i className="fas fa-arrow-up"></i> 24% desde el mes pasado</span>
</div>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
<h2 className="text-lg font-semibold mb-4">Actividad del Sistema</h2>
<div id="activity-chart" className="w-full h-80"></div>
</div>
<div className="bg-white rounded-lg shadow p-6">
<div className="flex items-center justify-between mb-4">
<h2 className="text-lg font-semibold">Actividad Reciente</h2>
<button className="text-indigo-600 text-sm cursor-pointer !rounded-button whitespace-nowrap">Ver todo</button>
</div>
<div className="space-y-4">
<div className="flex items-start">
<div className="bg-indigo-100 p-2 rounded-full mr-3">
<i className="fas fa-user-edit text-indigo-600"></i>
</div>
<div>
<p className="text-sm font-medium">Carlos actualizó un paquete fotográfico</p>
<p className="text-xs text-gray-500">Hace 35 minutos</p>
</div>
</div>
<div className="flex items-start">
<div className="bg-green-100 p-2 rounded-full mr-3">
<i className="fas fa-image text-green-600"></i>
</div>
<div>
<p className="text-sm font-medium">María subió 12 nuevas fotos</p>
<p className="text-xs text-gray-500">Hace 2 horas</p>
</div>
</div>
<div className="flex items-start">
<div className="bg-amber-100 p-2 rounded-full mr-3">
<i className="fas fa-user-plus text-amber-600"></i>
</div>
<div>
<p className="text-sm font-medium">Nuevo usuario registrado: Ana Martínez</p>
<p className="text-xs text-gray-500">Hace 5 horas</p>
</div>
</div>
<div className="flex items-start">
<div className="bg-red-100 p-2 rounded-full mr-3">
<i className="fas fa-exclamation-circle text-red-600"></i>
</div>
<div>
<p className="text-sm font-medium">Alerta: 3 intentos fallidos de inicio de sesión</p>
<p className="text-xs text-gray-500">Hace 1 día</p>
</div>
</div>
</div>
</div>
</div>
</div>
);
case 'users':
return (
<div className="p-6">
<div className="flex justify-between items-center mb-6">
<h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
<button 
  onClick={() => {
    // Show success message
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon: 'success',
      title: 'Cambios guardados exitosamente'
    });
  }}
  className="bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-2 rounded-lg flex items-center cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-plus mr-2"></i> Nuevo Usuario
</button>
</div>
<div className="bg-white rounded-lg shadow mb-6">
<div className="p-4 border-b">
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
<div className="relative flex-1">
<input
type="text"
placeholder="Buscar usuarios..."
className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
/>
<i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
</div>
<div className="flex gap-3">
<div className="relative">
<button className="border border-gray-300 rounded-lg px-4 py-2 flex items-center text-sm cursor-pointer !rounded-button whitespace-nowrap">
<span>Rol</span>
<i className="fas fa-chevron-down ml-2 text-xs"></i>
</button>
</div>
<div className="relative">
<button className="border border-gray-300 rounded-lg px-4 py-2 flex items-center text-sm cursor-pointer !rounded-button whitespace-nowrap">
<span>Estado</span>
<i className="fas fa-chevron-down ml-2 text-xs"></i>
</button>
</div>
<button className="border border-gray-300 rounded-lg p-2 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-filter"></i>
</button>
</div>
</div>
</div>
<div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200">
<thead className="bg-gray-50">
<tr>
<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
Nombre
</th>
<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
Email
</th>
<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
Rol
</th>
<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
Estado
</th>
<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
Último Acceso
</th>
<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
Acciones
</th>
</tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
{users.map(user => (
<tr key={user.id}>
<td className="px-6 py-4 whitespace-nowrap">
<div className="flex items-center">
<div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
<span className="text-indigo-600 font-medium">{user.nombre.charAt(0)}</span>
</div>
<div className="ml-4">
<div className="text-sm font-medium text-gray-900">{user.nombre}</div>
</div>
</div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">{user.email}</div>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
${user.rol === 'Administrador' ? 'bg-purple-100 text-purple-800' :
user.rol === 'Editor' ? 'bg-blue-100 text-blue-800' :
'bg-gray-100 text-gray-800'}`}>
{user.rol}
</span>
</td>
<td className="px-6 py-4 whitespace-nowrap">
<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
${user.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
{user.estado}
</span>
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
{user.ultimoAcceso}
</td>
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
<div className="flex justify-end space-x-2">
<button className="text-indigo-600 hover:text-indigo-900 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-edit"></i>
</button>
<button className="text-red-600 hover:text-red-900 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-trash"></i>
</button>
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
<div className="px-6 py-4 flex items-center justify-between border-t">
<div className="text-sm text-gray-700">
Mostrando <span className="font-medium">1</span> a <span className="font-medium">4</span> de <span className="font-medium">4</span> resultados
</div>
<div className="flex space-x-2">
<button className="border border-gray-300 rounded-lg px-3 py-1 text-sm disabled:opacity-50 cursor-pointer !rounded-button whitespace-nowrap" disabled>
Anterior
</button>
<button className="border border-gray-300 rounded-lg px-3 py-1 text-sm disabled:opacity-50 cursor-pointer !rounded-button whitespace-nowrap" disabled>
Siguiente
</button>
</div>
</div>
</div>
</div>
);
case 'content':
return (
<div className="p-6">
<h1 className="text-2xl font-bold mb-6">Gestión de Contenido</h1>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<div
className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
onClick={() => {
const galleryContent = (
<div className="p-6">
<div className="mb-8">
<h2 className="text-xl font-bold mb-6">Gestión del Carrusel Principal</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{[1, 2, 3].map((index) => (
<div key={index} className="bg-white rounded-lg shadow">
<div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
<img
src={`https://readdy.ai/api/search-image?query=professional%20photography%20studio%20scene%20with%20elegant%20lighting%20setup%20and%20modern%20equipment%2C%20artistic%20composition%20with%20natural%20light%20streaming%20through%20windows&width=400&height=225&seq=${index}&orientation=landscape`}
alt={`Slide ${index}`}
className="w-full h-full object-cover"
/>
<div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
<button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 !rounded-button whitespace-nowrap">
<i className="fas fa-edit"></i>
</button>
<button className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100 !rounded-button whitespace-nowrap">
<i className="fas fa-trash"></i>
</button>
</div>
</div>
<div className="p-4">
<div className="flex items-center justify-between">
<span className="text-sm text-gray-500">Slide {index}</span>
<div className="flex gap-2">
{index > 1 && (
<button className="text-gray-600 hover:text-gray-800 !rounded-button whitespace-nowrap">
<i className="fas fa-arrow-left"></i>
</button>
)}
{index < 3 && (
<button className="text-gray-600 hover:text-gray-800 !rounded-button whitespace-nowrap">
<i className="fas fa-arrow-right"></i>
</button>
)}
</div>
</div>
</div>
</div>
))}
</div>
<div className="mt-6 flex justify-center">
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 !rounded-button whitespace-nowrap">
<i className="fas fa-plus"></i>
Agregar Nueva Imagen
</button>
</div>
</div>
<div>
<h2 className="text-xl font-bold mb-6">Nuestra Galería</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{[1, 2, 3, 4, 5, 6].map((index) => (
<div key={index} className="bg-white rounded-lg shadow">
<div className="relative aspect-square overflow-hidden rounded-t-lg">
<img
src={`https://readdy.ai/api/search-image?query=artistic%20photography%20portfolio%20sample%2C%20professional%20studio%20shot%20with%20perfect%20lighting%20and%20composition%2C%20showcasing%20photography%20expertise&width=400&height=400&seq=${index + 10}&orientation=squarish`}
alt={`Gallery ${index}`}
className="w-full h-full object-cover"
/>
<div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
<button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 !rounded-button whitespace-nowrap">
<i className="fas fa-edit"></i>
</button>
<button className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100 !rounded-button whitespace-nowrap">
<i className="fas fa-trash"></i>
</button>
</div>
</div>
<div className="p-4">
<div className="flex items-center justify-between">
<span className="text-sm text-gray-500">Imagen {index}</span>
<div className="flex gap-2">
{index > 1 && (
<button className="text-gray-600 hover:text-gray-800 !rounded-button whitespace-nowrap">
<i className="fas fa-arrow-left"></i>
</button>
)}
{index < 6 && (
<button className="text-gray-600 hover:text-gray-800 !rounded-button whitespace-nowrap">
<i className="fas fa-arrow-right"></i>
</button>
)}
</div>
</div>
</div>
</div>
))}
</div>
<div className="mt-6 flex justify-center">
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 !rounded-button whitespace-nowrap">
<i className="fas fa-plus"></i>
Agregar Nueva Imagen
</button>
</div>
</div>
</div>
);
setActiveMenu('gallery');
// Add a new case in the renderContent function to handle the gallery content
const existingRenderContent = renderContent;
renderContent = () => {
if (activeMenu === 'gallery') {
return galleryContent;
}
return existingRenderContent();
};
}}
>
<div className="bg-indigo-100 p-4 rounded-full mb-4">
<i className="fas fa-images text-indigo-600 text-2xl"></i>
</div>
<h3 className="text-lg font-semibold">Galería de Imágenes</h3>
<p className="text-gray-500 text-sm text-center mt-2">Gestiona las imágenes del carrusel y galería</p>
</div>
<div
className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
onClick={() => {
const packagesContent = (
<div className="p-6">
<div className="flex justify-between items-center mb-6">
<h2 className="text-xl font-bold">Gestión de Paquetes Fotográficos</h2>
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 !rounded-button whitespace-nowrap">
<i className="fas fa-plus"></i>
Nuevo Paquete
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{[1, 2, 3].map((index) => (
<div key={index} className="bg-white rounded-lg shadow">
<div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
<img
src={`https://readdy.ai/api/search-image?query=professional%20photography%20session%20setup%20with%20elegant%20lighting%20and%20modern%20equipment%2C%20showcasing%20premium%20photo%20shoot%20package&width=400&height=300&seq=${index + 20}&orientation=landscape`}
alt={`Package ${index}`}
className="w-full h-full object-cover"
/>
<div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
<button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 !rounded-button whitespace-nowrap">
<i className="fas fa-edit"></i>
</button>
<button className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100 !rounded-button whitespace-nowrap">
<i className="fas fa-trash"></i>
</button>
</div>
</div>
<div className="p-4">
<h3 className="font-semibold text-lg mb-2">Paquete Premium {index}</h3>
<p className="text-gray-600 text-sm mb-4">Sesión profesional con todos los servicios incluidos</p>
<div className="flex justify-between items-center">
<span className="text-indigo-600 font-semibold">$299.99</span>
<div className="flex gap-2">
<button className="text-gray-600 hover:text-gray-800 !rounded-button whitespace-nowrap">
<i className="fas fa-arrow-up"></i>
</button>
<button className="text-gray-600 hover:text-gray-800 !rounded-button whitespace-nowrap">
<i className="fas fa-arrow-down"></i>
</button>
</div>
</div>
</div>
</div>
))}
</div>
</div>
);
setActiveMenu('packages');
const existingRenderContent = renderContent;
renderContent = () => {
if (activeMenu === 'packages') {
return packagesContent;
}
return existingRenderContent();
};
}}
>
<div className="bg-green-100 p-4 rounded-full mb-4">
<i className="fas fa-camera text-green-600 text-2xl"></i>
</div>
<h3 className="text-lg font-semibold">Paquetes Fotográficos</h3>
<p className="text-gray-500 text-sm text-center mt-2">Administra los paquetes y servicios</p>
</div>
<div
className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
onClick={() => {
const testimonialsContent = (
<div className="p-6">
<div className="flex justify-between items-center mb-6">
<h2 className="text-xl font-bold">Gestión de Testimonios</h2>
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 !rounded-button whitespace-nowrap">
<i className="fas fa-plus"></i>
Nuevo Testimonio
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{[1, 2, 3, 4, 5, 6].map((index) => (
<div key={index} className="bg-white rounded-lg shadow">
<div className="p-6">
<div className="flex items-center mb-4">
<div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
<span className="text-indigo-600 font-semibold">JD</span>
</div>
<div>
<h3 className="font-semibold">Juan Díaz</h3>
<p className="text-sm text-gray-500">Cliente Satisfecho</p>
</div>
<div className="ml-auto flex gap-2">
<button className="text-gray-600 hover:text-gray-800 !rounded-button whitespace-nowrap">
<i className="fas fa-edit"></i>
</button>
<button className="text-red-600 hover:text-red-800 !rounded-button whitespace-nowrap">
<i className="fas fa-trash"></i>
</button>
</div>
</div>
<p className="text-gray-600 mb-4">"Excelente servicio, las fotos quedaron increíbles. Muy profesionales y atentos en todo momento."</p>
<div className="flex items-center justify-between">
<div className="flex text-amber-400">
<i className="fas fa-star"></i>
<i className="fas fa-star"></i>
<i className="fas fa-star"></i>
<i className="fas fa-star"></i>
<i className="fas fa-star"></i>
</div>
<span className="text-sm text-gray-500">Hace 2 días</span>
</div>
</div>
</div>
))}
</div>
</div>
);
setActiveMenu('testimonials');
const existingRenderContent = renderContent;
renderContent = () => {
if (activeMenu === 'testimonials') {
return testimonialsContent;
}
return existingRenderContent();
};
}}
>
<div className="bg-amber-100 p-4 rounded-full mb-4">
<i className="fas fa-comment-alt text-amber-600 text-2xl"></i>
</div>
<h3 className="text-lg font-semibold">Testimonios</h3>
<p className="text-gray-500 text-sm text-center mt-2">Gestiona los testimonios de clientes</p>
</div>
<div
className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
onClick={() => {
const siteConfigContent = (
<div className="p-6">
<h2 className="text-xl font-bold mb-6">Configuración del Sitio</h2>
<div className="bg-white rounded-lg shadow">
<div className="p-6">
<div className="space-y-6">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Título del Sitio</label>
<input
type="text"
className="border border-gray-300 rounded-lg w-full p-2 text-sm"
defaultValue="Artiles Photography Studio"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
<textarea
className="border border-gray-300 rounded-lg w-full p-2 text-sm"
rows={4}
defaultValue="Estudio fotográfico profesional especializado en retratos, eventos y fotografía comercial."
></textarea>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Palabras Clave</label>
<input
type="text"
className="border border-gray-300 rounded-lg w-full p-2 text-sm"
defaultValue="fotografía, estudio, retratos, eventos, bodas, quinceañeras"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Color Principal</label>
<div className="flex gap-4">
<input
type="color"
className="h-10 w-20"
defaultValue="#4F46E5"
/>
<input
type="text"
className="border border-gray-300 rounded-lg p-2 text-sm"
defaultValue="#4F46E5"
/>
</div>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Fuente Principal</label>
<select className="border border-gray-300 rounded-lg w-full p-2 text-sm">
<option>Inter</option>
<option>Roboto</option>
<option>Open Sans</option>
<option>Montserrat</option>
</select>
</div>
<div className="pt-4">
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg !rounded-button whitespace-nowrap">
Guardar Cambios
</button>
</div>
</div>
</div>
</div>
</div>
);
setActiveMenu('site-config');
const existingRenderContent = renderContent;
renderContent = () => {
if (activeMenu === 'site-config') {
return siteConfigContent;
}
return existingRenderContent();
};
}}
>
<div className="bg-red-100 p-4 rounded-full mb-4">
<i className="fas fa-cog text-red-600 text-2xl"></i>
</div>
<h3 className="text-lg font-semibold">Configuración</h3>
<p className="text-gray-500 text-sm text-center mt-2">Ajustes generales del sitio</p>
</div>
</div>
<div className="bg-white rounded-lg shadow">
<div className="p-6 border-b">
<h2 className="text-lg font-semibold">Contenido Reciente</h2>
</div>
<div className="p-6">
<div className="space-y-6">
<div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b">
<div className="w-full md:w-40 h-24 bg-gray-200 rounded-lg overflow-hidden">
<img
src="https://readdy.ai/api/search-image?query=professional%20photography%20session%20with%20elegant%20models%20in%20a%20studio%20setting%20with%20soft%20lighting%20and%20minimalist%20backdrop%2C%20high%20quality%20professional%20camera%20equipment%20visible&width=160&height=96&seq=1&orientation=landscape"
alt="Sesión de fotos"
className="w-full h-full object-cover object-top"
/>
</div>
<div className="flex-1">
<h3 className="font-medium">Sesión Quinceañera Premium</h3>
<p className="text-sm text-gray-500 mt-1">Paquete fotográfico actualizado el 03/05/2025</p>
<div className="flex items-center mt-2">
<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Publicado</span>
</div>
</div>
<div className="flex space-x-2">
<button className="text-indigo-600 hover:text-indigo-900 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-edit"></i>
</button>
<button className="text-red-600 hover:text-red-900 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-trash"></i>
</button>
</div>
</div>
<div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b">
<div className="w-full md:w-40 h-24 bg-gray-200 rounded-lg overflow-hidden">
<img
src="https://readdy.ai/api/search-image?query=wedding%20photography%20scene%20with%20bride%20and%20groom%20in%20elegant%20attire%2C%20professional%20lighting%20setup%2C%20romantic%20atmosphere%2C%20high%20resolution%20image%20with%20bokeh%20effect&width=160&height=96&seq=2&orientation=landscape"
alt="Fotografía de boda"
className="w-full h-full object-cover object-top"
/>
</div>
<div className="flex-1">
<h3 className="font-medium">Paquete Bodas Gold</h3>
<p className="text-sm text-gray-500 mt-1">Paquete fotográfico actualizado el 01/05/2025</p>
<div className="flex items-center mt-2">
<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Publicado</span>
</div>
</div>
<div className="flex space-x-2">
<button className="text-indigo-600 hover:text-indigo-900 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-edit"></i>
</button>
<button className="text-red-600 hover:text-red-900 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-trash"></i>
</button>
</div>
</div>
<div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b">
<div className="w-full md:w-40 h-24 bg-gray-200 rounded-lg overflow-hidden">
<img
src="https://readdy.ai/api/search-image?query=family%20portrait%20photography%20session%20in%20outdoor%20setting%20with%20natural%20lighting%2C%20professional%20camera%20equipment%20visible%2C%20beautiful%20composition%20with%20blurred%20natural%20background&width=160&height=96&seq=3&orientation=landscape"
alt="Fotografía familiar"
className="w-full h-full object-cover object-top"
/>
</div>
<div className="flex-1">
<h3 className="font-medium">Sesión Familiar Estándar</h3>
<p className="text-sm text-gray-500 mt-1">Paquete fotográfico actualizado el 29/04/2025</p>
<div className="flex items-center mt-2">
<span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Borrador</span>
</div>
</div>
<div className="flex space-x-2">
<button className="text-indigo-600 hover:text-indigo-900 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-edit"></i>
</button>
<button className="text-red-600 hover:text-red-900 cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-trash"></i>
</button>
</div>
</div>
</div>
</div>
</div>
</div>
);
case 'settings':
return (
<div className="p-6">
<h1 className="text-2xl font-bold mb-6">Configuración General</h1>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2">
<div className="bg-white rounded-lg shadow mb-6">
<div className="p-6 border-b">
<h2 className="text-lg font-semibold">Gestión del Logo</h2>
</div>
<div className="p-6">
<div className="space-y-6">
<div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
<div className="text-center">
<img
src="https://readdy.ai/api/search-image?query=minimalist%20photography%20studio%20logo%20design%20with%20elegant%20typography%20and%20camera%20icon%2C%20professional%20branding%2C%20clean%20modern%20style%20on%20white%20background&width=200&height=80&seq=4&orientation=landscape"
alt="Logo actual"
className="mx-auto mb-4 h-20 object-contain"
/>
<div className="space-y-2">
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-upload mr-2"></i>Cambiar Logo
</button>
<p className="text-sm text-gray-500">PNG, JPG o SVG (Max. 2MB)</p>
</div>
</div>
</div>
<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Texto Alternativo</label>
<input
type="text"
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="Artiles Photography Studio Logo"
defaultValue="Artiles Photography Studio Logo"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Dimensiones Recomendadas</label>
<div className="text-sm text-gray-500">
<p>• Header: 200x80px</p>
<p>• Favicon: 32x32px</p>
<p>• Redes sociales: 500x500px</p>
</div>
</div>
</div>
<div className="pt-4">
<button 
  onClick={() => {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Los cambios han sido guardados correctamente',
      icon: 'success',
      confirmButtonColor: '#E67E22',
      confirmButtonText: 'Aceptar'
    });
  }}
  className="bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap">
  Guardar Cambios
</button>
</div>
</div>
</div>
</div>
<div className="bg-white rounded-lg shadow mb-6">
<div className="p-6 border-b">
<h2 className="text-lg font-semibold">Información de Contacto</h2>
</div>
<div className="p-6">
<div className="space-y-6">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
<div className="flex">
<div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
+1
</div>
<input
type="text"
className="rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="809-555-1234"
defaultValue="809-555-1234"
/>
</div>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
<div className="flex">
<div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
+1
</div>
<input
type="text"
className="rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="809-555-5678"
defaultValue="809-555-5678"
/>
</div>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
<input
type="email"
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="contacto@artilesphotography.com"
defaultValue="contacto@artilesphotography.com"
/>
</div>
<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
<div className="flex gap-2">
<input
type="text"
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="Buscar ubicación..."
defaultValue="Av. Winston Churchill #95, Plaza Paraíso, Local 102, Santo Domingo"
/>
<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-search"></i>
</button>
</div>
</div>
<div className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden">
<iframe
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.225307807289!2d-69.93663492414066!3d18.47150796791757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea561f4a5b48f3d%3A0x9c5b0c6c3e9397a4!2sAv.%20Winston%20Churchill%2C%20Santo%20Domingo!5e0!3m2!1sen!2sdo!4v1683244669374!5m2!1sen!2sdo"
className="absolute inset-0 w-full h-full border-none"
allowFullScreen
loading="lazy"
referrerPolicy="no-referrer-when-downgrade"
></iframe>
<div className="absolute bottom-4 right-4 z-10">
<button className="bg-white text-gray-700 px-3 py-2 rounded-lg shadow-md text-sm cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-location-crosshairs mr-2"></i>Usar mi ubicación
</button>
</div>
</div>
<div className="flex gap-4">
<div className="flex-1">
<label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
<input
type="text"
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
defaultValue="18.471507"
readOnly
/>
</div>
<div className="flex-1">
<label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
<input
type="text"
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
defaultValue="-69.936635"
readOnly
/>
</div>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Detalles adicionales</label>
<input
type="text"
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="Ej: Local 102, Edificio Plaza Paraíso"
defaultValue="Local 102, Plaza Paraíso"
/>
</div>
</div>
<div className="pt-4">
<button 
  onClick={() => {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Los cambios han sido guardados correctamente',
      icon: 'success',
      confirmButtonColor: '#E67E22',
      confirmButtonText: 'Aceptar'
    });
  }}
  className="bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap">
  Guardar Cambios
</button>
</div>
</div>
</div>
</div>
<div className="bg-white rounded-lg shadow">
<div className="p-6 border-b">
<h2 className="text-lg font-semibold">Redes Sociales</h2>
</div>
<div className="p-6">
<div className="space-y-6">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
<div className="flex">
<div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
<i className="fab fa-instagram"></i>
</div>
<input
type="text"
className="rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="@artilesphotography"
defaultValue="@artilesphotography"
/>
</div>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
<div className="flex">
<div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
<i className="fab fa-facebook-f"></i>
</div>
<input
type="text"
className="rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="ArtilesPhotographyStudio"
defaultValue="ArtilesPhotographyStudio"
/>
</div>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
<div className="flex">
<div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
<i className="fab fa-twitter"></i>
</div>
<input
type="text"
className="rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="@ArtilesPhoto"
defaultValue="@ArtilesPhoto"
/>
</div>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
<div className="flex">
<div className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-l-lg">
<i className="fab fa-tiktok"></i>
</div>
<input
type="text"
className="rounded-none rounded-r-lg border border-gray-300 text-gray-900 block flex-1 min-w-0 w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="@artilesphotography"
defaultValue="@artilesphotography"
/>
</div>
</div>
<div className="pt-4">
<button 
  onClick={() => {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Los cambios han sido guardados correctamente',
      icon: 'success',
      confirmButtonColor: '#E67E22',
      confirmButtonText: 'Aceptar'
    });
  }}
  className="bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap">
  Guardar Cambios
</button>
</div>
</div>
</div>
</div>
</div>
<div>
<div className="bg-white rounded-lg shadow mb-6">
<div className="p-6 border-b">
<h2 className="text-lg font-semibold">Horario de Atención</h2>
</div>
<div className="p-6">
<div className="space-y-6">
<div className="bg-indigo-50 rounded-lg p-4">
<div className="flex items-start">
<div className="flex-shrink-0">
<i className="fas fa-clock text-indigo-600 text-xl"></i>
</div>
<div className="ml-3">
<h3 className="text-sm font-medium text-indigo-800">Horario Flexible</h3>
<p className="mt-1 text-sm text-indigo-600">Nuestros servicios están disponibles bajo demanda. Nos adaptamos a sus necesidades y horarios preferidos.</p>
</div>
</div>
</div>
<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de Disponibilidad</label>
<textarea
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
rows={4}
defaultValue="Estamos disponibles para sesiones fotográficas según su conveniencia. Por favor, contáctenos para programar una cita en el horario que mejor se adapte a sus necesidades."
></textarea>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Respuesta Estimado</label>
<select className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
defaultChecked
/>
<label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
Recibir notificaciones de solicitudes de cita 24/7
</label>
</div>
</div>
<div className="pt-4">
<button 
  onClick={() => {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Los cambios han sido guardados correctamente',
      icon: 'success',
      confirmButtonColor: '#E67E22',
      confirmButtonText: 'Aceptar'
    });
  }}
  className="bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap">
  Guardar Cambios
</button>
</div>
</div>
</div>
</div>
<div className="space-y-6">
<div className="bg-white rounded-lg shadow">
<div className="p-6 border-b">
<h2 className="text-lg font-semibold">Política de Privacidad</h2>
</div>
<div className="p-6">
<div>
<textarea
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
rows={8}
defaultValue="En Artiles Photography Studio, respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita nuestro sitio web y le informará sobre sus derechos de privacidad y cómo la ley lo protege..."
></textarea>
<div className="pt-4">
<button 
  onClick={() => {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Los cambios han sido guardados correctamente',
      icon: 'success',
      confirmButtonColor: '#E67E22',
      confirmButtonText: 'Aceptar'
    });
  }}
  className="bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap">
  Guardar Cambios
</button>
</div>
</div>
</div>
</div>
<div className="bg-white rounded-lg shadow">
<div className="p-6 border-b">
<h2 className="text-lg font-semibold">Términos y Condiciones</h2>
</div>
<div className="p-6">
<div>
<textarea
className="border border-gray-300 rounded-lg text-gray-900 block w-full text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
rows={8}
defaultValue="Al utilizar los servicios de Artiles Photography Studio, usted acepta estos términos y condiciones en su totalidad. Por favor, lea detenidamente antes de utilizar nuestro sitio web y servicios. Estos términos establecen los derechos y obligaciones de todas las partes en relación con nuestros servicios fotográficos..."
></textarea>
<div className="pt-4">
<button 
  onClick={() => {
    Swal.fire({
      title: '¡Éxito!',
      text: 'Los cambios han sido guardados correctamente',
      icon: 'success',
      confirmButtonColor: '#E67E22',
      confirmButtonText: 'Aceptar'
    });
  }}
  className="bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap">
  Guardar Cambios
</button>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
);
default:
return (
<div className="p-6">
<h1 className="text-2xl font-bold">Seleccione una opción del menú</h1>
</div>
);
}
};
return (
<div className="min-h-screen bg-gray-100 flex">
{/* Menú lateral */}
<div className={`bg-indigo-800 text-white ${menuCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex flex-col`}>
<div className={`p-4 flex ${menuCollapsed ? 'justify-center' : 'justify-between'} items-center border-b border-indigo-700`}>
{!menuCollapsed && (
<div className="flex items-center">
<img
src="https://static.readdy.ai/image/4820f38f3efa31ae11d6b7e475de5646/9b2916c53c1ccef3625e51e25a07e2f8.png"
alt="Laura Artiles Fotografía"
className="h-8 w-auto"
/>
</div>
)}
{menuCollapsed && (
<div className="flex items-center">
<img
src="https://static.readdy.ai/image/4820f38f3efa31ae11d6b7e475de5646/9b2916c53c1ccef3625e51e25a07e2f8.png"
alt="Laura Artiles Fotografía"
className="h-8 w-auto"
/>
</div>
)}
<button
className="text-white hover:bg-indigo-700 p-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap"
onClick={() => setMenuCollapsed(!menuCollapsed)}
>
<i className={`fas ${menuCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
</button>
</div>
<div className="flex-1 overflow-y-auto py-4">
<ul>
<li className="mb-1">
<button
className={`flex items-center ${menuCollapsed ? 'justify-center' : 'justify-start'} w-full p-3 rounded-lg ${activeMenu === 'dashboard' ? 'bg-[#34495E]' : 'hover:bg-[#34495E]'} transition-colors cursor-pointer !rounded-button whitespace-nowrap`}
onClick={() => setActiveMenu('dashboard')}
>
<i className="fas fa-tachometer-alt"></i>
{!menuCollapsed && <span className="ml-3">Panel de Control</span>}
</button>
</li>
<li className="mb-1">
<button
className={`flex items-center ${menuCollapsed ? 'justify-center' : 'justify-start'} w-full p-3 rounded-lg ${activeMenu === 'users' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} transition-colors cursor-pointer !rounded-button whitespace-nowrap`}
onClick={() => setActiveMenu('users')}
>
<i className="fas fa-users"></i>
{!menuCollapsed && <span className="ml-3">Usuarios y Roles</span>}
</button>
</li>
<li className="mb-1">
<button
className={`flex items-center ${menuCollapsed ? 'justify-center' : 'justify-start'} w-full p-3 rounded-lg ${activeMenu === 'content' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} transition-colors cursor-pointer !rounded-button whitespace-nowrap`}
onClick={() => setActiveMenu('content')}
>
<i className="fas fa-images"></i>
{!menuCollapsed && <span className="ml-3">Gestión de Contenido</span>}
</button>
</li>
<li className="mb-1">
<button
className={`flex items-center ${menuCollapsed ? 'justify-center' : 'justify-start'} w-full p-3 rounded-lg ${activeMenu === 'settings' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} transition-colors cursor-pointer !rounded-button whitespace-nowrap`}
onClick={() => setActiveMenu('settings')}
>
<i className="fas fa-cog"></i>
{!menuCollapsed && <span className="ml-3">Configuración</span>}
</button>
</li>
<li className="mb-1">
<button
className={`flex items-center ${menuCollapsed ? 'justify-center' : 'justify-start'} w-full p-3 rounded-lg ${activeMenu === 'analytics' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} transition-colors cursor-pointer !rounded-button whitespace-nowrap`}
onClick={() => setActiveMenu('analytics')}
>
<i className="fas fa-chart-line"></i>
{!menuCollapsed && <span className="ml-3">Analíticas</span>}
</button>
</li>
<li className="mb-1">
<button
className={`flex items-center ${menuCollapsed ? 'justify-center' : 'justify-start'} w-full p-3 rounded-lg ${activeMenu === 'reports' ? 'bg-indigo-700' : 'hover:bg-indigo-700'} transition-colors cursor-pointer !rounded-button whitespace-nowrap`}
onClick={() => setActiveMenu('reports')}
>
<i className="fas fa-file-alt"></i>
{!menuCollapsed && <span className="ml-3">Reportes</span>}
</button>
</li>
</ul>
</div>
<div className={`p-4 border-t border-indigo-700 ${menuCollapsed ? 'text-center' : ''}`}>
<button className="text-white hover:bg-indigo-700 p-2 rounded-lg w-full flex items-center justify-center cursor-pointer !rounded-button whitespace-nowrap">
<i className="fas fa-sign-out-alt"></i>
{!menuCollapsed && <span className="ml-2">Cerrar Sesión</span>}
</button>
</div>
</div>
{/* Contenido principal */}
<div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
{/* Header */}
<header className="bg-white shadow-sm">
<div className="flex justify-between items-center px-6 py-3">
<div className="flex items-center">
<div className="text-xl font-semibold text-gray-800">
{activeMenu === 'dashboard' && 'Panel de Control'}
{activeMenu === 'users' && 'Gestión de Usuarios y Roles'}
{activeMenu === 'content' && 'Gestión de Contenido'}
{activeMenu === 'settings' && 'Configuración General'}
{activeMenu === 'analytics' && 'Analíticas'}
{activeMenu === 'reports' && 'Reportes'}
</div>
</div>
<div className="flex items-center space-x-4">
{/* Botón de notificaciones */}
<div className="relative">
<button
className="text-gray-500 hover:text-gray-700 p-2 rounded-lg cursor-pointer !rounded-button whitespace-nowrap"
onClick={() => setNotificationsOpen(!notificationsOpen)}
>
<i className="fas fa-bell"></i>
<span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
</button>
{notificationsOpen && (
<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10">
<div className="p-4 border-b">
<h3 className="text-lg font-semibold">Notificaciones</h3>
</div>
<div className="max-h-96 overflow-y-auto">
<div className="p-4 border-b hover:bg-gray-50">
<div className="flex">
<div className="flex-shrink-0">
<div className="bg-indigo-100 rounded-full p-2">
<i className="fas fa-user-plus text-indigo-600"></i>
</div>
</div>
<div className="ml-3">
<p className="text-sm font-medium">Nuevo usuario registrado</p>
<p className="text-xs text-gray-500">Hace 5 minutos</p>
</div>
</div>
</div>
<div className="p-4 border-b hover:bg-gray-50">
<div className="flex">
<div className="flex-shrink-0">
<div className="bg-green-100 rounded-full p-2">
<i className="fas fa-image text-green-600"></i>
</div>
</div>
<div className="ml-3">
<p className="text-sm font-medium">12 nuevas imágenes subidas</p>
<p className="text-xs text-gray-500">Hace 2 horas</p>
</div>
</div>
</div>
<div className="p-4 hover:bg-gray-50">
<div className="flex">
<div className="flex-shrink-0">
<div className="bg-amber-100 rounded-full p-2">
<i className="fas fa-exclamation-triangle text-amber-600"></i>
</div>
</div>
<div className="ml-3">
<p className="text-sm font-medium">Alerta de espacio de almacenamiento</p>
<p className="text-xs text-gray-500">Hace 1 día</p>
</div>
</div>
</div>
</div>
<div className="p-2 text-center border-t">
<button className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer !rounded-button whitespace-nowrap">Ver todas las notificaciones</button>
</div>
</div>
)}
</div>
{/* Perfil de usuario */}
<div className="relative">
<button
className="flex items-center space-x-2 cursor-pointer !rounded-button whitespace-nowrap"
onClick={() => setUserDropdownOpen(!userDropdownOpen)}
>
<div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
CR
</div>
<div className="hidden md:block text-left">
<div className="text-sm font-medium">Carlos Rodríguez</div>
<div className="text-xs text-gray-500">Administrador</div>
</div>
<i className="fas fa-chevron-down text-gray-500 text-xs"></i>
</button>
{userDropdownOpen && (
<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
<div className="py-1">
<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</a>
<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Configuración</a>
<div className="border-t border-gray-100"></div>
<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cerrar Sesión</a>
</div>
</div>
)}
</div>
</div>
</div>
</header>
{/* Contenido principal */}
<main className="flex-1 overflow-y-auto bg-gray-100">
{renderContent()}
</main>
</div>
</div>
);
};
export default App
