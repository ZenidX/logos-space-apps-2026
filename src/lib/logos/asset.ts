// Rutas de /public con el basePath de la web (en GitHub Pages: /logos-space-apps-2026). En local, vacío.
export const asset = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;
