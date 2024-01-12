import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const Section = ({ title, children, className }: SectionProps) => (
  <section className={twMerge("flex flex-col gap-5", className)}>
    <h1 className="text-4xl font-bold">{title}</h1>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">{children}</div>
  </section>
);

export default Section;
