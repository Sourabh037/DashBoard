import { useContext } from "react";
import LicenseContext from "./LicenseContext";

export const useLicenses = () => {
  const context = useContext(LicenseContext);

  if (!context) {
    throw new Error(
      "useLicenses must be used inside LicenseProvider"
    );
  }

  return context;
};