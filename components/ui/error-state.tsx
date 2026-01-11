import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Error message to display
   */
  message?: string;
  
  /**
   * Optional retry function
   */
  onRetry?: () => void;
  
  /**
   * Optional title (defaults to "Something went wrong")
   */
  title?: string;
  
  /**
   * Show icon (defaults to true)
   */
  showIcon?: boolean;
  
  /**
   * Variant styling
   */
  variant?: "default" | "minimal" | "card";
}

/**
 * ErrorState - Premium error component with retry functionality
 * 
 * @example
 * <ErrorState 
 *   message="Unable to load guides. Please check your connection." 
 *   onRetry={() => fetchGuides()}
 * />
 */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      message = "We encountered an issue loading this content. Please try again.",
      onRetry,
      title = "Something went wrong",
      showIcon = true,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const isCard = variant === "card";
    const isMinimal = variant === "minimal";

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          isCard && "rounded-2xl border bg-card shadow-md p-8",
          !isCard && !isMinimal && "py-12 px-4",
          isMinimal && "py-6 px-4",
          className
        )}
        {...props}
      >
        {showIcon && (
          <div
            className={cn(
              "mb-4 rounded-full bg-red-50 p-3",
              isMinimal && "mb-3 p-2"
            )}
          >
            <AlertCircle
              className={cn(
                "text-brand",
                isMinimal ? "h-5 w-5" : "h-6 w-6"
              )}
            />
          </div>
        )}

        <h3
          className={cn(
            "font-semibold text-slate-900 mb-2",
            isMinimal ? "text-base" : "text-lg tracking-tight"
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            "text-muted-foreground max-w-md",
            isMinimal ? "text-sm mb-3" : "text-sm mb-6"
          )}
        >
          {message}
        </p>

        {onRetry && (
          <Button
            onClick={onRetry}
            variant="default"
            size={isMinimal ? "sm" : "default"}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    );
  }
);
ErrorState.displayName = "ErrorState";

/**
 * InlineErrorState - Compact error for inline display
 */
export const InlineErrorState = React.forwardRef<
  HTMLDivElement,
  Omit<ErrorStateProps, "variant">
>(({ className, message, onRetry, showIcon = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 p-4 text-sm",
      className
    )}
    {...props}
  >
    {showIcon && (
      <AlertCircle className="h-5 w-5 text-brand flex-shrink-0" />
    )}
    
    <p className="flex-1 text-slate-700">{message}</p>
    
    {onRetry && (
      <Button
        onClick={onRetry}
        variant="ghost"
        size="sm"
        className="flex-shrink-0 text-brand hover:text-brand-dark"
      >
        Retry
      </Button>
    )}
  </div>
));
InlineErrorState.displayName = "InlineErrorState";

/**
 * NetworkErrorState - Specialized error for network issues
 */
export const NetworkErrorState = React.forwardRef<
  HTMLDivElement,
  Omit<ErrorStateProps, "title" | "message">
>(({ onRetry, ...props }, ref) => (
  <ErrorState
    ref={ref}
    title="Connection issue"
    message="We're having trouble reaching our servers. Please check your internet connection and try again."
    onRetry={onRetry}
    {...props}
  />
));
NetworkErrorState.displayName = "NetworkErrorState";

/**
 * NotFoundErrorState - Specialized error for 404s
 */
export const NotFoundErrorState = React.forwardRef<
  HTMLDivElement,
  Omit<ErrorStateProps, "title" | "message" | "showIcon">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-center py-12 px-4", className)}
    {...props}
  >
    <div className="mb-4 text-6xl font-bold text-slate-200">404</div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">
      Page not found
    </h3>
    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Button asChild variant="default">
      <a href="/">Go home</a>
    </Button>
  </div>
));
NotFoundErrorState.displayName = "NotFoundErrorState";

