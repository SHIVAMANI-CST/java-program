"use client";

import React, { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminTableStyles } from "@/constants/adminConstants";
import { gptProviders, GptProvidersStatus } from "@/graph/API";
import { useGptProviders } from "@/hooks/gptProviders";
import CustomDataTable from "@/utils/CustomDataTable";
import { filterDataByColumns } from "@/utils/filterUtils";


export default function ProvidersPage() {
    const [searchText, setSearchText] = useState("");

    const {
        data: providersData = [],
        isLoading,
        error,
    } = useGptProviders();

    const providers = providersData as unknown as gptProviders[];

    const columns = [
        {
            name: "Provider Name",
            selector: (row: gptProviders) => row.providerName || "",
            sortable: true,
            cell: (row: gptProviders) => (
                <span className="font-semibold text-gray-900">{row.providerName}</span>
            ),
            width: "30%",
        },
        {
            name: "Status",
            selector: (row: gptProviders) => row.status || "",
            sortable: true,
            cell: (row: gptProviders) => (
                <StatusBadge status={row.status === GptProvidersStatus.ACTIVE ? "active" : "inactive"} />
            ),
            width: "25%",
        },
        {
            name: "Requires Key",
            selector: (row: gptProviders) => row.requiresKey || false,
            sortable: true,
            cell: (row: gptProviders) => <StatusBadge status={row.requiresKey ? "Yes" : "No"} />,
            width: "22%",
        },
        {
            name: "Default Model",
            selector: (row: gptProviders) => row.isDefaultModel || false,
            sortable: true,
            cell: (row: gptProviders) => <StatusBadge status={row.isDefaultModel ? "Yes" : "No"} />,
            width: "23%",
        }
    ];

    const filteredProviders = filterDataByColumns(
        providers as gptProviders[],
        searchText,
        columns
    );

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Provider Management"
                count={providers.length}
                searchPlaceholder="Search providers..."
                searchValue={searchText}
                onSearchChange={setSearchText}
            />

            <CustomDataTable
                columns={columns}
                data={filteredProviders}
                isLoading={isLoading}
                error={error ? "Error loading providers. Please try again later." : null}
                noDataMessage={<div className="p-8 text-gray-500">No providers found</div>}
                customStyles={adminTableStyles}
            />
        </div>
    );
}
