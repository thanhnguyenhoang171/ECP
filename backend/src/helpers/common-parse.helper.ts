export const parsePort = (
  port: string | undefined,
  defaultPort: number,
): number => {
  if (!port) return defaultPort;
  const parsed = parseInt(port, 10);
  return isNaN(parsed) ? defaultPort : parsed;
};
