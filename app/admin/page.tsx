"use client";

import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getAdminStats } from "@/constants/adminConstants";
import { users} from "@/graph/API";
import { useAdminSubscriptions } from "@/hooks/admin/useAdminSubscriptions";
import { useAdminTransactions } from "@/hooks/admin/useAdminTransactions";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { formatDisplayDate } from "@/utils/dateUtils";

// eslint-disable-next-line @typescript-eslint/naming-convention
const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendColor,
  subValue,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  trendColor?: string;
  subValue?: string;
}) => {
  const Icon = icon;
  return (
    <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg bg-gradient-to-br from-[#FF855E]/10 to-[#6A2AFFF2]/10`}
        >
          <Icon className="w-6 h-6 text-[#6A2AFFF2]" />   
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${trendColor === "text-green-500" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}
          >
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
  );
};

export default function AdminDashboard() {
  // Fetch all data
  const { data: usersData, isLoading: isLoadingUsers } = useAdminUsers();
  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } =
    useAdminSubscriptions();
  const { data: transactionsData, isLoading: isLoadingPayments } =
    useAdminTransactions();

  // Show loading state
  if (isLoadingUsers || isLoadingSubscriptions || isLoadingPayments) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Extract data with defaults
  const users = usersData?.users || [];
  const totalUsers = usersData?.totalCount || 0;

  const activePaidSubs = subscriptionsData?.paidCount || 0;
  const activeFreeSubs = subscriptionsData?.freeCount || 0;

  const totalRevenue = transactionsData?.totalRevenue || 0;
  const currencySymbol = transactionsData?.currencySymbol || "$";

  // Recent Activity (Latest 5 signups)
  const recentUsers = [...users]
    .sort(
      (a: users, b: users) =>
        dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    )
    .slice(0, 5);

  const stats = getAdminStats(
    totalUsers,
    activePaidSubs,
    activeFreeSubs,
    totalRevenue,
    currencySymbol
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            Recent User Signups
          </h2>
          <Link
            href="/admin/users"
            className="text-blue-600 text-sm hover:underline font-medium"
          >
            View All Users
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 table-fixed">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-4 w-[20%]">User</th>
                <th className="p-4 w-[35%]">Email</th>
                <th className="p-4 w-[25%]">Joined Date</th>
                <th className="p-4 w-[20%]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsers.length > 0 ? (
                recentUsers.map((user: users) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                    </td>
                    <td className="p-4 truncate" title={user.email || ""}>
                      {user.email}
                    </td>
                    <td className="p-4">{formatDisplayDate(user.createdAt)}</td>
                    <td className="p-4">
                      <StatusBadge status={user.signupStatus || ""} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
