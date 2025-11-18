# Design Guidelines: Flexible Flight Search Application

## Design Approach

**Selected Approach:** Design System-based with Material Design principles, enhanced with interaction patterns from Google Flights and Skyscanner for flight-specific components.

**Rationale:** This is a data-intensive productivity tool requiring clear information hierarchy, efficient data display, and intuitive filtering. Material Design provides robust patterns for complex forms and data tables while maintaining visual clarity.

**Key Design Principles:**
- Information clarity over visual flourish
- Efficient task completion through structured flows
- Responsive data visualization
- Consistent, predictable interactions

## Typography

**Font Stack:** Inter (via Google Fonts CDN) for entire application

**Hierarchy:**
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base font-normal (16px)
- Supporting Text: text-sm (14px)
- Data Labels: text-xs font-medium uppercase tracking-wide (12px)
- Price Display: text-2xl font-bold (24px)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, and 12 consistently
- Component padding: p-4 or p-6
- Section spacing: mb-8 or mb-12
- Card gaps: gap-4 or gap-6
- Form field spacing: space-y-4

**Grid Structure:**
- Main container: max-w-7xl mx-auto px-4
- Search criteria panel: max-w-md (sidebar or top panel)
- Results grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Full-width data tables for detailed flight information

## Component Library

### Navigation
- Top app bar with logo, search status indicator, and user actions
- Persistent search criteria summary (collapsible on mobile)
- Secondary navigation for "Active Searches", "Alerts", "Saved Flights"

### Search Configuration Panel
- Multi-section accordion layout for search criteria
- Budget input with range slider and numeric input
- Date preference selectors using chip groups:
  - Duration type (weekend, week, 2 weeks, custom)
  - Preferred days (Friday-Sunday, etc.)
  - Blackout dates calendar picker
- Destination flexibility controls (specific cities, regions, or "anywhere")
- Flight preferences: max stops, preferred airlines, time of day
- Large primary CTA button "Start Search" (h-12, full-width)

### Flight Results Cards
- Elevated cards (shadow-md) with hover state (shadow-lg)
- Card layout sections:
  - Airline logo and flight number (top-left)
  - Route visualization with departure/arrival times
  - Duration and stop indicators
  - Price prominently displayed (top-right)
  - Date range showing valid travel period
  - Action buttons: "View Details", "Set Alert"
- Compact list view option for power users

### Data Display
- Flight route timeline component showing departure → stops → arrival
- Price trend graph using simple line charts (Chart.js)
- Calendar heatmap showing price variations across 12 months
- Comparison table for side-by-side flight options

### Alerts & Notifications
- Alert configuration modal with:
  - Price threshold slider
  - Notification preferences (email frequency)
  - Active alert status indicator
- Toast notifications for new matches (bottom-right)
- Alert badge count on navigation

### Forms & Inputs
- Text inputs with floating labels
- Date pickers using native calendar interface
- Multi-select dropdowns for airports/airlines
- Range sliders for budget and duration
- Toggle switches for boolean preferences
- Inline validation with helpful error messages below fields

### Empty States
- Illustration + text for "No results found"
- Helpful suggestions for adjusting search criteria
- Onboarding state for first-time users with example searches

### Loading States
- Skeleton screens for flight cards during search
- Progress indicator showing search status ("Searching months 3-6 of 12...")
- Shimmer effect on loading cards

## Images

**Hero Section:** NOT APPLICABLE - This is a web application, not a marketing site. The interface opens directly to the search configuration panel.

**Supporting Images:**
- Airline logos (fetched from API or icon library)
- Small destination thumbnail images in flight cards (optional enhancement, not critical)
- Empty state illustrations (use undraw.co or similar)

## Critical Layout Patterns

**Main Application Structure:**
- Left sidebar (lg screens) or top panel (mobile/tablet) for search criteria
- Main content area for results grid/list
- Fixed header with navigation
- No hero section or marketing content

**Search Results Page:**
- Sticky filter bar at top with active filters as dismissible chips
- Sort controls (price, duration, departure time)
- Results displayed in responsive grid
- Pagination or infinite scroll for large result sets

**Flight Detail View:**
- Modal overlay or side panel showing complete itinerary
- Tabbed interface: Outbound, Return, Price History, Set Alert
- Clear CTA buttons for booking or setting alerts

**Responsive Behavior:**
- Mobile: Single column, collapsible search panel
- Tablet: Two-column results grid
- Desktop: Sidebar + three-column results grid

## Accessibility & Interaction

- All interactive elements have min-height of h-10 (40px)
- Keyboard navigation throughout
- Focus states using ring-2 ring-offset-2
- ARIA labels for icon-only buttons
- Clear hover states for all clickable elements
- Consistent form field styling across all inputs