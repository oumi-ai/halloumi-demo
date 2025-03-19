
export interface ColoredSectionProps {
  // The tailwind color class to use for this section.
  colorClass: string;
  children: React.ReactNode;
  isFooter?: boolean;
}

export function ColoredSection(props: ColoredSectionProps) {
  return (
    <div className={"w-full " + props.colorClass}>
      <div className={`container px-6 py-16 ${props.isFooter ? "pb-0" : ""}`}>
        {props.children}
      </div>
    </div>
  )
}