import { createContext, useEffect, useState } from "react";

const LicenseContext = createContext(null);

const readStorage = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const LicenseProvider = ({ children }) => {
  // Load existing data without deleting it
  const [clients, setClients] = useState(() =>
    readStorage("savedClients").map((client) => ({
      ...client,
      status: client.status || "pending_license",
    })),
  );

  const [pendingLicenses, setPendingLicenses] = useState(() =>
    readStorage("pendingLicenses"),
  );

  const [activeLicenses, setActiveLicenses] = useState(() =>
    readStorage("activeLicenses"),
  );

  // Automatically save all data
  useEffect(() => {
    localStorage.setItem("savedClients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("pendingLicenses", JSON.stringify(pendingLicenses));
  }, [pendingLicenses]);

  useEffect(() => {
    localStorage.setItem("activeLicenses", JSON.stringify(activeLicenses));
  }, [activeLicenses]);

  // Permanently save one client
  const addClient = (client) => {
    setClients((prev) => {
      const exists = prev.some((item) => item.id === client.id);

      if (exists) {
        return prev.map((item) =>
          item.id === client.id ? { ...item, ...client } : item,
        );
      }

      return [...prev, { ...client, status: "pending_license" }];
    });
  };

  // Update pending license
  const updatePendingLicense = (licenseId, updatedData) => {
    setPendingLicenses((prev) =>
      prev.map((license) =>
        license.id === licenseId ? { ...license, ...updatedData } : license,
      ),
    );
  };

  // Update existing client
  const updateClient = (clientId, updatedData) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId ? { ...client, ...updatedData } : client,
      ),
    );
  };

  // Delete client and associated licenses
  const deleteClient = (clientId) => {
    setClients((prev) => prev.filter((client) => client.id !== clientId));

    setPendingLicenses((prev) =>
      prev.filter((license) => license.clientId !== clientId),
    );

    setActiveLicenses((prev) =>
      prev.filter((license) => license.clientId !== clientId),
    );
  };

  // Move client from License to Generate License
  const generateLicense = (licenseData) => {
    const clientId = licenseData.client.id;

    const newLicense = {
      ...licenseData,
      clientId,
      status: "pending",
    };

    // Prevent duplicate pending licenses for the same client
    setPendingLicenses((prev) => {
      const exists = prev.some((license) => license.clientId === clientId);

      if (exists) {
        return prev.map((license) =>
          license.clientId === clientId
            ? { ...newLicense, id: license.id }
            : license,
        );
      }

      return [...prev, newLicense];
    });

    // Update the same permanent client
    setClients((prev) =>
      prev.map((client) =>
        client.id === clientId ? { ...client, status: "pending_send" } : client,
      ),
    );
  };

  // Move pending license to active license
  const sendLicense = (licenseId) => {
    const license = pendingLicenses.find((item) => item.id === licenseId);

    if (!license) return;

    // Remove from pending
    setPendingLicenses((prev) => prev.filter((item) => item.id !== licenseId));

    // Prevent duplicate active licenses
    setActiveLicenses((prev) => {
      const exists = prev.some((item) => item.clientId === license.clientId);

      if (exists) {
        return prev.map((item) =>
          item.clientId === license.clientId
            ? { ...license, status: "active" }
            : item,
        );
      }

      return [...prev, { ...license, status: "active" }];
    });

    // Update the same permanent client
    setClients((prev) =>
      prev.map((client) =>
        client.id === license.clientId
          ? { ...client, status: "active" }
          : client,
      ),
    );
  };

  // Dashboard counts
  const totalClients = clients.length;

  // Calculate remaining license time
  const getDaysLeft = (license) => {
    if (!license?.expiryDate) return null;

    const expiry = new Date(
      `${license.expiryDate}T${license.expiryTime || "23:59"}`,
    );

    const difference = expiry.getTime() - new Date().getTime();

    if (!Number.isFinite(difference)) return null;

    return difference / 86400000;
  };

  // Pending clients waiting for Issue Date
  const pendingClientCount = clients.filter(
    (client) => client.status === "pending_license",
  ).length;
  
  // Total expired licenses
  const totalExpiredCount = activeLicenses.filter((license) => {
    const daysLeft = getDaysLeft(license);

    return license.status === "active" && daysLeft !== null && daysLeft < 0;
  }).length;

  // Active licenses: more than 30 days remaining
  const activeLicenseCount = activeLicenses.filter((license) => {
    const daysLeft = getDaysLeft(license);

    return license.status === "active" && daysLeft !== null && daysLeft > 30;
  }).length;

  // Expiring soon: 0–30 days remaining
  const expiringSoonCount = activeLicenses.filter((license) => {
    const daysLeft = getDaysLeft(license);

    return (
      license.status === "active" &&
      daysLeft !== null &&
      daysLeft >= 0 &&
      daysLeft <= 30
    );
  }).length;

  // Pending licenses
  const pendingLicenseCount = pendingLicenses.filter(
    (license) => license.status === "pending",
  ).length;

  return (
    <LicenseContext.Provider
      value={{
        clients,
        pendingLicenses,
        activeLicenses,

        addClient,
        updateClient,
        deleteClient,
        generateLicense,
        updatePendingLicense,
        sendLicense,

        totalClients,
        pendingClientCount,
        totalExpiredCount,
        activeLicenseCount,
        pendingLicenseCount,
        expiringSoonCount,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
};

export default LicenseContext;
