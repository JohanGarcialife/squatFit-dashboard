/**
 * Utilidades de debugging para autenticación
 * USO: Importar en la consola del navegador para diagnosticar problemas de auth
 */

export const debugAuth = () => {
  console.group("🔍 Debug de Autenticación");

  // 1. Verificar localStorage
  const tokenFromStorage = localStorage.getItem("authToken");
  console.log(
    "1️⃣ Token en localStorage:",
    tokenFromStorage ? `✅ ${tokenFromStorage.substring(0, 30)}...` : "❌ NO ENCONTRADO",
  );

  // 2. Verificar cookies
  const cookies = document.cookie;
  console.log("2️⃣ Cookies disponibles:", cookies || "❌ VACÍO");

  // 3. Verificar si el token es válido (JWT format)
  if (!tokenFromStorage) {
    console.groupEnd();
    return {
      hasToken: false,
      token: null,
      clearToken: () => {
        localStorage.removeItem("authToken");
        console.log("✅ Token eliminado de localStorage");
      },
    };
  }

  try {
    const parts = tokenFromStorage.split(".");
    if (parts.length !== 3) {
      console.error("❌ Formato de token inválido - No es un JWT válido");
      console.groupEnd();
      return {
        hasToken: true,
        token: tokenFromStorage,
        clearToken: () => {
          localStorage.removeItem("authToken");
          console.log("✅ Token eliminado de localStorage");
        },
      };
    }

    const payload = JSON.parse(atob(parts[1]));
    console.log("3️⃣ Token decodificado:", payload);

    // Verificar expiración
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = now > expirationDate;

      console.log("4️⃣ Expiración del token:");
      console.log("   - Expira en:", expirationDate.toLocaleString());
      console.log("   - Ahora:", now.toLocaleString());
      console.log("   - Estado:", isExpired ? "❌ EXPIRADO" : "✅ VÁLIDO");

      if (isExpired) {
        console.error("⚠️ EL TOKEN HA EXPIRADO - Necesitas hacer login nuevamente");
      }
    }
  } catch (error) {
    console.error("❌ Error decodificando token:", error);
  }

  console.groupEnd();

  return {
    hasToken: !!tokenFromStorage,
    token: tokenFromStorage,
    clearToken: () => {
      localStorage.removeItem("authToken");
      console.log("✅ Token eliminado de localStorage");
    },
  };
};

// Exponer globalmente para uso en consola
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).debugAuth = debugAuth;
}
