interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = ({ title, description, className = "" }: SectionHeaderProps) => (
  <div className={`text-center mb-12 ${className}`.trim()}>
    <h2 className="mb-4">
      {title}
    </h2>
    {description && (
      <p className="max-w-3xl mx-auto">
        {description}
      </p>
    )}
  </div>
);
