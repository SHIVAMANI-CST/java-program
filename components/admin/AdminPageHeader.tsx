import { Search } from "lucide-react";
import React from "react";
import Input from "@/components/global-components/Input";

interface AdminPageHeaderProps {
    title: string;
    count: number;
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    children?: React.ReactNode;
    className?: string;
}

export const AdminPageHeader = ({
    title,
    count,
    searchPlaceholder = "Search...",
    searchValue,
    onSearchChange,
    children,
    className = ""
}: AdminPageHeaderProps) => {
    return (
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                    {count} Total
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-9 h-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                {children}
            </div>
        </div>
    );
};
