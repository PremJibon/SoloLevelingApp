import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

export interface SystemTextProps extends TextProps {
  children: React.ReactNode;
  glow?: boolean;
  glowColor?: string;
  glowRadius?: number;
  className?: string;
}

export function SystemText({
  children,
  style,
  glow = true,
  glowColor = "rgba(0, 229, 255, 0.6)",
  glowRadius = 6,
  className = "",
  ...props
}: SystemTextProps) {
  return (
    <Text
      className={`text-white font-mono ${className}`}
      style={[
        glow && {
          textShadowColor: glowColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: glowRadius,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export default SystemText;
