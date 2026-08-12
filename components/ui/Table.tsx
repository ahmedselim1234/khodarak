import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

// Replaces the bare `<table className="w-full text-right">` markup repeated in
// all six admin tables. The wrapper handles horizontal overflow so wide tables
// scroll inside their card instead of pushing the page sideways.
export function Table({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto -mx-1 px-1">
      <table
        className={`w-full border-collapse text-start ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TRow({
  className = "",
  interactive = false,
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={`border-b border-outline-variant last:border-0 ${
        interactive ? "hover:bg-surface-container-low transition-colors duration-fast" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TH({
  className = "",
  numeric = false,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={`border-b border-outline-variant bg-surface-container-low/60 px-3 py-2.5 text-overline uppercase text-on-surface-variant ${
        numeric ? "text-end" : "text-start"
      } ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TD({
  className = "",
  numeric = false,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={`px-3 py-3 text-small text-on-surface align-middle ${
        numeric ? "text-end tabular" : "text-start"
      } ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
