# Spacing and Sizing

## NativeWind Type Scale
Define a small set of sizes (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`) and deviate from it as little as possible. Hard-coded `style={{ fontSize: 14 }}` breaks down at scale and violates design consistency.

## Line-Height by Role
- **Headings** need tighter line-height, around `1.1` to `1.2` (`leading-tight`). 
- **Body copy** needs `1.5` (`leading-normal`). 
- **Rule of thumb**: Tight line-height is for short text. Anything that wraps to three or more lines needs at least `1.4`.

## iOS Inputs at 16px
To maintain a premium feel and ensure touch targets remain large enough without looking unbalanced, keep `<TextInput>` text at `16px` (`text-base`). While React Native doesn't force pinch-to-zoom on inputs like Mobile Safari does, inputs smaller than 16px on mobile screens are ergonomically difficult to read and tap.

## Letter Spacing
NativeWind supports `tracking-tight` and `tracking-wide`.
Large headings often look better with slightly negative letter-spacing (`tracking-tight`). Small uppercase labels need positive letter-spacing (`tracking-widest`) so letters do not feel crowded. Body copy at reading sizes needs neither.
