import { useEffect, useMemo, useRef, useState } from "react";
import { LuCheck, LuChevronDown, LuLock, LuSearch } from "react-icons/lu";

export type Repo = {
  fullName: string;
  private?: boolean;
  defaultBranch?: string;
  pushedAt?: string;
};

type Props = {
  options: Repo[];
  value: Repo | null;
  onChange: (repo: Repo) => void;
  disabled?: boolean;
};

export default function DropdownAny({
  options,
  value,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? options.filter((o) => o.fullName.toLowerCase().includes(q))
      : options;
  }, [options, query]);

  // reset highlight when the list changes
  useEffect(() => setActive(0), [query, open]);

  // keep highlighted row visible while arrowing
  useEffect(() => {
    (
      listRef.current?.children[active] as HTMLElement | undefined
    )?.scrollIntoView({
      block: "nearest",
    });
  }, [active]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (repo: Repo) => {
    onChange(repo);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault(); // don't submit the parent form
      if (filtered[active]) pick(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const [owner, name] = value ? value.fullName.split("/") : ["", ""];

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 h-11 bg-[#2c2c2a] border border-[#c3c2b7]/50 rounded-xl text-sm transition-colors hover:border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-2 truncate">
          {value ? (
            <>
              <span className="text-[#c3c2b7]/50">{owner}/</span>
              <span className="text-[#c3c2b7]">{name}</span>
              {value.private && (
                <LuLock className="w-3.5 h-3.5 text-[#c3c2b7]/50" />
              )}
            </>
          ) : (
            <span className="text-gray-500">Select a repository</span>
          )}
        </span>
        <LuChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-10 mt-1.5 w-full bg-[#2c2c2a] border border-[#c3c2b7]/50 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 border-b border-[#c3c2b7]/20">
            <LuSearch className="w-4 h-4 text-gray-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search repositories..."
              className="w-full bg-transparent py-2.5 text-sm text-[#c3c2b7] placeholder-gray-500 focus:outline-none"
            />
          </div>

          <ul ref={listRef} role="listbox" className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">
                No repos match “{query}”
              </li>
            ) : (
              filtered.map((opt, i) => {
                const [o, n] = opt.fullName.split("/");
                return (
                  <li
                    key={opt.fullName}
                    role="option"
                    aria-selected={value?.fullName === opt.fullName}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(opt)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer ${
                      i === active ? "bg-[#1e1e1f]" : ""
                    }`}
                  >
                    <span className="text-[#c3c2b7]/50">{o}/</span>
                    <span className="text-[#c3c2b7]">{n}</span>
                    {opt.private && (
                      <LuLock className="w-3.5 h-3.5 text-[#c3c2b7]/50" />
                    )}
                    {value?.fullName === opt.fullName && (
                      <LuCheck className="ml-auto w-4 h-4 text-amber-700" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
