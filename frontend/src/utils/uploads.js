export function getUploadUrl(filename) {
  if (!filename) return null;
  const basename = String(filename).replace(/^private\//, '');
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    const origin = apiUrl.replace(/\/api\/?$/, '');
    return `${origin}/uploads/${basename}`;
  }
  return `/uploads/${basename}`;
}
