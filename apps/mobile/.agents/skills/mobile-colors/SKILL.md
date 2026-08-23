---
name: mobile-colors
description: OKLCH and Color mapping for React Native. Use when styling components, applying dark mode, defining NativeWind themes, or fixing contrast issues on mobile. Triggers on oklch, color, NativeWind, dark mode, contrast, theme.
---

# Mobile Color Usage

React Native and NativeWind handle colors differently than the web, especially concerning advanced color spaces like OKLCH.

## Quick Reference

| Category | When to use | Reference |
| --- | --- | --- |
| **Color Usage** | Using OKLCH, NativeWind theming, dark mode | [color-usage.md](color-usage.md) |

## Core Principles
1. **React Native Color Support**. Raw React Native `StyleSheet` objects do not fully support `oklch()` functions natively on all OS versions. NativeWind compiles these at build time when used as classes.
2. **NativeWind Colors**. Always apply colors via NativeWind classes (e.g. `text-blue-500`, `bg-black/10`) rather than inline styles to ensure dark mode and OKLCH compilation works correctly across both platforms.
