import { useState } from "react";

export default function useResize(initialWidth, initialHeight) {
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  const handleMouseDown = (e) => {
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);

      setSize({
        width: Math.max(320, newWidth),
        height: Math.max(300, newHeight),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return {
    size,
    handleMouseDown,
  };
}
