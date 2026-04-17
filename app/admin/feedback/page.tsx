"use client";

import dayjs from "dayjs";
import { MessageSquare, Star,  } from "lucide-react";
import React, { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminTableStyles } from "@/constants/adminConstants";
import { answers } from "@/graph/API";
import { useAdminFeedback } from "@/hooks/admin/useAdminFeedback";
import CustomDataTable from "@/utils/CustomDataTable";

export default function FeedbackPage() {
  const [searchText, setSearchText] = useState("");

  const { data: feedbackList = [], isLoading, error } = useAdminFeedback();

  const filteredFeedback = feedbackList.filter(
    (item: answers) =>
      item.answerValue?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.answeredBy?.email
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      item.answeredBy?.firstName
        ?.toLowerCase()
        .includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: "User",
      selector: (row: answers) => row.answeredBy?.email || "",
      sortable: true,
      cell: (row: answers) => (
        <span className="font-semibold text-gray-900">
          {row.answeredBy?.firstName} {row.answeredBy?.lastName}
        </span>
      ),
      width: "20%",
    },
    {
      name: "Question",
      selector: (row: answers) => row.question?.questionText || "",
      sortable: true,
      cell: (row: answers) => (
        <span
          className="text-sm text-gray-600 line-clamp-2"
          title={row.question?.questionText || ""}
        >
          {row.question?.questionText}
        </span>
      ),
      width: "30%",
    },
    {
      name: "Feedback / Answer",
      selector: (row: answers) => row.answerValue || "",
      cell: (row: answers) => {
        const isRating = row.question?.questionType === "STAR_RATING";
        return (
          <div className="py-1">
            {isRating ? (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Number(row.answerValue)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {row.answerValue}/5
                </span>
              </div>
            ) : (
              <span
                className="text-gray-700 text-sm line-clamp-2"
                title={row.answerValue || ""}
              >
                {row.answerValue}
              </span>
            )}
          </div>
        );
      },
      width: "30%",
    },
    {
      name: "Date",
      selector: (row: answers) => row.createdAt,
      sortable: true,
      cell: (row: answers) => (
        <span className="text-gray-500 text-sm">
          {dayjs(row.createdAt).format("MMM D, YYYY")}
        </span>
      ),
      width: "20%",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Feedback"
        count={feedbackList.length}
        searchPlaceholder="Search feedback..."
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <CustomDataTable
        columns={columns}
        data={filteredFeedback}
        isLoading={isLoading}
        error={error ? "Error loading feedback. Please try again later." : null}
        noDataMessage={
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>No feedback found</p>
          </div>
        }
        customStyles={adminTableStyles}
      />
    </div>
  );
}
