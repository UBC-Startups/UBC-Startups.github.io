"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { EventFormChoice } from "@/lib/events/form-definition";

type RegistrationDropdownProps = {
  id: string;
  label: string;
  fieldName: string;
  mode: "single" | "multi";
  choices: ReadonlyArray<EventFormChoice>;
  value: string | string[];
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  errorId: string;
  exclusiveValues?: ReadonlyArray<string>;
  onChange: (value: string | string[]) => void;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      className={[
        "pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary transition-transform duration-150",
        open ? "rotate-180" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 8.5 3.2 3.2L13 4.5" />
    </svg>
  );
}

/**
 * Registration-only listbox used by both single and multi choice questions.
 * The trigger is a native button and the popup is a labelled listbox so the
 * control keeps one keyboard model without depending on native OS menus.
 */
export function RegistrationDropdown({
  id,
  label,
  fieldName,
  mode,
  choices,
  value,
  placeholder,
  required = false,
  disabled = false,
  error,
  errorId,
  exclusiveValues = [],
  onChange,
}: RegistrationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPlacement, setMenuPlacement] = useState<"below" | "above">(
    "below",
  );
  const [menuMaxHeight, setMenuMaxHeight] = useState(288);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const typeaheadRef = useRef({ text: "", at: 0 });

  const selected = mode === "multi" && Array.isArray(value) ? value : [];
  const selectedValue = typeof value === "string" ? value : "";
  // Optional single-choice questions can be cleared, so the menu mirrors the
  // blank placeholder option the native select used to offer.
  const menuChoices: ReadonlyArray<EventFormChoice> =
    mode === "single" && !required
      ? [{ value: "", label: "No selection" }, ...choices]
      : choices;
  const menuChoiceCount = menuChoices.length;
  const activeChoiceIndex = Math.min(
    activeIndex,
    Math.max(menuChoiceCount - 1, 0),
  );
  const selectedIndex = menuChoices.findIndex((choice) =>
    mode === "multi" ? selected.includes(choice.value) : choice.value === selectedValue,
  );
  const selectedLabels = choices
    .filter((choice) =>
      mode === "multi"
        ? selected.includes(choice.value)
        : choice.value === selectedValue,
    )
    .map((choice) => choice.label);
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const listboxId = `${id}-listbox`;
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  // Adjust state during render so a control that becomes locked cannot keep a
  // stale open menu; this avoids an effect that only mirrors props to state.
  if (disabled && open) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    listboxRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${listboxId}-option-${activeChoiceIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeChoiceIndex, listboxId, open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function openMenu() {
    if (disabled) return;

    // Keep the absolute menu inside the active panel's scroll region. Prefer
    // opening upward when there is more room above than below.
    const trigger = triggerRef.current;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const region = trigger.closest<HTMLElement>("[data-registration-scroll]");
      const regionRect = region?.getBoundingClientRect();
      const upperBound = Math.max(regionRect?.top ?? 0, 0);
      const lowerBound = Math.min(
        regionRect?.bottom ?? window.innerHeight,
        window.innerHeight,
      );
      const spaceBelow = lowerBound - rect.bottom - 8;
      const spaceAbove = rect.top - upperBound - 8;
      const placement =
        spaceBelow < 200 && spaceAbove > spaceBelow ? "above" : "below";
      setMenuPlacement(placement);
      setMenuMaxHeight(
        Math.max(
          120,
          Math.min(288, placement === "above" ? spaceAbove : spaceBelow),
        ),
      );
    }

    typeaheadRef.current = { text: "", at: 0 };
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function closeAndFocusTrigger() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(choice: EventFormChoice) {
    if (disabled) return;

    if (mode === "single") {
      onChange(choice.value);
      closeAndFocusTrigger();
      return;
    }

    const exclusive = new Set(exclusiveValues);
    let next: string[];

    if (selected.includes(choice.value)) {
      next = selected.filter((current) => current !== choice.value);
    } else if (exclusive.has(choice.value)) {
      next = [choice.value];
    } else {
      next = selected.filter((current) => !exclusive.has(current));
      next.push(choice.value);
    }

    const nextSet = new Set(next);
    onChange(
      choices
        .map((current) => current.value)
        .filter((current) => nextSet.has(current)),
    );
  }

  function typeahead(event: KeyboardEvent<HTMLUListElement>): boolean {
    const { key } = event;
    if (
      key.length !== 1 ||
      key === " " ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return false;
    }

    event.preventDefault();
    const now = event.timeStamp;
    const current = typeaheadRef.current;
    const text = now - current.at > 700 ? key : current.text + key;
    typeaheadRef.current = { text, at: now };

    const query = text.toLowerCase();
    const start = activeChoiceIndex;
    for (let offset = 0; offset < menuChoiceCount; offset += 1) {
      const index = (start + offset) % menuChoiceCount;
      if (menuChoices[index].label.toLowerCase().startsWith(query)) {
        setActiveIndex(index);
        break;
      }
    }

    return true;
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (menuChoiceCount === 0) return;
    if (typeahead(event)) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((activeChoiceIndex + 1) % menuChoiceCount);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          (activeChoiceIndex - 1 + menuChoiceCount) % menuChoiceCount,
        );
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(menuChoiceCount - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(menuChoices[activeChoiceIndex]);
        break;
      case "Escape":
        event.preventDefault();
        closeAndFocusTrigger();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!open) openMenu();
    else listboxRef.current?.focus();
  }

  return (
    <div className="min-w-0">
      <label
        id={labelId}
        htmlFor={id}
        className="mb-xs block font-brand text-label-m"
      >
        {label}
        {required && (
          <span
            aria-hidden="true"
            className="ml-1 font-brand text-body-s font-normal text-ink-secondary"
          >
            (required)
          </span>
        )}
      </label>
      <div ref={containerRef} className="relative min-w-0">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={error ? errorId : undefined}
          data-invalid={error ? true : undefined}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={handleTriggerKeyDown}
          className={[
            "relative box-border flex min-h-12 w-full min-w-0 cursor-pointer items-center rounded-pill border border-solid bg-surface py-field-y pl-lg pr-14 text-left font-brand text-label-m outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-brand-red" : "border-muted",
            open ? "border-ink" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span
            id={valueId}
            className={[
              "block min-w-0 flex-1 truncate",
              selectedLabels.length > 0 ? "text-ink" : "text-ink-secondary",
            ].join(" ")}
          >
            {selectedLabels.length > 0
              ? selectedLabels.join(", ")
              : placeholder}
          </span>
          <ChevronIcon open={open} />
        </button>
        {open && !disabled && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            aria-multiselectable={mode === "multi" ? true : undefined}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            aria-activedescendant={optionId(activeChoiceIndex)}
            tabIndex={-1}
            onKeyDown={handleListboxKeyDown}
            style={{ maxHeight: menuMaxHeight }}
            className={[
              "absolute left-0 right-0 z-30 m-0 box-border min-w-0 list-none overflow-y-auto overflow-x-hidden overscroll-contain rounded-field border border-solid border-muted bg-surface p-xs shadow-lg outline-none",
              menuPlacement === "above" ? "bottom-full mb-xs" : "top-full mt-xs",
            ].join(" ")}
          >
            {menuChoices.map((choice, index) => {
              const isSelected =
                mode === "multi"
                  ? selected.includes(choice.value)
                  : choice.value === selectedValue;
              const isActive = index === activeChoiceIndex;

              return (
                <li
                  key={choice.value || "__no_selection__"}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(choice)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={[
                    "m-0 flex min-w-0 cursor-pointer list-none items-center justify-between gap-sm rounded-field px-md py-sm font-brand text-label-m text-ink",
                    isActive ? "bg-canvas" : "bg-transparent hover:bg-canvas",
                  ].join(" ")}
                >
                  <span className="min-w-0 break-words">{choice.label}</span>
                  {isSelected && <CheckIcon />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {mode === "single" && selectedValue !== "" && (
        <input type="hidden" name={fieldName} value={selectedValue} />
      )}
      {mode === "multi" &&
        selected.map((selectedChoice) => (
          <input
            key={selectedChoice}
            type="hidden"
            name={fieldName}
            value={selectedChoice}
          />
        ))}
    </div>
  );
}
