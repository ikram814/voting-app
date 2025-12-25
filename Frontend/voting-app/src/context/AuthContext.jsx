// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      // Si l'erreur est 401 (non authentifié) ou toute autre erreur,
      // on met user à null
      setUser(null);
      console.log('No active session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      // Appel de l'API de login
      await api.post('/auth/login', credentials);
      // Recharger l'utilisateur depuis le serveur
      await loadUser();
    } catch (err) {
      // Propager l'erreur pour qu'elle soit gérée par le composant
      throw err;
    }
  };

  const register = async (payload) => {
    try {
      // Appel de l'API d'inscription
      await api.post('/auth/register', payload);
      // Ne pas charger l'utilisateur ici, le laisser faire login après
    } catch (err) {
      // Propager l'erreur pour qu'elle soit gérée par le composant
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Toujours mettre user à null, même en cas d'erreur
      setUser(null);
    }
  };

  // ⬇️⬇️⬇️ NOUVELLE FONCTION updateUser ⬇️⬇️⬇️
  const updateUser = async (updates) => {
    try {
      // Appel de l'API pour mettre à jour l'utilisateur
      const res = await api.put('/user/update', updates);
      
      // ✅ IMPORTANT : Mettre à jour le state avec les nouvelles données
      setUser(res.data.user);
      
      // Retourner les nouvelles données
      return res.data.user;
    } catch (err) {
      // Propager l'erreur pour qu'elle soit gérée par le composant
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser, // ⬅️ Ajouter updateUser ici
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}