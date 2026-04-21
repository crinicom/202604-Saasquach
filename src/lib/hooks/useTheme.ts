import { useEffect, useMemo } from 'react';
import { useRitual } from './useRitual';

export const useTheme = () => {
  const { tenantConfig } = useRitual();
  
  const cssVariables = useMemo(() => {
    return {
      '--theme-primary': tenantConfig.primaryColor,
      '--theme-secondary': tenantConfig.secondaryColor,
      '--theme-gradient': tenantConfig.primaryGradient,
      '--theme-glow': tenantConfig.glowColor,
    };
  }, [tenantConfig]);
  
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    return () => {
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVariables]);
  
  return { cssVariables, tenantConfig };
};