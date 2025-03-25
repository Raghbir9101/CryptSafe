import { FC } from "react";

export const EyeIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-${size} h-${size}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 15.232a6 6 0 11-8.464-8.464m8.464 8.464L19.5 19.5m-8.982-2.768a2.25 2.25 0 100-3.182 2.25 2.25 0 000 3.182z"
    />
  </svg>
);

export const EyeOffIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-${size} h-${size}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.97a10.451 10.451 0 011.549-1.893m14.85 13.176a10.451 10.451 0 01-1.549 1.893M9.88 9.88a2.25 2.25 0 103.182 3.182M15.232 15.232a6 6 0 11-8.464-8.464"
    />
  </svg>
);
