"use client";
import clsx from "clsx";

interface Props {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
  index?: number;
  multi?: boolean;
}

export default function OptionButton({ label, sub, selected, onClick, index, multi }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "group relative w-full text-left rounded-[10px] border px-5 py-[18px] md:px-[22px]",
        "flex items-center gap-3.5 transition-all duration-300 bg-elev",
        selected
          ? "border-orange bg-orange-bg shadow-[inset_0_0_0_1px_#E6622A]"
          : "border-line-soft hover:border-orange-line hover:bg-orange-bg"
      )}
    >
      {typeof index === "number" && (
        <span
          className={clsx(
            "shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md border text-[13px] font-semibold transition-all",
            selected
              ? "border-orange text-orange bg-elev"
              : "border-line-soft text-muted bg-white/60 group-hover:text-orange group-hover:border-orange-line"
          )}
        >
          {String.fromCharCode(65 + index)}
        </span>
      )}
      <div className="flex-1">
        <div className={clsx("text-base", selected ? "text-primary font-semibold" : "text-primary font-medium")}>
          {label}
        </div>
        {sub && <div className="mt-0.5 text-xs text-muted font-normal">{sub}</div>}
      </div>
      <span
        className={clsx(
          "shrink-0 inline-flex h-5 w-5 items-center justify-center text-sm transition-all border",
          multi ? "rounded" : "rounded-full",
          selected
            ? "bg-orange border-orange text-white"
            : "border-line-soft text-transparent"
        )}
      >
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}
