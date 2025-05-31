# CHIDI Mobile UI Style Guide

## 1. Color Palette

### Primary Colors
- **CHIDI Forest**: #1A4A3A
  - RGB: 26, 74, 58
  - CMYK: 65%, 0%, 22%, 71%
  - Usage: Primary brand color, main navigation, key CTAs
- **Pure White**: #FFFFFF
  - RGB: 255, 255, 255
  - CMYK: 0%, 0%, 0%, 0%
  - Usage: Primary backgrounds, card surfaces, clean UI elements

### Secondary Colors
- **Soft Sage**: #E8F2ED
  - RGB: 232, 242, 237
  - CMYK: 4%, 0%, 2%, 5%
  - Usage: Subtle background tints, inactive states, gentle highlights
- **Tech Gray**: #F8F9FA
  - RGB: 248, 249, 250
  - CMYK: 1%, 0%, 0%, 2%
  - Usage: Screen backgrounds, section dividers, neutral zones

### Accent Colors - Nature Palette
- **Fresh Mint**: #10D9A0
  - RGB: 16, 217, 160
  - CMYK: 93%, 0%, 26%, 15%
  - Usage: Success states, positive metrics, progress indicators
- **Sky Blue**: #0EA5E9
  - RGB: 14, 165, 233
  - CMYK: 94%, 29%, 0%, 9%
  - Usage: Interactive elements, links, information states
- **Sunset Orange**: #F59E0B
  - RGB: 245, 158, 11
  - CMYK: 0%, 36%, 95%, 4%
  - Usage: Warning states, attention-grabbing elements
- **Coral Pink**: #F472B6
  - RGB: 244, 114, 182
  - CMYK: 0%, 53%, 25%, 4%
  - Usage: Special features, creative elements, playful accents

### Functional Colors
- **Alert Red**: #EF4444
  - RGB: 239, 68, 68
  - CMYK: 0%, 72%, 72%, 6%
  - Usage: Error states, destructive actions, urgent notifications
- **Charcoal**: #1F2937
  - RGB: 31, 41, 55
  - CMYK: 44%, 25%, 0%, 78%
  - Usage: Primary text, headers, high-contrast elements
- **Slate Gray**: #64748B
  - RGB: 100, 116, 139
  - CMYK: 28%, 17%, 0%, 45%
  - Usage: Secondary text, labels, subtle information
- **Light Border**: #E2E8F0
  - RGB: 226, 232, 240
  - CMYK: 6%, 3%, 0%, 6%
  - Usage: Borders, dividers, subtle separations

### Color Usage Guidelines
- Maintain minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text
- Use CHIDI Forest as the primary brand anchor, applied sparingly for maximum impact
- Nature accents should feel vibrant but not overwhelming - use for key interactions and feedback
- White space dominates to create the "techy white" feel with nature colors as strategic punctuation

## 2. Typography

### Font Family
- **Primary**: Inter (Modern, clean, tech-forward)
- **iOS Fallback**: -apple-system, BlinkMacSystemFont, San Francisco
- **Android Fallback**: Roboto, "Helvetica Neue", Arial, sans-serif
- **Web Fallback**: system-ui, sans-serif

### Text Hierarchy

#### Display (Hero Text)
- **Font Size**: 36px / 2.25rem
- **Font Weight**: Bold (700)
- **Line Height**: 44px / 2.75rem
- **Letter Spacing**: -0.02em
- **Color**: Charcoal (#1F2937)
- **Usage**: Onboarding headlines, major feature introductions

#### Heading 1
- **Font Size**: 28px / 1.75rem
- **Font Weight**: Semibold (600)
- **Line Height**: 36px / 2.25rem
- **Letter Spacing**: -0.01em
- **Color**: Charcoal (#1F2937)
- **Usage**: Screen titles, primary section headers

#### Heading 2
- **Font Size**: 20px / 1.25rem
- **Font Weight**: Semibold (600)
- **Line Height**: 28px / 1.75rem
- **Color**: Charcoal (#1F2937)
- **Usage**: Subsection titles, card headers

#### Body Large
- **Font Size**: 18px / 1.125rem
- **Font Weight**: Regular (400)
- **Line Height**: 28px / 1.75rem
- **Color**: Charcoal (#1F2937) or Slate Gray (#64748B)
- **Usage**: Important descriptions, primary content

#### Body Regular
- **Font Size**: 16px / 1rem
- **Font Weight**: Regular (400)
- **Line Height**: 24px / 1.5rem
- **Color**: Charcoal (#1F2937) or Slate Gray (#64748B)
- **Usage**: Standard body text, list items

#### Caption
- **Font Size**: 14px / 0.875rem
- **Font Weight**: Medium (500)
- **Line Height**: 20px / 1.25rem
- **Color**: Slate Gray (#64748B)
- **Usage**: Form labels, metadata, secondary information

#### Small Text
- **Font Size**: 12px / 0.75rem
- **Font Weight**: Regular (400)
- **Line Height**: 16px / 1rem
- **Color**: Slate Gray (#64748B)
- **Usage**: Timestamps, fine print, status indicators

## 3. Spacing and Layout

### Grid System
- **Base Unit**: 4px (0.25rem)
- **Primary Spacing Scale**: 8px, 12px, 16px, 24px, 32px, 48px, 64px
- **Container Max Width**: 428px (mobile-first design)
- **Screen Padding**: 20px horizontal minimum

### Spacing Guidelines
- **Component Padding**: 16px (cards), 20px (screens)
- **Element Spacing**: 12px (related), 24px (sections), 32px (major divisions)
- **Text Spacing**: 8px (labels to inputs), 16px (paragraphs)
- **Icon Spacing**: 12px from adjacent text

### Layout Principles
- **Generous White Space**: Minimum 24px between major content blocks
- **Breathing Room**: 16px minimum around clickable elements
- **Visual Hierarchy**: Use space, not just color, to create importance
- **Content-First**: Prioritize readability over decoration

## 4. Buttons and Interactive Elements

### Primary Button
- **Background**: CHIDI Forest (#1A4A3A)
- **Text Color**: Pure White (#FFFFFF)
- **Font**: 16px, Medium (500)
- **Padding**: 14px vertical, 24px horizontal
- **Border Radius**: 12px
- **Minimum Height**: 48px
- **Shadow**: 0px 2px 8px rgba(26, 74, 58, 0.15)

### Secondary Button
- **Background**: Pure White (#FFFFFF)
- **Text Color**: CHIDI Forest (#1A4A3A)
- **Border**: 1.5px solid CHIDI Forest (#1A4A3A)
- **Font**: 16px, Medium (500)
- **Padding**: 14px vertical, 24px horizontal
- **Border Radius**: 12px
- **Minimum Height**: 48px

### Accent Buttons (Nature Colors)
- **Fresh Mint Action**: Background #10D9A0, White text
- **Sky Blue Link**: Background #0EA5E9, White text
- **Sunset Orange Warning**: Background #F59E0B, White text
- All follow primary button styling with color variations

### Floating Action Button
- **Background**: Fresh Mint (#10D9A0)
- **Icon Color**: White (#FFFFFF)
- **Size**: 56px diameter
- **Border Radius**: 28px (circular)
- **Shadow**: 0px 4px 16px rgba(16, 217, 160, 0.3)
- **Icon Size**: 24px

### Status Badges
- **Success (Sent)**: Background Fresh Mint (#10D9A0), White text
- **Draft**: Background Tech Gray (#F8F9FA), Slate Gray text (#64748B)
- **Active**: Background Sky Blue (#0EA5E9), White text
- **Warning**: Background Sunset Orange (#F59E0B), White text
- **Padding**: 6px horizontal, 4px vertical
- **Border Radius**: 16px (pill shape)
- **Font**: 12px, Medium (500)

### Button States
- **Hover/Focus**: 95% opacity, subtle scale (1.02x)
- **Active/Pressed**: 90% opacity, slight inset shadow
- **Disabled**: 40% opacity, no interaction
- **Loading**: Spinner animation, maintained dimensions

## 5. Form Elements

### Input Fields
- **Background**: Pure White (#FFFFFF)
- **Border**: 1px solid Light Border (#E2E8F0)
- **Border Radius**: 8px
- **Padding**: 14px horizontal, 12px vertical
- **Font**: 16px Regular
- **Placeholder Color**: Slate Gray (#64748B)
- **Focus State**: Border Sky Blue (#0EA5E9), subtle glow

### Text Areas
- **Minimum Height**: 88px
- **Follows input field styling**
- **Resize**: Vertical only on web

### Select Dropdowns
- **Chevron Icon**: Slate Gray (#64748B)
- **Active State**: Sky Blue accent
- **Follows input field base styling**

### Checkboxes & Radio Buttons
- **Unchecked**: Light Border (#E2E8F0)
- **Checked**: CHIDI Forest (#1A4A3A) with white checkmark
- **Size**: 20px × 20px
- **Border Radius**: 4px (checkbox), 50% (radio)

## 6. Cards and Containers

### Primary Cards
- **Background**: Pure White (#FFFFFF)
- **Border Radius**: 16px
- **Shadow**: 0px 2px 12px rgba(0, 0, 0, 0.04)
- **Padding**: 20px
- **Border**: Optional 1px Light Border (#E2E8F0) for subtle definition

### Data Cards (Metrics/Reports)
- **Background**: Pure White (#FFFFFF)
- **Border**: 1px solid Light Border (#E2E8F0)
- **Border Radius**: 12px
- **Padding**: 16px
- **Header**: Medium text, Charcoal color
- **Accent**: Thin 3px border-left in relevant nature color

### List Items
- **Background**: Pure White (#FFFFFF)
- **Padding**: 16px horizontal, 14px vertical
- **Border Bottom**: 1px Light Border (#E2E8F0)
- **Active State**: Soft Sage background (#E8F2ED)
- **Minimum Height**: 56px

## 7. Icons and Visual Elements

### Icon Style
- **Style**: Outline/Linear (consistent with Inter font aesthetic)
- **Stroke Width**: 1.5px
- **Sizes**: 16px (small), 20px (regular), 24px (large), 32px (feature)
- **Color**: Slate Gray (#64748B) default, nature colors for active states

### Progress Indicators
- **Track**: Tech Gray (#F8F9FA)
- **Fill**: Fresh Mint (#10D9A0) for success, Sky Blue (#0EA5E9) for in-progress
- **Height**: 8px
- **Border Radius**: 4px
- **Animation**: Smooth transition, 300ms ease

### Charts and Data Visualization
- **Primary**: CHIDI Forest (#1A4A3A)
- **Secondary**: Fresh Mint (#10D9A0)
- **Tertiary**: Sky Blue (#0EA5E9)
- **Additional**: Coral Pink (#F472B6), Sunset Orange (#F59E0B)
- **Grid Lines**: Light Border (#E2E8F0)
- **Background**: Pure White or Tech Gray

### Brand Elements
- **CHIDI Logo**: Circular 'C' mark in Charcoal (#1F2937)
- **Logo Spacing**: Minimum 16px clear space on all sides
- **Usage**: App icon, loading screens, brand moments

## 8. Navigation and Structure

### Tab Bar (Bottom Navigation)
- **Background**: Pure White (#FFFFFF) with subtle shadow
- **Height**: 80px (including safe area)
- **Active State**: CHIDI Forest icon (#1A4A3A) with Fresh Mint accent
- **Inactive State**: Slate Gray (#64748B)
- **Badge**: Coral Pink (#F472B6) for notifications

### Header/Navigation Bar
- **Background**: Pure White (#FFFFFF)
- **Height**: Standard platform height + safe area
- **Title**: Heading 1 style, center or left-aligned per platform
- **Back Button**: CHIDI Forest (#1A4A3A)
- **Action Buttons**: Sky Blue (#0EA5E9)

### Search Bars
- **Background**: Tech Gray (#F8F9FA)
- **Border**: None (filled style)
- **Border Radius**: 24px (pill shape)
- **Padding**: 12px horizontal
- **Placeholder**: Slate Gray (#64748B)
- **Icon**: Search icon, Slate Gray

## 9. Motion and Animation

### Timing Functions
- **Standard**: ease-out (0.25s) for most transitions
- **Micro-interactions**: 150ms for immediate feedback
- **Page Transitions**: 350ms for spatial relationships
- **Data Loading**: Smooth progress animations

### Interaction Feedback
- **Button Press**: Slight scale down (0.98x) with opacity change
- **Card Tap**: Subtle lift with increased shadow
- **Swipe Actions**: Reveal actions with spring animation
- **Pull to Refresh**: Organic, bouncy feel

### Loading States
- **Skeleton Screens**: Tech Gray (#F8F9FA) backgrounds with subtle shimmer
- **Spinners**: CHIDI Forest or Fresh Mint depending on context
- **Progress Bars**: Smooth, realistic progress indication

## 10. Accessibility and Responsive Design

### Contrast Requirements
- **Normal Text**: Minimum 4.5:1 ratio
- **Large Text**: Minimum 3:1 ratio
- **Interactive Elements**: Minimum 3:1 ratio
- **All combinations tested and compliant**

### Touch Targets
- **Minimum Size**: 44px × 44px
- **Comfortable Spacing**: 8px minimum between targets
- **Thumb-Friendly**: Important actions within easy reach

### Text Scaling
- **Support**: iOS Dynamic Type, Android font scaling
- **Limits**: Maintain layout integrity up to 200% scaling
- **Testing**: All text sizes verified for readability

### Dark Mode Considerations
- **Strategy**: Phase 2 implementation
- **Preparation**: Color system designed for easy dark mode adaptation
- **Key Changes**: Backgrounds become dark, maintain nature color vibrancy

## 11. Implementation Guidelines

### CSS Custom Properties (Web)
```css
:root {
  --color-forest: #1A4A3A;
  --color-white: #FFFFFF;
  --color-sage: #E8F2ED;
  --color-tech-gray: #F8F9FA;
  --color-mint: #10D9A0;
  --color-sky: #0EA5E9;
  --color-sunset: #F59E0B;
  --color-coral: #F472B6;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
}
```

### Platform-Specific Notes
- **iOS**: Embrace native navigation patterns, use SF Symbols where appropriate
- **Android**: Follow Material Design principles while maintaining brand identity
- **PWA**: Ensure touch targets are adequate, optimize for various screen sizes

### Performance Considerations
- **Images**: Use WebP format with fallbacks
- **Animations**: Use hardware acceleration (transform/opacity)
- **Colors**: Limit gradient usage for performance
- **Bundle Size**: Tree-shake unused components

## 12. Brand Voice and Personality

### Visual Personality
- **Professional yet Approachable**: Clean lines with warm nature accents
- **Trustworthy**: Consistent patterns and reliable interactions
- **Innovative**: Thoughtful use of space and subtle animations
- **Growth-Oriented**: Fresh, optimistic color choices

### Content Tone
- **Conversational**: Friendly but not overly casual
- **Confident**: Clear, direct communication
- **Supportive**: Helpful guidance without being patronizing
- **Efficient**: Respect user's time and goals
