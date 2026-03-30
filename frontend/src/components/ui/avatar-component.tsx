const INITIAL_COLORS = [
  "bg-[#EEEDFE] text-[#3C3489]",
  "bg-[#E1F5EE] text-[#085041]",
  "bg-[#E6F1FB] text-[#0C447C]",
  "bg-[#FBEAF0] text-[#72243E]",
  "bg-[#FAEEDA] text-[#633806]",
  "bg-[#EAF3DE] text-[#27500A]",
];

export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
