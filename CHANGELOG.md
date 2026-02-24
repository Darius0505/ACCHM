# Changelog

All notable changes to ACCHM ERP will be documented in this file.

## [2026-01-20]

### Added
- **Phase 01 Complete**: Database Schema for ERP Accounting Module
  - 18 database models (Company, FiscalYear, Account, Partner, Invoice, Payment, etc.)
  - Chart of Accounts (TT200 Vietnamese standard) - 172 accounts
  - 12 Accounting Periods for 2026
  - 7 Default Journals (General, Cash, Bank, Sales, Purchase)
  - Fiscal year close workflow (OPEN → SOFT_CLOSED → HARD_CLOSED → LOCKED)
  - Multi-language support (name, nameEN, nameJP, nameOther)

### Changed
- Simplified schema: Removed AID auto-generated ID, using UUID only
- Document numbers (invoiceNumber, entryNumber, etc.) for human-readable IDs

### Technical
- SQL Server with Prisma ORM
- Docker container: acchm-sql
- Used onDelete: NoAction for cyclic reference handling

---

## [2026-01-19]

### Added
- Initial project setup with Next.js 13.5
- Prisma configuration for SQL Server
- Basic Account model for Chart of Accounts
