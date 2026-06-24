# Column Funnel Filtering Guide

## Overview

Column funnel filtering allows users to filter table data directly from column headers. Each column can be filtered using either text input (for free-form searching) or a dropdown selector (for categorical data).

## Features

- **Smart Filter Detection**: Automatically determines whether to show a text input or dropdown list based on the number of unique values in the column
- **Text Filtering**: Partial string matching for columns with many unique values
- **Select Filtering**: Checkbox list for columns with a limited number of unique values (≤20)
- **Global Toggle**: Enable/disable filtering for the entire table via the `enableColumnFilters` prop
- **Per-Column Control**: Individually enable/disable filtering for specific columns
- **Clear Filters**: One-click button to clear all active filters

## Usage

### Enable/Disable Filtering on TaxIdTable

```tsx
// Enable filtering (default)
<TaxIdTable enableColumnFilters={true} />

// Disable filtering
<TaxIdTable enableColumnFilters={false} />
```

### Filtering Behavior

1. **Text Columns** (many unique values):
   - Shows a text input field
   - Supports partial matching (case-insensitive)
   - Example: Type "ABC" to match "ABC Company", "My ABC Corp", etc.

2. **Select Columns** (≤20 unique values):
   - Shows a checkbox list with unique column values
   - "Select All" and "Deselect All" buttons for convenience
   - Supports multiple simultaneous selections

3. **Active Filter Indicator**:
   - Funnel icon appears next to the sort icon in column headers
   - Icon is outlined (gray) when no filter is active
   - Icon is solid (blue) when filter is active

### Clear All Filters

When any filters are active, a "Clear Filters" button appears in the toolbar. Click it to reset all column filters.

## Implementation Details

### Related Files

- **Main Component**: [src/app/components/react-tables/master/taxid-datatable/index.tsx](src/app/components/react-tables/master/taxid-datatable/index.tsx)
- **Filter Input Component**: `src/app/components/react-tables/shared/ColumnFilterInput.tsx`
- **Filter Utilities**: `src/app/components/react-tables/shared/columnFilterUtils.ts`

### Filter Functions

**detectFilterType(data)**: Analyzes column data and returns `'text'` or `'select'`
- Returns `'select'` if ≤20 unique values
- Returns `'text'` for larger datasets

**getUniqueValues(data)**: Extracts and sorts unique values from column data

**textFilter(value, filterValue)**: Case-insensitive substring matching

**selectFilter(value, filterValues)**: Checks if value is in the selected array

### Column Filter State

```tsx
const [columnFilters, setColumnFilters] = useState<Record<string, string | string[] | null>>({})
```

- **Key**: Column accessor name (e.g., `'tbti_ComName'`)
- **Value**: 
  - `string` for text filters
  - `string[]` for select filters
  - `null` for no filter

## Extending to Other Tables

To add funnel filtering to another React Table component:

1. Import the utilities and components:
```tsx
import ColumnFilterInput from '@/app/components/react-tables/shared/ColumnFilterInput'
import { textFilter, selectFilter } from '@/app/components/react-tables/shared/columnFilterUtils'
```

2. Add column filter state:
```tsx
const [columnFilters, setColumnFilters] = useState<Record<string, string | string[] | null>>({})
```

3. Add filter application logic similar to `applyColumnFilters()` in TaxIdTable

4. Update header rendering to include `<ColumnFilterInput />` components

5. Wrap TaxIdTable usage with `enableColumnFilters={true/false}` prop

## Future Enhancements

- Date range filtering for date columns
- Numeric range filtering for numeric columns
- Filter badge count (e.g., "Company (3 filtered)")
- Filter persistence to localStorage
- Advanced filter operators (AND, OR, NOT)

