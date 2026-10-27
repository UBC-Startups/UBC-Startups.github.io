import type { HTMLAttributes } from "react";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={[
    "public-frame mx-auto box-border max-w-site px-page-gutter font-brand text-ink antialiased sm:px-page-gutter-sm lg:px-page-gutter-lg",
    className,
  ].filter(Boolean).join(" ")} />;
}
