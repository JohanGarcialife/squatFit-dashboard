import { useEffect, useState } from "react";

export function useAuthUser() {
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) return;

    fetch("https://squatfit-api-cyrc2g3zra-no.a.run.app/api/v1/admin-panel/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.name) {
          setUser({
            name: data.name,
            email: data.email,
            avatar: data.avatar || "",
          });
        }
      });
  }, []);

  return user;
}