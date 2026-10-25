import type { ComponentPropsWithRef } from "react";

type TextFieldProps = Omit<ComponentPropsWithRef<"input">, "id"> & {
  id: string;
  label: string;
  hideLabel?: boolean;
  tone?: "light" | "dark";
  hint?: string;
  error?: string;
  containerClassName?: string;
};

const tones = {
  light: "border-muted bg-surface text-ink placeholder:text-ink-secondary",
  dark: "border-ink-inverse bg-transparent text-ink-inverse placeholder:text-ink-inverse-muted",
};

export function TextField({ id, label, hideLabel = false, tone = "light", hint, error, className, containerClassName, "aria-describedby": describedBy, ...input }: TextFieldProps) {
  const descriptionId = `${id}-description`;
  const description = error || hint;
  return <div className={["min-w-0", tone === "dark" ? "text-ink-inverse" : "text-ink", containerClassName].filter(Boolean).join(" ")}>
    <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-xs block font-brand text-label-m"}>{label}</label>
    <input
      {...input}
      id={id}
      aria-invalid={error ? true : input["aria-invalid"]}
      aria-describedby={[describedBy, description ? descriptionId : undefined].filter(Boolean).join(" ") || undefined}
      className={[
        "box-border w-full min-w-0 rounded-pill border border-solid px-lg py-field-y font-brand text-label-m [line-height:normal] outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
        tones[tone], className,
      ].filter(Boolean).join(" ")}
    />
    {description && <p id={descriptionId} className="mt-xs mb-0 font-brand text-body-s" role={error ? "alert" : undefined}>{description}</p>}
  </div>;
}
