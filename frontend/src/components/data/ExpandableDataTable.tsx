"use client";

import { ReactNode, useState } from "react";
import { ChevronUp, ChevronDown, ChevronRight } from "lucide-react";

export interface Column<T = Record<string, unknown>> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: unknown, row: T) => ReactNode;
}

export interface DetailField {
    key: string;
    label: string;
    render?: (value: unknown) => ReactNode;
}

interface ExpandableDataTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: Column<any>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    detailFields: DetailField[];
    sortBy?: string;
    sortOrder?: string;
    onSort?: (key: string) => void;
}

function formatDetailValue(value: unknown, field: DetailField): ReactNode {
    if (field.render) return field.render(value);
    if (value === null || value === undefined || value === "") {
        return <span className="text-gray-300">—</span>;
    }
    if (typeof value === "boolean") {
        return (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${value
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
            >
                {value ? "Yes" : "No"}
            </span>
        );
    }
    // Try to parse as ISO date
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        try {
            const d = new Date(value);
            return d.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        } catch {
            return String(value);
        }
    }
    return String(value);
}

export function ExpandableDataTable({
    columns,
    data,
    detailFields,
    sortBy,
    sortOrder,
    onSort,
}: ExpandableDataTableProps) {
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const toggleRow = (index: number) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="w-10 px-2 py-3" />
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable
                                            ? "cursor-pointer hover:bg-gray-100 select-none"
                                            : ""
                                        }`}
                                    onClick={() => col.sortable && onSort?.(col.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable &&
                                            sortBy === col.key &&
                                            (sortOrder === "asc" ? (
                                                <ChevronUp size={14} />
                                            ) : (
                                                <ChevronDown size={14} />
                                            ))}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-4 py-8 text-center text-gray-500"
                                >
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, i) => (
                                <>
                                    <tr
                                        key={`row-${i}`}
                                        onClick={() => toggleRow(i)}
                                        className={`cursor-pointer transition-colors ${expandedRow === i
                                                ? "bg-blue-50/50"
                                                : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <td className="px-2 py-3 text-gray-400">
                                            <ChevronRight
                                                size={16}
                                                className={`transition-transform duration-200 ${expandedRow === i ? "rotate-90" : ""
                                                    }`}
                                            />
                                        </td>
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className="px-4 py-3 text-gray-900 whitespace-nowrap"
                                            >
                                                {col.render
                                                    ? col.render(row[col.key], row)
                                                    : String(row[col.key] ?? "")}
                                            </td>
                                        ))}
                                    </tr>
                                    {expandedRow === i && (
                                        <tr key={`detail-${i}`}>
                                            <td
                                                colSpan={columns.length + 1}
                                                className="px-0 py-0"
                                            >
                                                <div className="bg-gradient-to-b from-blue-50/60 to-gray-50/40 border-t border-b border-blue-100 px-8 py-5">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                                        All Details
                                                    </h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
                                                        {detailFields.map((field) => (
                                                            <div key={field.key} className="min-w-0">
                                                                <dt className="text-xs font-medium text-gray-400 truncate">
                                                                    {field.label}
                                                                </dt>
                                                                <dd className="text-sm text-gray-900 mt-0.5 truncate">
                                                                    {formatDetailValue(row[field.key], field)}
                                                                </dd>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
