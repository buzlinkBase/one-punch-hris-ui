import { useRef } from "react";

interface ResizableTitleProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  width?: number;
  onResize?: (width: number) => void;
}

export function ResizableTitle({
  width,
  onResize,
  children,
  style,
  ...rest
}: ResizableTitleProps) {
  const startX = useRef(0);
  const startW = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    startW.current = width ?? 100;

    const onMove = (ev: MouseEvent) => {
      onResize?.(Math.max(60, startW.current + ev.clientX - startX.current));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <th {...rest} style={{ ...style, width, position: "relative" }}>
      {children}
      {onResize && (
        <span
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            top: 0,
            right: -2,
            bottom: 0,
            width: 6,
            cursor: "col-resize",
            zIndex: 1,
          }}
          className="group/resize"
        >
          <span
            style={{
              position: "absolute",
              top: "20%",
              bottom: "20%",
              left: "50%",
              width: 2,
              transform: "translateX(-50%)",
              borderRadius: 1,
              transition: "background 0.15s",
            }}
            className="bg-transparent group-hover/resize:bg-blue-400"
          />
        </span>
      )}
    </th>
  );
}
