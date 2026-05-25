
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOption = { value: string; label: string };

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label: string;
};


const FilterSelect = ({ value, onChange, options, label}: FilterSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="w-full h-10 bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10"
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-[#0b0f14] border-gray-200 dark:border-white/10">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="capitalize">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};


export default FilterSelect;
