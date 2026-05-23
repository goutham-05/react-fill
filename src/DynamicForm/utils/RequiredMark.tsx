import React from "react";

interface Props {
  isUnstyled?: boolean;
  className?: string;
}

/** Accessible required-field asterisk. aria-hidden so screen readers don't read "*". */
export const RequiredMark: React.FC<Props> = ({ isUnstyled, className }) => (
  <span
    aria-hidden="true"
    className={className}
    style={
      isUnstyled || className
        ? undefined
        : { color: "#e53e3e", marginLeft: "2px", fontWeight: 600 }
    }
  >
    *
  </span>
);
