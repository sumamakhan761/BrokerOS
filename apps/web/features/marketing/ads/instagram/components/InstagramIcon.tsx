import React from "react";
import type { LucideProps } from "lucide-react";

export const InstagramIcon = React.forwardRef<SVGSVGElement, LucideProps>(
    ({ size = 24, strokeWidth = 2, className = "w-5 h-5", ...props }, ref) => {
        return (
            <svg
                ref={ref}
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
                {...props}
            >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
        );
    }
);

InstagramIcon.displayName = "InstagramIcon";

export const Instagram = InstagramIcon;
export default InstagramIcon;
