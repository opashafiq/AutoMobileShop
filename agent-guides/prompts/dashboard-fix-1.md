You are redesigning an analytics dashboard for "Apollo Tire & Wheel," a tire shop's
internal sales/inventory dashboard. Improve visual polish and data clarity without
changing the underlying data or layout structure (KPI cards, sales trends, payment
method breakdown, top products/customers/brand tables, invoices, stock summary,
insights section).

Apply these changes:

1. ICONOGRAPHY & COLOR
   - Replace the current mismatched colored-square icons on KPI cards with a single
     consistent accent color (one primary brand color + one neutral gray), using
     semantically appropriate icons (dollar sign for sales, receipt for invoices,
     people icon for customers, etc.).
   - Unify chart color palettes across all bar/donut charts — use the same categorical
     color sequence everywhere instead of ad hoc colors per chart.

2. EMPTY / ZERO STATES
   - Design a clear, intentional "no data" or "$0.00" state for KPI cards and tables
     (e.g., Outstanding Invoices, Gross Profit) so they don't look like rendering bugs.
   - Fix the Sales Heatmap color scale so low-but-nonzero values remain visibly
     distinguishable from true zero/no-data cells.

3. TABLES
   - Right-align all numeric and currency columns; left-align text columns.
   - Split any combined "Name / Phone" style columns into separate columns.
   - Remove horizontal scrollbars inside cards by trimming/hiding low-priority columns
     (e.g., move phone number to a row-detail expansion instead of the main table).
   - Add clear units to ambiguous headers (e.g., "Share %" instead of "Share").
   - Verify and fix currency formatting on the Dead Stock table — values like
     "$10,053,400.00" for a single tire SKU should be audited as a likely
     unit-price/quantity multiplication or decimal error before display.
   - Add color-coded severity indicators to the Low Stock list/table (e.g., red for
     critical, amber for low) rather than uniform styling for all rows.
   - Sort indicators (arrows) should be visible on sortable columns even when not currently the sort key, so users know they can  click.

4. CHART VS. TABLE DECISIONS
   - Convert "Low Stock" from a plain list into a compact horizontal bar or dot-strip
     showing remaining units, color-coded by severity.
   - Add an inline mini-bar or sparkline next to the "Share %" column in Top 10
     Products by Value to visually reinforce the ranking.
   - Simplify the "Collection by Payment Method" donut into a horizontal bar if there
     are only 1-2 meaningfully-sized categories; reserve donuts for 3+ segments.
   - Resize the "Top Vehicle Makes" chart container to match actual data volume
     (currently large empty space below 2 bars) or extend it to show more makes.

5. CHARTS
   - Investigate and either fix or annotate the sharp drop-off in the Sales Trends
     chart after the most recent month, since an unexplained cliff reads as a data
     bug to viewers.
   - Ensure all bar charts are sorted descending by value and have visible axis
     gridlines/labels.
   - Enlarge or redesign the Tire Positions diagram with clearer front/rear/left/right
     labeling, ideally using a simple car-outline SVG.

6. CONSISTENCY PASS
   - Standardize header casing (pick Title Case or sentence case, apply everywhere).
   - Standardize card padding, corner radius, and shadow depth across all cards on
     all four sections of the dashboard.
   - Confirm currency and percentage formatting (decimal places, comma separators,
     +/- sign color coding) is identical across every card and table.

Do not alter the underlying data values except where flagged as likely formatting/
calculation bugs (Dead Stock $ values, Sales Trends cliff) — flag those for review
rather than silently changing them.