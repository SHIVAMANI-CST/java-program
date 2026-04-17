"use client";

import React, { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Button from "@/components/global-components/Button";
import { adminTableStyles } from "@/constants/adminConstants";
import { plans } from "@/graph/API";
import { useAdminPlans } from "@/hooks/admin/useAdminPlans";
import CustomDataTable from "@/utils/CustomDataTable";
import { filterDataByColumns } from "@/utils/filterUtils";


export default function PlansPage() {
    const [searchText, setSearchText] = useState("");

    const {
        data: plansList = [],
        isLoading,
        error
    } = useAdminPlans();

    const columns = [
        {
            name: "Plan Name",
            selector: (row: plans) => row.planName || "",
            sortable: true,
            cell: (row: plans) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{row.planName}</span>
                </div>
            ),
            width: "18%",
        },
        {
            name: "Price",
            selector: (row: plans) => row.price || 0,
            sortable: true,
            cell: (row: plans) => (
                <span className="font-medium text-gray-700">
                    {row.price} {row.country?.currency || "USD"}
                </span>
            ),
            width: "14%",
        },
        {
            name: "Duration",
            selector: (row: plans) => row.planDuration || 0,
            sortable: true,
            cell: (row: plans) => (
                <span className="text-gray-600">
                    {row.planDuration} Month
                </span>
            ),
            width: "14%",
        },
        {
            name: "Type",
            selector: (row: plans) => row.planType || "",
            sortable: true,
            cell: (row: plans) => (
                <StatusBadge status={`${row.planType} - ${row.category}`} />
            ),
            width: "22%",
        },
        {
            name: "Priority",
            selector: (row: plans) => row.priority || 0,
            sortable: true,
            width: "14%",
        },
        {
            name: "Status",
            selector: (row: plans) => row.status || "",
            sortable: true,
            cell: (row: plans) => <StatusBadge status={row.status || "inactive"} />,
            width: "18%",
        }
    ];

    const filteredPlans = filterDataByColumns(
        plansList as plans[],
        searchText,
        columns
    );

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Plan Management"
                count={plansList.length}
                searchPlaceholder="Search plans..."
                searchValue={searchText}
                onSearchChange={setSearchText}
            >
                <Button variant="primary" size="sm" className="h-10">
                    Add Plan
                </Button>
            </AdminPageHeader>

            <CustomDataTable
                columns={columns}
                data={filteredPlans}
                isLoading={isLoading}
                error={error ? "Error loading plans. Please try again later." : null}
                noDataMessage={<div className="p-8 text-gray-500">No plans found</div>}
                customStyles={adminTableStyles}
            />
        </div>
    );
}
