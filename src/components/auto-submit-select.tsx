"use client";

import type { ComponentPropsWithoutRef } from "react";

type AutoSubmitSelectProps = ComponentPropsWithoutRef<"select">;

export default function AutoSubmitSelect({
  onChange,
  ...props
}: AutoSubmitSelectProps) {
  return (
    <select
      {...props}
      onChange={(event) => {
        onChange?.(event);
        event.currentTarget.form?.requestSubmit();
      }}
    />
  );
}
