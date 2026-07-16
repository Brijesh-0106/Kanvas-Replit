import { useState } from "react";
import { FaJava, FaNodeJs, FaPython, FaReact } from "react-icons/fa";
import { LuCheck, LuChevronDown, LuFilter } from "react-icons/lu";

const options = [
  {
    label: "All",
    icon: <LuFilter className="text-gray-400 w-4 h-4" />,
    value: "",
  },
  {
    label: "React",
    icon: <FaReact className="text-sky-400" />,
    value: "React",
  },
  {
    label: "Python",
    icon: <FaPython className="text-blue-500" />,
    value: "Python",
  },
  {
    label: "Node",
    icon: <FaNodeJs className="text-green-500" />,
    value: "Node",
  },
  {
    label: "Java",
    icon: <FaJava className="text-red-500" />,
    value: "Java",
  },
];

export default function Dropdown({
  setFilter,
}: {
  setFilter: (arg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(options[0]);

  const handleSelect = (opt: any) => {
    setSelected(opt);
    setFilter(opt.value);
    setOpen(false);
  };

  return (
    <div className="relative py-0 w-full sm:w-52">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 h-10 bg-[#2c2c2a] border border-[#c3c2b7]/50 rounded-xl text-sm  transition-colors"
      >
        <span className="flex items-center gap-2 text-[#c3c2b7]">
          {selected.icon}
          <span className="">{selected.label}</span>
        </span>
        <LuChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute z-10 mt-1.5 w-full bg-[#2c2c2a] border border-[#c3c2b7]/50 rounded-lg overflow-hidden shadow-sm">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt)}
              className={`flex text-[#c3c2b7] items-center gap-2 hover:bg-[#1e1e1f] px-4 py-2.5 text-sm cursor-pointer transition-colors`}
            >
              {opt.icon}
              {opt.label}
              {selected?.value === opt.value && (
                <LuCheck className="ml-auto w-4 h-4" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
