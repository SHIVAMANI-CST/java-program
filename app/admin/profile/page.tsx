"use client";

import React from "react";
import UserInfoCard from "@/components/settings/profile/userPage";

export default function AdminProfilePage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
            <UserInfoCard />
        </div>
    );
}
