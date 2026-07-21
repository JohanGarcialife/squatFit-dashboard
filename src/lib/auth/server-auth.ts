import { isTokenValid, isStaffToken } from "./jwt-utils";
import { getAuthTokenFromCookies } from "./server-utils";

// Utilidades de autenticación para el servidor (middleware, API routes).
// El back office es solo para staff: exige token válido (no caducado) Y con un
// role.name de staff. Un cliente logado (role 'user') o un token sin rol NO entra.
export const isAuthenticatedServer = async (): Promise<boolean> => {
  try {
    const token = await getAuthTokenFromCookies();
    return token ? isTokenValid(token) && isStaffToken(token) : false;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
