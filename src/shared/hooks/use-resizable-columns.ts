import { useCallback, useState } from "react";

export function useResizableColumns(initialWidths: Record<string, number>) {
  const [widths, setWidths] = useState(initialWidths);

  const handleResize = useCallback((key: string, w: number) => {
    setWidths((prev) => ({ ...prev, [key]: w }));
  }, []);

  return { widths, handleResize };
}
