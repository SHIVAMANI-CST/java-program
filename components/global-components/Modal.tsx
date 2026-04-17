"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { BasicModalProps } from "@/types/global";

// Lazy load MUI Modal to reduce initial bundle size (~500KB)
const muiModal = dynamic(
  () => import("@mui/material/Modal").then((mod) => mod.default),
  { ssr: false }
);

const muiBox = dynamic(
  () => import("@mui/material/Box").then((mod) => mod.default),
  { ssr: false }
);

const muiTypography = dynamic(
  () => import("@mui/material/Typography").then((mod) => mod.default),
  { ssr: false }
);

// Uppercase aliases for JSX usage (React requires component names to start with uppercase)
// eslint-disable-next-line @typescript-eslint/naming-convention
const MuiModal = muiModal;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MuiBox = muiBox;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MuiTypography = muiTypography;

const BasicModal: React.FC<BasicModalProps> = ({
  open,
  onClose,
  title = "Modal Title",
  description,
  children,
  width,
}) => {
  if (!open) return null;

  return (
    <MuiModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <MuiBox
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          ...(width && { width }),
          bgcolor: "background.paper",
          border: "2px solid #eeeaea",
          borderRadius: "12px",
          boxShadow: 24,
          p: { xs: 1.5, sm: 2, md: 3, lg: 4, xl: 4 },
          ["&:focus-visible"]: {
            outline: "none",
          },
          width: width || 420,
          maxWidth: "90vw",
        }}
      >
        {title && (
          <MuiTypography id="modal-modal-title" variant="h5">
            {title}
          </MuiTypography>
        )}
        {description && (
          <MuiTypography sx={{ mt: 2, color: "text.secondary" }}>
            {description}
          </MuiTypography>
        )}
        {children}
      </MuiBox>
    </MuiModal>
  );
};

export default BasicModal;
