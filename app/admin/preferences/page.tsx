"use client";

import React, { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTableStyles } from "@/constants/adminConstants";
import { userPreferences } from "@/graph/API";
import { useAdminPreferences } from "@/hooks/admin/useAdminPreferences";
import CustomDataTable from "@/utils/CustomDataTable";

export default function PreferencesPage() {
    const [searchText, setSearchText] = useState("");

    const {
        data: preferencesList = [],
        isLoading,
        error
    } = useAdminPreferences();

    const filteredPreferences = preferencesList.filter((item: userPreferences) =>
        item.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.user?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.role?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            name: "User",
            selector: (row: userPreferences) => row.user?.email || "",
            sortable: true,
            cell: (row: userPreferences) => (
                <span className="font-semibold text-gray-900 truncate" title={row.user?.email || ""}>
                    {row.user?.email || "Unknown User"}
                </span>
            ),
            width: "25%",
        },
        {
            name: "Role",
            selector: (row: userPreferences) => row.role || "",
            sortable: true,
            cell: (row: userPreferences) => (
                <span className="text-gray-700">{row.role || "N/A"}</span>
            ),
            width: "20%",
        },
        {
            name: "Interests",
            cell: (row: userPreferences) => (
                <div className="flex flex-wrap gap-1 py-1">
                    {row.interests && row.interests.length > 0 ? (
                        row.interests.map((interest, index) => (
                            <span key={index} className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded text-xs border border-pink-100">
                                {interest}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">-</span>
                    )}
                </div>
            ),
            width: "28%",
        },
        {
            name: "Use Cases",
            cell: (row: userPreferences) => (
                <div className="flex flex-wrap gap-1 py-1">
                    {row.usecases && row.usecases.length > 0 ? (
                        row.usecases.map((usecase, index) => (
                            <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100">
                                {usecase}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">-</span>
                    )}
                </div>
            ),
            width: "27%",
        }
    ];

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="User Preferences"
                count={preferencesList.length}
                searchPlaceholder="Search users or roles..."
                searchValue={searchText}
                onSearchChange={setSearchText}
            />

            <CustomDataTable
                columns={columns}
                data={filteredPreferences}
                isLoading={isLoading}
                error={error ? "Error loading preferences. Please try again later." : null}
                noDataMessage={<div className="p-8 text-gray-500">No preferences found</div>}
                customStyles={adminTableStyles}
            />
        </div>
    );
}
