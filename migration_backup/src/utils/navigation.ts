export const getPersistentUrl = (newParams: Record<string, string>): string => {
  const url = new URL(window.location.href);
  
  Object.entries(newParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  
  return url.toString();
};

export const navigateTo = (newParams: Record<string, string>): void => {
  const url = getPersistentUrl(newParams);
  window.location.href = url;
};

export const getUrlParam = (param: string): string | null => {
  const url = new URL(window.location.href);
  return url.searchParams.get(param);
};

export const getAllUrlParams = (): Record<string, string> => {
  const url = new URL(window.location.href);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};
