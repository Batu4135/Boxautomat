"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function FormSubmitButton({
  children,
  className,
  disabled = false
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
    >
      {pending ? "Bitte warten..." : children}
    </button>
  );
}
