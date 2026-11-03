import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
};

const Container = ({ children, className = "", narrow = false }: ContainerProps) => (
  <div
    className={`mx-auto w-full px-5 sm:px-6 lg:px-8 ${
      narrow ? "max-w-3xl" : "max-w-6xl"
    } ${className}`}
  >
    {children}
  </div>
);

export default Container;