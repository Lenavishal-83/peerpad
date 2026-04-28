import { createContext, useContext, useCallback } from 'react';

const SyncContext = createContext();

export const useSync = () => {
  return useContext(SyncContext);
};

export const SyncProvider = ({ children }) => {
  const dispatchEvent = useCallback((event) => {
    // In a real application, this would send data over WebSockets or similar
    console.log('[Sync Event Dispatched]:', event);
    
    // Simulate some logic
    // socket.emit('note-update', event);
  }, []);

  return (
    <SyncContext.Provider value={{ dispatchEvent }}>
      {children}
    </SyncContext.Provider>
  );
};
