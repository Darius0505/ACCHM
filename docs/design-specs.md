# Design Specifications - ACCHM ERP

> Design System cho hệ thống kế toán ACCHM. Chuẩn cho tất cả các form nhập liệu.

---

## 🎨 Color Palette

### Light Mode
| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary | `#5E6AD2` | `--primary` | Buttons, links, accent |
| Primary Hover | `#4F5BBE` | `--primary-hover` | Hover states |
| Background | `#F7F8FA` | `--bg` | Page background |
| Surface | `#FFFFFF` | `--surface` | Cards, modals |
| Border | `#E2E4EA` | `--border` | Input borders, dividers |
| Text Primary | `#1A1D2D` | `--text-primary` | Main text |
| Text Secondary | `#5F6B7C` | `--text-secondary` | Labels, hints |
| Text Muted | `#8E99A8` | `--text-muted` | Placeholders |

### Dark Mode
| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary | `#818CF8` | `--primary` | Buttons, links (brighter) |
| Primary Hover | `#6366F1` | `--primary-hover` | Hover states |
| Background | `#0F172A` | `--bg` | Page background |
| Surface | `#1E293B` | `--surface` | Cards, modals |
| Border | `#334155` | `--border` | Input borders, dividers |
| Text Primary | `#F1F5F9` | `--text-primary` | Main text |
| Text Secondary | `#94A3B8` | `--text-secondary` | Labels, hints |
| Text Muted | `#64748B` | `--text-muted` | Placeholders |

### Status Colors (Both modes)
| Status | Light BG | Light Text | Dark BG | Dark Text |
|--------|----------|------------|---------|-----------|
| Success (Đã ghi sổ) | `#DCFCE7` | `#15803D` | `#14532D` | `#4ADE80` |
| Warning (Chưa ghi sổ) | `#FEF3C7` | `#B45309` | `#713F12` | `#FBBF24` |
| Danger | `#FEE2E2` | `#DC2626` | `#7F1D1D` | `#F87171` |

---

## 📝 Typography

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Page Title | Inter | 14px | 700 | 1.2 |
| Section Title | Inter | 11px | 700 | 1.3 |
| Form Label | Inter | 12px | 500 | 1.4 |
| Form Input | Inter | 13px | 400 | 1.5 |
| Grid Header | Inter | 11px | 700 | 1.4 |
| Grid Cell | Inter | 13px | 400 | 1.5 |
| Button | Inter | 12px | 600 | 1.0 |
| Badge | Inter | 11px | 700 | 1.0 |

---

## 📐 Spacing System

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Icon gaps, tight spacing |
| sm | 8px | Form row gaps |
| md | 16px | Section padding |
| lg | 20px | Card padding |
| xl | 24px | Section gaps |

---

## 🔲 Border Radius

| Name | Value | Usage |
|------|-------|-------|
| none | 0px | Grid cells |
| sm | 4px | Input fields, small buttons |
| md | 6px | Cards, panels |
| lg | 8px | Modals |
| full | 9999px | Status badges, pills |

---

## 🌫️ Shadows

| Name | Light Mode | Dark Mode |
|------|------------|-----------|
| subtle | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` |
| card | `0 1px 3px rgba(0,0,0,0.08)` | `0 2px 4px rgba(0,0,0,0.4)` |
| floating | `0 4px 12px rgba(0,0,0,0.12)` | `0 4px 12px rgba(0,0,0,0.5)` |

---

## 📱 Layout Structure

### Master-Detail Pattern
```
┌─────────────────────────────────────────────────────────────┐
│ TOOLBAR (h-12)                                              │
│ [☰] Title  │ [+Thêm mới] [💾Lưu] [🖨️In] │ [Status Badge] ⚙️│
├───────────┬─────────────────────────────────────────────────┤
│ SIDEBAR   │ MAIN WORKSPACE                                  │
│ (w-64)    │                                                 │
│           │ ┌───────────────────┬──────────────┐            │
│ 🔍 Search │ │ THÔNG TIN CHUNG   │ CHỨNG TỪ     │            │
│           │ │ (flex-1)          │ (w-80)       │            │
│ ┌───────┐ │ ├───────────────────┴──────────────┤            │
│ │ Item  │ │ │ CHI TIẾT HẠCH TOÁN (Grid)        │            │
│ ├───────┤ │ │ Diễn giải │ TK Nợ │ TK Có │ Số tiền           │
│ │ Item  │ │ ├───────────────────────────────────┤            │
│ ├───────┤ │ │ FOOTER                            │            │
│ │ Item  │ │ │ Tiền bằng chữ...    Tổng: X VND  │            │
│ └───────┘ │ └───────────────────────────────────┘            │
└───────────┴─────────────────────────────────────────────────┘
```

### Responsive Breakpoints
| Name | Width | Sidebar |
|------|-------|---------|
| mobile | < 768px | Hidden |
| tablet | 768px - 1024px | Collapsible |
| desktop | > 1024px | Always visible |

---

## ✨ Interactions

### Focus States
- Input focus: `ring-1 ring-primary/20 border-primary`
- Button focus: `ring-2 ring-primary ring-offset-2`

### Hover Effects
- Button: Background opacity change + subtle lift
- Grid row: `bg-yellow-50` (light) / `bg-slate-700` (dark)
- Sidebar item: `bg-blue-50` (light) / `bg-slate-700` (dark)

### Transitions
- All interactive elements: `transition-colors duration-150`
- Sidebar toggle: `transition-all duration-200`
- Theme switch: `transition-colors duration-300`

---

## 🖼️ Component Specs

### Toolbar Button
```css
.toolbar-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 150ms;
}
```

### Form Input
```css
.form-input {
  height: 28px;
  padding: 0 8px;
  font-size: 13px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--text-primary);
}
.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.1);
}
```

### Grid Cell
```css
.grid-cell {
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  background: transparent;
  border: none;
}
.grid-cell:focus {
  background: rgba(94, 106, 210, 0.05);
}
```

### Status Badge
```css
.badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
```

---

## 🎯 Accessibility

- [ ] Color contrast: WCAG AA (4.5:1 for text)
- [ ] Focus visible on all interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] ARIA labels for icons-only buttons
- [ ] Screen reader support
