import { createField } from "@/utils/formFieldUtils";

export const formConfig = {
  sectionKey: "userInfo",
  sectionName: "Set Profile",
  fields: [
    createField({
      fieldKey: "fullName",
      fieldName: "fullName",
      fieldLabel: "Full Name",
      fieldPlaceholder: "Full Name",
      fieldSortOrder: 1,
    }),
    createField({
      fieldKey: "country",
      fieldName: "country",
      fieldLabel: "Country",
      fieldPlaceholder: "Select your country",
      fieldSortOrder: 2,
      fieldType: "SELECT",
      fieldDisabled: true,
    }),
    createField({
      fieldKey: "phone",
      fieldName: "phone",
      fieldLabel: "Mobile Number",
      fieldPlaceholder: "Mobile Number",
      fieldSortOrder: 3,
      fieldType: "TEL",
      fieldRequired: false,
    }),
    createField({
      fieldKey: "email",
      fieldName: "email",
      fieldLabel: "Email",
      fieldPlaceholder: "Email",
      fieldSortOrder: 4,
      fieldType: "EMAIL",
      fieldDisabled: true,
    }),
  ],
};
