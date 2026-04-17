"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Header from "@/components/home/Header";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { adminCategories } from "@/constants/adminConstants";
import { useSidebarStore } from "@/stores/sideBarStore";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen: sidebarOpen, setSidebarOpen } = useSidebarStore();
    const [activeSection, setActiveSection] = useState("dashboard");
    const [routeLoading, setRouteLoading] = useState(false);

    // Map pathname to activeSection
    useEffect(() => {
        setRouteLoading(false);
        const activeCategory = adminCategories.find(
            (category) => category.path !== "/admin" && pathname.includes(category.path)
        );

        if (activeCategory) {
            setActiveSection(activeCategory.id);
        } else if (pathname === "/admin") {
            setActiveSection("dashboard");
        }
    }, [pathname]);

    // Ensure sidebar is open on large screens on mount
    useEffect(() => {
        const isLaptop = window.innerWidth >= 1024;
        if (isLaptop) {
            setSidebarOpen(true);
        }
    }, [setSidebarOpen]);

    const handleNavigation = (path: string) => {
        setRouteLoading(true);
        router.push(path);
    };

    const categories = adminCategories.map((category) => ({
        ...category,
        onClick: () => handleNavigation(category.path),
    }));


    return (
        <div className="flex h-dvh flex-col bg-[#F5F7FA]">
            <Header setRouteLoading={setRouteLoading} isLoading={routeLoading} isAdmin={true} />

            <div className="flex flex-1 overflow-hidden">
                <SettingsSidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    categories={categories}
                />

                <div className={`
                    flex-1 flex flex-col transition-all duration-300 ease-in-out
                    md:ml-14
                    ${sidebarOpen ? "ml-0 lg:ml-60 xl:ml-70" : "ml-0 lg:ml-16 xl:ml-20"}
                `}>
                    <main className="relative flex-1 overflow-x-hidden overflow-y-auto p-6">
                        {/* Background gradient blobs */}
                        <div
                            className="absolute top-0 right-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
                            style={{
                                background: "rgba(142, 94, 255, 0.35)",
                                filter: "blur(180px)",
                            }}
                        />
                        <div
                            className="absolute top-0 left-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
                            style={{
                                background: "rgba(255, 133, 94, 0.2)",
                                filter: "blur(180px)",
                            }}
                        />
                        <div className="relative z-10">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

