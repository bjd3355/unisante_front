import { useEffect, useState } from "react";

interface User {
  id: string;
  role: string;
  token: string;
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        const tokenExpiration = localStorage.getItem("tokenExpiration");

        if (tokenExpiration && new Date().getTime() > parseInt(tokenExpiration, 10)) {
          logout();
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Erreur de parsing de l'utilisateur", error);
      }
    }
  }, []);

  const login = (userData: User) => {
    const expirationTime = new Date().getTime() + 60 * 60 * 1000; // Expiration dans 1h
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("tokenExpiration", expirationTime.toString());
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiration");
    setUser(null);
  };

  return { user, login, logout };
};

export default useAuth;
