// components/themes/index.ts
import DefaultTheme from "./DefaultTheme";
import BlossomTheme from "./BlossomTheme";

export const THEME_MAP: Record<string, React.ComponentType<{ profile: any }>> = {
  default: DefaultTheme,
  blossom: BlossomTheme,
  // Add new themes here:
  // cyber: CyberTheme,
};