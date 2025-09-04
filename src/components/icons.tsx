import { cn } from "@/lib/utils";

export const ScribeLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    className={cn("text-primary", className)}
    {...props}
  >
    <title>Scribe Logo</title>
    <g fill="currentColor">
      <path d="M192,40H146.49a40.12,40.12,0,0,0-72.98,0H24A16,16,0,0,0,8,56V200a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V56A16,16,0,0,0,232,40ZM128,48a24,24,0,1,1-24,24,24,24,0,0,1,24-24Zm104,152H24V56H72v8a16,16,0,0,0,16,16h80a16,16,0,0,0,16-16V56h48Z" />
      <rect x="56" y="120" width="144" height="16" rx="8" />
      <rect x="56" y="152" width="96" height="16" rx="8" />
    </g>
  </svg>
);
