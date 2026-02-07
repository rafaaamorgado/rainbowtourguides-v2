"use client";

import * as React from "react";
import {
  Switch as HeroSwitch,
  SwitchProps as HeroSwitchProps,
} from "@heroui/react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<HeroSwitchProps, "isSelected" | "defaultSelected" | "onValueChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (value: boolean) => void;
}

/**
 * Project switch wrapper powered by HeroUI.
 * Keeps the familiar `checked` / `onCheckedChange` API.
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    { checked, defaultChecked, onCheckedChange, className, classNames, ...props },
    ref
  ) => {
    return (
      <HeroSwitch
        ref={ref as any}
        isSelected={checked}
        defaultSelected={defaultChecked}
        onValueChange={onCheckedChange}
        classNames={{
          base: cn("flex items-center", className),
          wrapper: "data-[selected=true]:bg-primary",
          thumb: "bg-background shadow-sm",
          ...classNames,
        }}
        {...props}
      />
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
