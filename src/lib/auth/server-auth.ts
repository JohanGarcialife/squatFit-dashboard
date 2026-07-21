import { isTokenValid, isStaffToken } from "./jwt-utils";
import { getAuthTokenFromCookies } from "./server-utils";

// Utilidades de autenticación para el servidor (middleware, API routes)
export const isAuthenticatedServer = async (): Promise<boolean> => {
  try {
    const token = await getAuthTokenFromCookies();
    // No basta con que el token no haya expirado: debe ser de un rol de STAFF.
    // Un token de cliente (rol `user`) es un JWT válido y, sin este check,
    // entraría al back office.
    return token ? isTokenValid(token) && isStaffToken(token) : false;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
