import {

    createContext,
    useContext,
    useEffect,
    useState,

} from "react";

import type { ReactNode } from "react";

import { api } from "@/services/api";

import {

    login as loginService,
    User,
} from "@/services/authService";



interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {

      const token = api.getToken();

      if (token) {

          // nanti bisa request /auth/me

      }

      setIsLoading(false);

  }, []);

  const login = async (

      email: string,

      password: string

  ) => {

      const response = await loginService(

          email,

          password

      );

      const {

          token,

          user,

      } = response.data;

      api.setToken(token);

      setUser(user);

  };

 const logout = () => {

      api.clearToken();

      setUser(null);

  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
