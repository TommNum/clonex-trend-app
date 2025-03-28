The application uses a synthwave-inspired color palette with these main colors:

Cerulean: #00B4D8
Aqua Green: #06D6A0
Light Pink: #FFC8DD
Dark Navy: #0F172A
Neon Purple: #9D4EDD
Typography
The app uses a combination of fonts:

- Inter (main body text)
- Syncopate (headings)
- Archivo Black (fallback for headings)

# System Instructions

## Style System Documentation

This document provides a comprehensive guide to the style system used in this application.

## Colors

### Theme Colors
- **Background**: `hsl(var(--background))`
- **Foreground**: `hsl(var(--foreground))`
- **Primary**: `hsl(var(--primary))`
- **Primary Foreground**: `hsl(var(--primary-foreground))`
- **Secondary**: `hsl(var(--secondary))`
- **Secondary Foreground**: `hsl(var(--secondary-foreground))`
- **Muted**: `hsl(var(--muted))`
- **Muted Foreground**: `hsl(var(--muted-foreground))`
- **Accent**: `hsl(var(--accent))`
- **Accent Foreground**: `hsl(var(--accent-foreground))`
- **Destructive**: `hsl(var(--destructive))`
- **Destructive Foreground**: `hsl(var(--destructive-foreground))`
- **Card**: `hsl(var(--card))`
- **Card Foreground**: `hsl(var(--card-foreground))`
- **Popover**: `hsl(var(--popover))`
- **Popover Foreground**: `hsl(var(--popover-foreground))`
- **Border**: `hsl(var(--border))`
- **Input**: `hsl(var(--input))`
- **Ring**: `hsl(var(--ring))`

### Synthwave Colors
- **Cerulean**: `#00B4D8`
- **Aqua Green**: `#06D6A0`
- **Light Pink**: `#FFC8DD`
- **Dark Navy**: `#0F172A`
- **Neon Purple**: `#9D4EDD`

### Sidebar Colors
- **Sidebar Background**: `hsl(var(--sidebar-background))`
- **Sidebar Foreground**: `hsl(var(--sidebar-foreground))`
- **Sidebar Primary**: `hsl(var(--sidebar-primary))`
- **Sidebar Primary Foreground**: `hsl(var(--sidebar-primary-foreground))`
- **Sidebar Accent**: `hsl(var(--sidebar-accent))`
- **Sidebar Accent Foreground**: `hsl(var(--sidebar-accent-foreground))`
- **Sidebar Border**: `hsl(var(--sidebar-border))`
- **Sidebar Ring**: `hsl(var(--sidebar-ring))`

## Typography

### Fonts
- **Headings**: `'Syncopate', sans-serif`
- **Body**: `'Inter', sans-serif`
- **Accent**: `'Archivo Black', sans-serif`

### Text Sizes
- **Heading 1**: `text-4xl`
- **Heading 2**: `text-3xl`
- **Heading 3**: `text-2xl`
- **Body Text**: `text-base`
- **Small Text**: `text-sm`

## Components

### Glass Cards
```css
.glass-card {
  @apply relative backdrop-blur-md bg-white/10 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 overflow-hidden;
}
```

### Buttons

#### Neon Button
```css
.neon-button {
  @apply px-4 py-2 rounded-md bg-cerulean text-white font-medium relative overflow-hidden shadow-[0_0_15px_rgba(0,180,216,0.5)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,180,216,0.8)];
}
```

#### Premium Button
```css
.premium-button {
  @apply px-4 py-2 rounded-md bg-gradient-to-r from-cerulean via-aqua-green to-light-pink text-white font-medium relative overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg;
}
```

#### Glass Button
```css
.glass-button {
  @apply px-4 py-2 rounded-md backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 text-white font-medium relative overflow-hidden shadow-md transition-all duration-300 hover:bg-white/20 dark:hover:bg-black/30;
}
```

#### Pill Button
```css
.pill {
  @apply inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cerulean/20 text-cerulean dark:text-cerulean font-medium text-sm transition-all duration-300 hover:bg-cerulean/30;
}
```

### Gradient Text
```css
.gradient-text {
  @apply text-transparent bg-clip-text bg-gradient-to-r from-cerulean via-aqua-green to-light-pink;
}
```

## Animations

### Keyframes
- **Accordion Down/Up**: For accordion component transitions
- **Fade In/Out**: For element entry/exit animations
- **Scale In/Out**: For element scaling animations
- **Slide In/Out Right**: For sliding elements horizontally
- **Pulse**: For pulsing effect (opacity changes)
- **Glow**: For glowing effect (box-shadow changes)
- **Rotate**: For rotation animations

### Animation Classes
- **animate-accordion-down**: `accordion-down 0.2s ease-out`
- **animate-accordion-up**: `accordion-up 0.2s ease-out`
- **animate-fade-in**: `fade-in 0.3s ease-out`
- **animate-fade-out**: `fade-out 0.3s ease-out`
- **animate-scale-in**: `scale-in 0.2s ease-out`
- **animate-scale-out**: `scale-out 0.2s ease-out`
- **animate-slide-in-right**: `slide-in-right 0.3s ease-out`
- **animate-slide-out-right**: `slide-out-right 0.3s ease-out`
- **animate-enter**: `fade-in 0.3s ease-out, scale-in 0.2s ease-out`
- **animate-exit**: `fade-out 0.3s ease-out, scale-out 0.2s ease-out`
- **animate-pulse**: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`
- **animate-glow**: `glow 2s infinite`
- **animate-rotate**: `rotate 1s linear infinite`

## Layout

### Container
- Center-aligned with customizable padding
- Responsive width adjustments

### Border Radius
- **lg**: `var(--radius)`
- **md**: `calc(var(--radius) - 2px)`
- **sm**: `calc(var(--radius) - 4px)`

## Usage Examples

To see examples of these styles in action, refer to the `StyleShowcase` component in the application.

## Utility Functions

### Class Name Merging
Use the `cn` utility function to combine Tailwind classes:

```typescript
import { cn } from "@/utils/cn";

// Example
<div className={cn("base-class", isActive && "active-class", className)}>
  Content
</div>
```

