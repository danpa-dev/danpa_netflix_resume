export const isProdRuntime = (): boolean => {
  return import.meta.env.PROD;
};
