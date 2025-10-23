"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { cn } from "@/utils";

export interface TooltipProps {
  /**
   * Nội dung hiển thị trong tooltip
   */
  content: ReactNode;
  
  /**
   * Element sẽ trigger tooltip khi hover
   */
  children: ReactNode;
  
  /**
   * Vị trí tooltip so với element
   * @default "top"
   */
  position?: "top" | "bottom" | "left" | "right";
  
  /**
   * Delay trước khi hiển thị (ms)
   * @default 200
   */
  delay?: number;
  
  /**
   * Custom className cho tooltip container
   */
  className?: string;
  
  /**
   * Disable tooltip
   * @default false
   */
  disabled?: boolean;
}

/**
 * Tooltip Component
 * 
 * Component hiển thị thông tin bổ sung khi hover
 * 
 * Features:
 * - 🎯 4 vị trí: top, bottom, left, right
 * - ⏱️ Configurable delay
 * - ✨ Smooth animation
 * - 🎨 Customizable styling
 * - 📱 Responsive
 * 
 * @example
 * ```tsx
 * <Tooltip content="Click to view details">
 *   <Button>View</Button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    
    setShouldRender(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    // Delay unmount để animation chạy hết
    setTimeout(() => {
      setShouldRender(false);
    }, 200);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-3 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 translate-y-3 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 -translate-x-3 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 translate-x-3 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-[1px]",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-[1px]",
    left: "left-full top-1/2 -translate-y-1/2 -ml-[1px]",
    right: "right-full top-1/2 -translate-y-1/2 -mr-[1px]",
  };

  const arrowBorderClasses = {
    top: "border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white",
    bottom: "border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white",
    left: "border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white",
    right: "border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {shouldRender && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            // Base styles
            "absolute z-50 pointer-events-none",
            // Tooltip box - Snowball style
            "px-4 py-3 text-sm text-gray-700 bg-white rounded-xl shadow-xl border border-gray-100",
            "min-w-[300px] max-w-md break-words leading-relaxed",
            // Animation
            "transition-opacity duration-200",
            isVisible ? "opacity-100" : "opacity-0",
            // Position
            positionClasses[position],
            // Custom classes
            className
          )}
        >
          {content}
          
          {/* Arrow pointing to element */}
          <div
            className={cn(
              "absolute w-0 h-0",
              "border-solid",
              arrowClasses[position],
              arrowBorderClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
}
