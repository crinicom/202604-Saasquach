import { useContext } from 'react';
import { RitualContext } from '../context/RitualContext';

export const useRitual = () => {
  const context = useContext(RitualContext);
  
  if (!context) {
    throw new Error(
      'useRitual must be used within a <RitualProvider>. ' +
      'Make sure your component is wrapped with RitualProvider before calling useRitual.'
    );
  }
  
  return context;
};
