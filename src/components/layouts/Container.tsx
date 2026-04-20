interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = ({ children, className = "" }: ContainerProps) => (
  <div className={`max-w-[1440px] mx-auto px-6 lg:px-12 ${className}`.trim()}>
    {children}
  </div>
);
