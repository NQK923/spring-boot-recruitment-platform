"use client";

import { useEffect, useRef, type TextareaHTMLAttributes } from "react";

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
  maxRows?: number;
};

export function AutoResizeTextarea({
  minRows = 3,
  maxRows = 20,
  className = "",
  onChange,
  value,
  defaultValue,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto để tính toán chính xác
    textarea.style.height = "auto";

    // Tính chiều cao dựa trên scrollHeight
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;
    
    let newHeight = textarea.scrollHeight;
    
    // Giới hạn chiều cao
    if (newHeight < minHeight) {
      newHeight = minHeight;
    } else if (newHeight > maxHeight) {
      newHeight = maxHeight;
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }

    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [value, defaultValue]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Adjust on mount
    adjustHeight();

    // Adjust on window resize
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className={`w-full min-h-[72px] resize-none rounded-2xl border border-primary-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200 ${className}`}
      onChange={handleChange}
      value={value}
      defaultValue={defaultValue}
      {...props}
    />
  );
}
