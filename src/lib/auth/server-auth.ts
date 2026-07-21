import { isTokenValid } from "./jwt-utils";
import { getAuthTokenFromCookies } from "./server-utils";

// Utilidades de autenticación para el servidor (middleware, API routes)
export const isAuthenticatedServer = async (): Promise<boolean> => {
  try {
    const token = await getAuthTokenFromCookies();
    return token ? isTokenValid(token) : false;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
