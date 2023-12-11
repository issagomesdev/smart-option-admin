import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextData {
  isAuthenticated: boolean|null;
  user:any;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  token: () => string|null;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean|null>(null);
  const [user, setUser] = useState<any>({});
  const router = useRouter();
  const baseurl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');

    const checkTokenValidity = async () => {
      try {

        const response:any = await axios.post(
          `${baseurl}/api/auth/token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

          if (response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Erro:', error);
        }
    }

    if(token){
      checkTokenValidity();
    } else {
      setIsAuthenticated(false);
      setUser({});
      router.push('/');
    }

  }, []);

  const login = async(credentials:any) => {
    try {
        const response = await axios.post(`${baseurl}/api/auth`, credentials);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        router.push('/');
      } catch (error:any) {
        console.error('Erro ao autenticar', error.request.response);
        throw error.request.response;
      }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser({});
    router.push('/');
  };

  const token = () => {
    const token = localStorage.getItem('token');
    if(!token) logout();
    return token;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
