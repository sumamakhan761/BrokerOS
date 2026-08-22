---
name: mobile-layout
description: Layout engineering for React Native. Use when positioning elements, building grids, aligning items, handling safe areas, scrolling, or reviewing layout code. Triggers on Flexbox, flex-col, flex-row, SafeAreaView, ScrollView, FlatList, KeyboardAvoidingView, padding, margins, absolute positioning.
---

# Mobile Layouts

React Native uses Flexbox, but the defaults, constraints, and scrolling mechanics are completely different from the Web. Apply these principles when structuring any mobile screen.

## Quick Reference

| Category | When to use | Reference |
| --- | --- | --- |
| **Flexbox Differences** | Flex column vs row, gaps, absolute positioning | [flexbox-differences.md](flexbox-differences.md) |
| **Safe Areas & Scrolling** | Notches, FlatList vs ScrollView, performance | [safe-areas-and-scrolling.md](safe-areas-and-scrolling.md) |

## Core Principles
1. **Flex defaults to Column**. Writing `flex` does not make a row like it does on the web.
2. **Views do not scroll automatically**. A `<View>` that exceeds the screen height will just clip. You must use a scrolling container.
3. **No CSS Grid**. React Native does not support `display: grid`. You must use flex wrapping or `FlatList` columns.
