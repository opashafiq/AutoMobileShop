# UI Specification: Excel Bulk Import Component (`ItemBulkImportModal`)

## 1. Goal & Context
Implement a multi-step modal or drawer component in React that allows users to bulk import itemmaster "MASTER DATA -> Item Master" records from an Excel (`.xlsx`/`.xls`) or `.csv` file. 
The component parses the file client-side using `xlsx` (SheetJS), maps columns, allows pre-submission previewing and editing, and sends a validated JSON payload to the ASP.NET Core API endpoint `POST api/ItemMaster/bulk-import`.

---

## 2. Dependencies
- **Data Parsing:** `xlsx` (SheetJS)
- **Icons:** `lucide-react` (or existing project icons: Upload, Check, AlertTriangle, Trash2, Edit)
- **HTTP Client:** Follow the one used in the project.

---

## 3. Workflow Steps & State Machine

The component operates as a 4-step wizard within a single modal:

### Step 1: File Upload & Configuration
- **UI Elements:**
  - File Dropzone (accepts `.xlsx`, `.xls`, `.csv`).
  - Button to download sample `.xlsx` template.
  - Option radio group for import strategy:
    - `skipErrors = false` (Strict: Reject whole batch on error)
    - `skipErrors = true` (Permissive: Import valid rows only)
- **Action:** On file drop/selection, parse array buffer to JSON array of objects using `xlsx`. Automatically transition to **Step 2**.

### Step 2: Column Mapping
- **UI Elements:**
  - Table mapping user's Excel headers to system DTO keys:
    - System Fields: `item_code` (Required), `item_brand` (Required) etc.
    - Dropdowns listing detected Excel headers.
- **Action:** User clicks "Continue to Preview". Map raw data keys to DTO keys based on selections. Transition to **Step 3**.

### Step 3: Interactive Preview & Validation Grid
- **UI Elements:**
  - Summary badges: Total rows, Valid rows (green), Invalid rows (red).
  - Data grid displaying mapped rows.
  - Cell validation rules (highlight invalid cells in red with tooltips):
    - `item_brand`: Cannot be empty.
    - `item_code`: Must be a valid non-negative number (`>= 0`).
  - In-grid editing: Allow double-clicking/editing cells or deleting invalid rows directly from the table.
- **Action:** "Import [X] Items" button triggers API request.

### Step 4: Import Summary Report
- **UI Elements:**
  - Success message displaying counts (`successCount`, `errorCount`).
  - List of failed row messages returned from backend (if any).
  - Button: "Close & Refresh Table".

---

## 4. API Integration Details

- **Endpoint:** `POST /api/ItemMaster/bulk-import?skipErrors={boolean}`
- **Request Payload Structure:**
```json
[
{
  "id": 0,
  "tbim_ItemCategoryId": 11,
  "tbim_Size": "235-50-172",
  "tbim_Brand": "CELIMO SALIENT CS580 96W SL TEST 2",
  "tbim_Series": null,
  "tbim_Bolt": null,
  "tbim_HoleS": null,
  "tbim_Zone": "N 31",
  "tbim_Qty": 82,
  "tbim_QtyOp": 82,
  "tbim_Code": 1052,
  "tbim_CodeTOT": 4312.12,
  "tbim_DistributorId": 134,
  "tbim_OURP": 532.89,
  "tbim_LocationId": 1,
  "tbim_ThrashDate": null,
  "userName": "Admin",
  "setDate": "2026-03-03T09:33:00"
},
{
  "id": 0,
  "tbim_ItemCategoryId": 11,
  "tbim_Size": "235-50-173",
  "tbim_Brand": "CELIMO SALIENT CS580 96W SL TEST 3",
  "tbim_Series": null,
  "tbim_Bolt": null,
  "tbim_HoleS": null,
  "tbim_Zone": "N 33",
  "tbim_Qty": 83,
  "tbim_QtyOp": 83,
  "tbim_Code": 1053,
  "tbim_CodeTOT": 4313.12,
  "tbim_DistributorId": 134,
  "tbim_OURP": 533.89,
  "tbim_LocationId": 1,
  "tbim_ThrashDate": null,
  "userName": "Admin",
  "setDate": "2026-03-03T09:33:00"
}
]

```

## 5. Excel Column to DTO Mapping

Excel Column Name | DTO Field Name | Remarks
Category | tbim_ItemCategoryId | From the Excel value you have to map corresponding Category id. You are already getting the Category Key-Value combination from the endpoint: /api/Departments
Size | tbim_Size | 
Brand | tbim_Brand | 
Qty | tbim_Qty | 
Holes | tbim_HoleS | 
Zone | tbim_Zone | 
Series | tbim_Series | 
Bolt | tbim_Bolt | 
Code | tbim_Code | 
Code TOT | tbim_CodeTOT | 
OURP | tbim_OURP | 
OURP TOT | tbim_OURP | 
Distributor | tbim_DistributorId | From the Excel value you have to map corresponding Distributor id. You are already getting the Distributor Key-Value combination from the endpoint: /api/Distributors. Allow null value in this Field.

## 7. tbim_LocationId will be the LocationId of the Logged in user.

## 6. Sample Excel file is given in:
   \agent-guides\prompts\INVENTORY_UPLOAD.xlsx
















