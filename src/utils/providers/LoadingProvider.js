// LoadingContext.js
import React, { createContext, useRef } from 'react';

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const loadindRef = useRef(null);

  const setLoadingProgress = () => {
    loadindRef.current.continuousStart()
  }

  const setLoadingComplete =() => {
    loadindRef.current.complete()
  }

  return (
    <LoadingContext.Provider value={{ loadindRef, setLoadingProgress , setLoadingComplete  }}>
      {children}
    </LoadingContext.Provider>
  );
};

//export const useLoading = () => useContext(LoadingContext);
