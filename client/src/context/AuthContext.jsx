import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey'));
  const [plan, setPlan] = useState(localStorage.getItem('plan'));

  const login = (newToken, newApiKey, newPlan) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('apiKey', newApiKey);
    localStorage.setItem('plan', newPlan);
    setToken(newToken);
    setApiKey(newApiKey);
    setPlan(newPlan);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setApiKey(null);
    setPlan(null);
  };

  return (
    <AuthContext.Provider value={{ token, apiKey, plan, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);