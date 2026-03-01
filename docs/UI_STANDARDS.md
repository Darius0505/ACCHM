# UI & UX Standards

ACCHM follows a **Classic Accounting** aesthetic: high density, clear separation of information, and a professional dark theme inspired by Feng Shui principles.

## 1. Visual Identity (Feng Shui Colors)

The design system uses "Mệnh Hỏa" (Fire Element) as the primary base color to symbolize energy and prosperity.

### Color Palette
- **Primary (Fire)**:
  - Light Mode: `#D2604C` (Warm Coral)
  - Dark Mode: `#F97316` (Vivid Orange)
- **Status Colors**:
  - Success: `#22C55E` (Green)
  - Warning: `#F59E0B` (Amber)
  - Danger: `#EF4444` (Red)
- **Action Buttons**:
  - **Save**: Primary Fire Color
  - **New**: Navy Blue (Kim/Thủy compatibility)
  - **Copy**: Indigo (Mộc synergy)

---

## 2. Layout & Density

- **Density**: "Compact" is the default. Accounting forms require maximum information visibility with minimal scrolling.
- **Master-Detail Flow**:
  - General Info (Top Left)
  - Voucher Info (Top Right - Number, Date, Status)
  - Accounting Grid (Bottom - Full width)

---

## 3. Component Standards

### AG Grid (The Accounting Grid)
All accounting tables must use the `DynamicAccountingGrid` component.
- **Theme**: `ag-theme-alpine-acchm` (Custom styling).
- **Behavior**:
  - `stopEditingWhenCellsLoseFocus`: `true`
  - Columns should use `numberCoercion` for amounts.
  - Required columns: Debit Account, Credit Account, Amount.

### Form Toolbar
Use `SystemVoucherToolbar` for all voucher forms.
- Buttons should be ordered: **Save, New, Print, Copy | Close**.
- The **Save** button must be the most vibrant (Vivid Orange/Red).

---

## 4. Typography
- **Primary Font**: `Inter` (Sans-serif) for tabular data.
- **Hierarchy**: Use `SemiBold` for header labels and `Regular` for data entries.

---

## 5. Dark Mode
The dark mode is optimized for "Deep Slate" backgrounds (`#0F172A`) with high-contrast active elements. Users should find it easy to work for long hours without eye strain.
