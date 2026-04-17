"use client";

import dayjs from "dayjs";
import React, { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { adminTableStyles } from "@/constants/adminConstants";
import { users } from "@/graph/API";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import CustomDataTable from "@/utils/CustomDataTable";

export default function UsersPage() {
  const [searchText, setSearchText] = useState("");

  // Hooks
  const { data, isLoading, error } = useAdminUsers();

  const usersList = data?.users || [];
  const totalCount = data?.totalCount || 0;

  const filteredUsers = (usersList as Array<users | null>).filter(
    (user): user is users =>
      !!user &&
      (user.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
        false ||
        user.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
        false ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        false ||
        user.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
        false ||
        user.authenticationType?.toLowerCase().includes(searchText.toLowerCase()) ||
        false ||
        user.signupStatus?.toLowerCase().includes(searchText.toLowerCase()) ||
        false ||
        user.country?.countryName?.toLowerCase().includes(searchText.toLowerCase()) ||
        false)
  );

  const columns = [
    {
      id: "user",
      name: "User",
      selector: (row: users) => row.firstName || "",
      sortable: true,
      cell: (row: users) => (
        <div className="flex items-center gap-3 w-full text-left">
          {`${row.firstName || ""} ${row.lastName || ""}`}
        </div>
      ),
      width: "18%",
    },
    {
      id: "email",
      name: "Email",
      selector: (row: users) => row.email || "",
      sortable: true,
      cell: (row: users) => <div>{row.email || ""}</div>,
      width: "22%",
    },
    {
      id: "phone",
      name: "Phone",
      selector: (row: users) => row.phone || "",
      sortable: true,
      cell: (row: users) => <div>{row.phone || "N/A"}</div>,
      grow: 1,
    },
    {
      id: "type",
      name: "Type",
      selector: (row: users) => row.authenticationType || "",
      sortable: true,
      cell: (row: users) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs font-semibold text-gray-600 whitespace-nowrap`}
          >
            {row.authenticationType || "Standard"}
          </span>
        </div>
      ),
      grow: 1.5,
    },
    {
      id: "status",
      name: "Status",
      selector: (row: users) => row.signupStatus || "",
      sortable: true,
      cell: (row: users) => <StatusBadge status={row.signupStatus || ""} />,
      grow: 1,
    },
    {
      id: "country",
      name: "Country",
        sortable: true,
        selector: (row: users) => row.country?.countryName || "",
      width: "10%",
    },
    {
      id: "joined",
      name: "Joined",
      selector: (row: users) => row.createdAt,
      sortable: true,
      cell: (row: users) => (
        <div className="flex items-center gap-2 text-gray-500 text-xs whitespace-nowrap">
          {dayjs(row.createdAt).format("MM/DD/YYYY")}
        </div>
      ),
      grow: 0.5,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        count={totalCount}
        searchPlaceholder="Search users..."
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <CustomDataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        error={error ? "Error loading users. Please try again later." : null}
        noDataMessage="No users found"
        customStyles={adminTableStyles}
        defaultSortFieldId="joined"
        defaultSortAsc={false}
      />
    </div>
  );
}
