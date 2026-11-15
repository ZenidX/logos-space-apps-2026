"use client";

// Volver a la página o vista anterior. Usa el historial del navegador (Plan a base y la portada de misiones guardan
// cada paso en la URL); si se entró directamente y no hay historial, vuelve a la portada.
import { useRouter } from "next/navigation";

export default function BackButton({ className = "", onNoHistory }: { className?: string; onNoHistory?: () => void }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back to the previous page"
      title="Back"
      className={className}
      onClick={() => {
        if (window.history.length > 1) window.history.back();
        else if (onNoHistory) onNoHistory();
        else router.push("/");
      }}
    >
      <span aria-hidden>←</span>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}
