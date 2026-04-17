"use client";

import { Loader2 } from "lucide-react";
import React from "react";
import DataTable, { TableProps } from "react-data-table-component";
import { customtransactionsStyles } from "@/utils/uiStyles";

interface CustomTableProps<T> extends TableProps<T> {
    isLoading?: boolean;
    error?: string | null;
    /**
     * Custom message to show when there is no data
     */
    noDataMessage?: React.ReactNode;
}

const loadingComponent = () => (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <p>Loading data...</p>
    </div>
);

// eslint-disable-next-line @typescript-eslint/naming-convention
const ErrorComponent = ({ message }: { message: string }) => (
    <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
        {message}
    </div>
);

// eslint-disable-next-line @typescript-eslint/naming-convention
const NoDataComponent = ({ message }: { message: React.ReactNode }) => (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        {message || "No data available"}
    </div>
);

export default function CustomDataTable<T>({
    columns,
    data,
    isLoading = false,
    error,
    noDataMessage,
    customStyles,
    ...props
}: CustomTableProps<T>) {
    if (error) {
        return <ErrorComponent message={error} />;
    }

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
            <DataTable
                columns={columns}
                data={data}
                progressPending={isLoading}
                progressComponent={loadingComponent()}
                pagination
                paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
                customStyles={customStyles || customtransactionsStyles}
                responsive
                highlightOnHover
                pointerOnHover
                noDataComponent={<NoDataComponent message={noDataMessage} />}
                {...props}
            />
        </div>
    );
}
