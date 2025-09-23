import * as React from "react";
import { cn } from "../../utils/libUtils";

const Textarea = React.memo(
  React.forwardRef(({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  })
);
Textarea.displayName = "Textarea";

export { Textarea };
