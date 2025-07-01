import React, { createContext, useContext, useState, useEffect } from 'react';

const ApiKeyContext = createContext();

export function ApiKeyProvider({ children }) {
  const [qwenKey, setQwenKey] = useState('');
  const [exaKey, setExaKey] = useState('');

  // 从 localStorage 加载（简单编码）
  useEffect(() => {
    try {
      const savedQwenKey = localStorage.getItem('qwen_api_key');
      const savedExaKey = localStorage.getItem('exa_api_key');
      if (savedQwenKey) setQwenKey(atob(savedQwenKey));
      if (savedExaKey) setExaKey(atob(savedExaKey));
    } catch (error) {
      console.warn('Failed to load API keys from localStorage:', error);
    }
  }, []);

  const saveKeys = (qwen, exa) => {
    setQwenKey(qwen);
    setExaKey(exa);
    // 简单编码存储
    try {
      if (qwen) localStorage.setItem('qwen_api_key', btoa(qwen));
      if (exa) localStorage.setItem('exa_api_key', btoa(exa));
    } catch (error) {
      console.warn('Failed to save API keys to localStorage:', error);
    }
  };

  const clearKeys = () => {
    setQwenKey('');
    setExaKey('');
    localStorage.removeItem('qwen_api_key');
    localStorage.removeItem('exa_api_key');
  };

  return (
    <ApiKeyContext.Provider value={{ 
      qwenKey, 
      exaKey, 
      saveKeys, 
      clearKeys,
      hasKeys: Boolean(qwenKey && exaKey)
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeys() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }
  return context;
}