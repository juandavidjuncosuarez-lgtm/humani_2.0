
const imagenesProductos = {
  'Coca Cola': '/imagenes/cocacola.jpg',
  'Bote de Agua': '/imagenes/agua.jpg',
  'Leche': '/imagenes/leche.jpg',
  'Yogur': '/imagenes/yogur.jpg',
  'Arroz': '/imagenes/arroz.jpg',
  'Frijol': '/imagenes/frijol.jpg',
  'Papas': '/imagenes/papas.jpg',
  'Atún': '/imagenes/atun.jpg',
  'Sardinas': '/imagenes/sardinas.jpg',
};

export const obtenerImagenProducto = (nombre) => {
  return imagenesProductos[nombre] || null;
};

export default imagenesProductos;
