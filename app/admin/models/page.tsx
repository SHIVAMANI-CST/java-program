"use client";

import React, { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminTableStyles } from "@/constants/adminConstants";
import { ProviderModel, useProviderModels } from "@/hooks/gptModels";
import CustomDataTable from "@/utils/CustomDataTable";
import { filterDataByColumns } from "@/utils/filterUtils";

export default function ModelsPage() {
    const [searchText, setSearchText] = useState("");

    const {
        data: models = [],
        isLoading,
        error
    } = useProviderModels();

    const columns = [
        {
            name: "Model Name",
            selector: (row: ProviderModel) => row.modelName,
            sortable: true,
            cell: (row: ProviderModel) => (
                <span className="font-semibold text-gray-900">{row.modelName}</span>
            ),
            width: "25%",
        },
        {
            name: "Provider",
            selector: (row: ProviderModel) => row.provider?.providerName || "",
            sortable: true,
            cell: (row: ProviderModel) => (
                <span className="text-gray-700">
                    {row.provider?.providerName || "N/A"}
                </span>
            ),
            width: "20%",
        },
        {
            name: "Type",
            selector: (row: ProviderModel) => row.modelType || "",
            sortable: true,
            cell: (row: ProviderModel) => (
                <span className="text-sm text-gray-600">
                    {row.modelType}
                </span>
            ),
            width: "20%",
        },
        {
            name: "Label",
            selector: (row: ProviderModel) => row.label?.label || "",
            sortable: true,
            cell: (row: ProviderModel) => (
                row.label?.label ? (
                    <StatusBadge status={row.label.label} />
                ) : <span className="text-gray-400 text-xs">-</span>
            ),
            width: "18%",
        },
        {
            name: "Status",
            selector: (row: ProviderModel) => row.status || "",
            sortable: true,
            cell: (row: ProviderModel) => <StatusBadge status={row.status || "N/A"} />,
            width: "17%",
        }
    ];

    const filteredModels = filterDataByColumns(
        models as ProviderModel[],
        searchText,
        columns
    );

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Model Management"
                count={models.length}
                searchPlaceholder="Search models..."
                searchValue={searchText}
                onSearchChange={setSearchText}
            />

            <CustomDataTable
                columns={columns}
                data={filteredModels}
                isLoading={isLoading}
                error={error ? "Error loading models. Please try again later." : null}
                noDataMessage={<div className="p-8 text-gray-500">No models found</div>}
                customStyles={adminTableStyles}
            />
        </div>
    );
}
