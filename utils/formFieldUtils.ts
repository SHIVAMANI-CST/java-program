// utils/formFieldFactory.ts

import { REGEX_MESSAGES } from "@/constants/messages";
import { BaseField, FieldConfig, GeneratedField } from "@/types/home";
import { REGEX, stripAsterisk } from "@/utils/regexUtils";

export const baseField: BaseField = {
  fieldDisabled: false,
  fieldActive: true,
  component: "INPUT_FIELD",
  fieldRequired: true,
  fieldType: "TEXT",
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export function createField(config: FieldConfig): GeneratedField {
  const merged = { ...baseField, ...config };

  return {
    ...merged,
    validation: {
      required: merged.fieldRequired
        ? `${stripAsterisk(merged.fieldLabel)} is required`
        : false,
      ...(merged.fieldType === "TEL" && {
        pattern: {
          value: REGEX.PHONE_NUMBER,
          message: REGEX_MESSAGES.PHONE_NUMBER,
        },
      }),
    },
  };
}
