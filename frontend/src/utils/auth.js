
// =====================================
// OBTENER TOKEN DE LA SESIÓN
// =====================================

export const obtenerToken = () => {
  try {
    const sesion = JSON.parse(
      localStorage.getItem('humaniSesion') || '{}'
    );

    return sesion.token || '';
  } catch (error) {
    console.error('No se pudo obtener la sesión:', error);
    return '';
  }
};

// =====================================
// CREAR ENCABEZADOS DE AUTENTICACIÓN
// =====================================

export const headersAutenticacion = (incluirJSON = false) => {
  const token = obtenerToken();

  return {
    ...(incluirJSON && {
      'Content-Type': 'application/json'
    }),
    Authorization: `Bearer ${token}`
  };
};
