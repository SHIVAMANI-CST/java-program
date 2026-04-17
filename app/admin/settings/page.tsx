"use client";

import React, { useState } from "react";
import Button from "@/components/global-components/Button";
import Input from "@/components/global-components/Input";
import { COLORS } from "@/utils/colors";

export default function AdminSettingsPage() {
    const [siteName, setSiteName] = useState("CinfyAI");
    const [supportEmail, setSupportEmail] = useState("support@cinfy.com");
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">General Settings</h2>
                <Button variant="primary" size="sm">
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Application Info</h3>
                    <Input
                        label="Application Name"
                        placeholder="Enter application name"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                    />
                    <Input
                        label="Support Email"
                        placeholder="Enter support email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                    />
                </div>

                {/* System Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">System Status</h3>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                            <p className="text-xs text-gray-500">Temporarily disable access for non-admins.</p>
                        </div>
                        <button
                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? COLORS.success.split(" ")[0] : "bg-gray-200"}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                    </div>

                    <div className="pt-2">
                        <p className="text-sm text-gray-500">
                            Current Version: <span className="font-mono text-gray-900">v1.2.0</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
