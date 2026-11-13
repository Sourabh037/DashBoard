import { useState, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

import { useLicenses } from "./context/useLicenses";

const calculateDuration = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime || !endDate || !endTime) return "";

  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  const difference = end.getTime() - start.getTime();

  if (!Number.isFinite(difference) || difference <= 0) return "";

  const totalMinutes = Math.floor(difference / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return `${days} Days, ${hours} Hours, ${minutes} Minutes`;
};

const GenerateLicense = ({ remakeRequest, onRemakeLoaded, initialLicense }) => {
  const steps = ["Client", "License", "Send"];

  const {
    clients,
    pendingLicenses,
    updateClient,
    updatePendingLicense,
    sendLicense,
    deleteClient,
    generateLicense,
    removePendingLicense,
  } = useLicenses();

  const [currentStep, setCurrentStep] = useState(2);
  const [isEditing, setIsEditing] = useState(false);

  const [clientOpen, setClientOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedLicenseId, setSelectedLicenseId] = useState(
    initialLicense?.id || null,
  );

  const [selectedClient, setSelectedClient] = useState(() =>
    initialLicense?.client
      ? {
          ...initialLicense.client,
          printers: (initialLicense.client.printers || []).map((printer) => ({
            ...printer,
          })),
        }
      : null,
  );

  const [localLicense, setLocalLicense] = useState(() =>
    initialLicense ? { ...initialLicense } : null,
  );

  // Always display the editable local license data.
  const selectedLicense = localLicense;

  const filteredLicenses = pendingLicenses.filter((license) => {
    const client =
      clients.find((item) => item.id === license.clientId) || license.client;

    return (client?.name || "").toLowerCase().includes(search.toLowerCase());
  });

  // Delete from Generate Licenses dropdown
  const handleRemoveLicense = (license) => {
    const confirmed = window.confirm(
      license.isRemake
        ? "Remove this remake license from the list? The expired record will remain."
        : "Permanently delete this client and all associated licenses?",
    );

    if (!confirmed) return;

    if (license.isRemake) {
      // Remove only the remake entry
      removePendingLicense(license.id);
    } else {
      // Permanently delete new/existing client
      deleteClient(license.clientId);
    }

    if (selectedLicenseId === license.id) {
      setSelectedLicenseId(null);
      setSelectedClient(null);
      setLocalLicense(null);
      setCurrentStep(2);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (!remakeRequest?.requestId) return;

    const clientCopy = {
      ...remakeRequest.client,
      printers: (remakeRequest.client.printers || []).map((printer) => ({
        ...printer,
      })),
    };

    const newLicenseId = remakeRequest.license.id;

    const remakePendingLicense = {
      ...remakeRequest.license,
      client: clientCopy,
      clientId: clientCopy.id,
      isRemake: true,
    };

    generateLicense(remakePendingLicense);

    const timer = setTimeout(() => {
      setSelectedLicenseId(newLicenseId);
      setSelectedClient(clientCopy);
      setLocalLicense(remakePendingLicense);

      setCurrentStep(2);
      setIsEditing(true);

      setClientOpen(false);
      setSearch("");

      onRemakeLoaded?.();
    }, 0);

    return () => clearTimeout(timer);
  }, [remakeRequest, generateLicense, onRemakeLoaded]);

  // Select pending license
  const handleSelectLicense = (license) => {
    setSelectedLicenseId(license.id);

    setLocalLicense({ ...license });

    const client =
      clients.find((item) => item.id === license.clientId) || license.client;

    setSelectedClient(
      client
        ? {
            ...client,
            printers: (client.printers || []).map((printer) => ({
              ...printer,
            })),
          }
        : null,
    );

    setClientOpen(false);
    setSearch("");
    setCurrentStep(2);
    setIsEditing(false);
  };

  // Update license fields locally
  const handleLicenseChange = (field, value) => {
    setLocalLicense((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Edit and update
  const handleEditUpdate = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!selectedClient?.name?.trim()) {
      alert("Please enter client name.");
      return;
    }

    if (!localLicense || !selectedLicenseId) {
      alert("Please select a pending license.");
      return;
    }

    const duration = calculateDuration(
      localLicense.issueDate,
      localLicense.issueTime,
      localLicense.expiryDate,
      localLicense.expiryTime,
    );

    if (!duration) {
      alert("Please enter valid license dates and times.");
      return;
    }

    const updatedLicense = {
      ...localLicense,
      client: selectedClient,
      clientId: selectedClient.id,
      duration,
    };

    // Update the permanent client record
    updateClient(selectedClient.id, selectedClient);

    // Update the pending license
    updatePendingLicense(selectedLicenseId, updatedLicense);

    setLocalLicense(updatedLicense);
    setIsEditing(false);

    alert("Information updated successfully!");
  };

  // Send license
  const handleSendLicense = () => {
    if (!selectedLicenseId || !selectedClient || !localLicense) {
      alert("Please select a pending license.");
      return;
    }

    if (isEditing) {
      alert("Please click Update before sending.");
      return;
    }

    const duration = calculateDuration(
      localLicense.issueDate,
      localLicense.issueTime,
      localLicense.expiryDate,
      localLicense.expiryTime,
    );

    if (!duration) {
      alert("Please correct the license validity dates and times.");
      return;
    }

    const updatedLicense = {
      ...localLicense,
      client: selectedClient,
      clientId: selectedClient.id,
      duration,
    };

    updateClient(selectedClient.id, selectedClient);
    updatePendingLicense(selectedLicenseId, updatedLicense);

    // Move pending license to active
    sendLicense(selectedLicenseId);

    setLocalLicense(updatedLicense);
    setCurrentStep(3);

    alert("License sent successfully!");
  };

  return (
    <div className="p-4">
      {/* Headline */}
      <div className="flex items-center p-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generate License
          </h1>

          <p className="m-2 text-gray-700 dark:text-gray-200">
            Review the Information Before Finalizing
          </p>
        </div>
      </div>

      {/* STEP PROGRESS BAR */}
      <div className="mx-4 mt-6">
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const completed =
              index === 0 ||
              (index === 1 && currentStep >= 2) ||
              (index === 2 && currentStep === 3);

            return (
              <div key={step} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    completed
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {completed ? <Check size={18} /> : index + 1}
                </div>

                <span
                  className={`text-sm ${
                    completed ? "font-semibold text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mb-4 mt-4 h-1 w-full rounded-full bg-gray-200">
          <div
            className="h-1 rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* PENDING LICENSE CLIENT SEARCH */}
      <div className="relative mx-4 mt-4 rounded-xl bg-white py-1">
        {!clientOpen ? (
          <button
            onClick={() => {
              if (currentStep !== 3) setClientOpen(true);
            }}
            disabled={currentStep === 3}
            className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left"
          >
            <div>
              <p className="font-semibold text-gray-500 dark:text-gray-200">
                Pending License Clients
              </p>
              <p className="font-medium text-gray-800">
                {selectedClient?.name || "Select a Client..."}
              </p>
            </div>
            <ChevronDown size={20} className="text-gray-500" />
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-blue-400 px-4 py-3">
            <Search size={20} />
            <input
              autoFocus
              placeholder="Search client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-400"
            />
            <button
              onClick={() => {
                setClientOpen(false);
                setSearch("");
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {clientOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800">
            {filteredLicenses.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">
                No pending licenses found
              </p>
            ) : (
              filteredLicenses.map((license) => {
                const client =
                  clients.find((item) => item.id === license.clientId) ||
                  license.client;

                return (
                  <div
                    key={license.id}
                    className="flex items-center border-b hover:bg-gray-50"
                  >
                    <button
                      onClick={() => handleSelectLicense(license)}
                      className="min-w-0 flex-1 px-4 py-3 text-left"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {client?.name || "Unnamed Client"}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-200">
                        Region: {client?.region || "Not provided"}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-200">
                        Printers: {client?.printers?.length || 0}
                      </p>
                    </button>

                    <button
                      onClick={() => handleRemoveLicense(license)}
                      title="Delete client"
                      className="mr-3 rounded-full p-2 text-red-500 hover:bg-red-100 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* CLIENT INFORMATION */}
      {selectedClient && (
        <div className="mx-4 my-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Client Information
          </h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              ["Client Name", "name"],
              ["Region", "region"],
              ["Time Zone", "timeZone"],
              ["Contact Person", "personName"],
              ["Contact Number", "contactNo"],
              ["Email", "email"],
            ].map(([label, field]) => (
              <div key={field}>
                <label className="text-sm text-gray-500">{label}</label>
                <input
                  disabled={!isEditing}
                  value={selectedClient[field] || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border p-2 disabled:bg-gray-50"
                />
              </div>
            ))}
          </div>

          {/* PRINTER INFORMATION */}
          <h3 className="mb-3 mt-5 font-semibold text-gray-900 dark:text-white">
            Printer Information
          </h3>

          {(selectedClient.printers || []).map((printer, index) => (
            <div
              key={printer.id || index}
              className="mb-3 rounded-lg bg-gray-50 p-3"
            >
              <p className="font-semibold">Printer {index + 1}</p>

              <label className="text-sm text-gray-500">Printer Name</label>
              <input
                disabled={!isEditing}
                value={printer.printername || ""}
                onChange={(e) => {
                  setSelectedClient((prev) => ({
                    ...prev,
                    printers: prev.printers.map((item, i) =>
                      i === index
                        ? { ...item, printername: e.target.value }
                        : item,
                    ),
                  }));
                }}
                className="mb-2 w-full rounded-lg border p-2 disabled:bg-gray-50"
              />

              <label className="text-sm text-gray-900 dark:text-white">
                Serial Number
              </label>
              <input
                disabled={!isEditing}
                value={printer.serialNumber || ""}
                onChange={(e) => {
                  setSelectedClient((prev) => ({
                    ...prev,
                    printers: prev.printers.map((item, i) =>
                      i === index
                        ? { ...item, serialNumber: e.target.value }
                        : item,
                    ),
                  }));
                }}
                className="w-full rounded-lg border p-2 disabled:bg-gray-50"
              />
            </div>
          ))}
        </div>
      )}

      {/* LICENSE INFORMATION */}
      {selectedLicense && selectedClient && (
        <div className="mx-4 my-4 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            License Information
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Client: {selectedClient.name}
          </p>

          <h3 className="mb-2 mt-5 font-semibold text-gray-900 dark:text-white">
            Issue Date & Time
          </h3>

          <div className="flex gap-3">
            <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-2">
              <p className="text-sm text-gray-400">Date</p>
              <input
                type="date"
                disabled={!isEditing}
                value={selectedLicense.issueDate || ""}
                onChange={(e) =>
                  handleLicenseChange("issueDate", e.target.value)
                }
                className="w-full min-w-0 bg-transparent outline-none dark:border-gray-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-2">
              <p className="text-sm text-gray-400">Time</p>
              <input
                type="time"
                disabled={!isEditing}
                value={selectedLicense.issueTime || ""}
                onChange={(e) =>
                  handleLicenseChange("issueTime", e.target.value)
                }
                className="w-full min-w-0 bg-transparent outline-none dark:border-gray-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <h3 className="mb-2 mt-5 font-semibold text-gray-900 dark:text-white">
            Expiry Date & Time
          </h3>

          <div className="flex gap-3">
            <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-2">
              <p className="text-sm text-gray-400">Date</p>
              <input
                type="date"
                min={selectedLicense.issueDate}
                disabled={!isEditing}
                value={selectedLicense.expiryDate || ""}
                onChange={(e) =>
                  handleLicenseChange("expiryDate", e.target.value)
                }
                className="w-full min-w-0 bg-transparent outline-none dark:border-gray-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-2">
              <p className="text-sm text-gray-400">Time</p>
              <input
                type="time"
                disabled={!isEditing}
                value={selectedLicense.expiryTime || ""}
                onChange={(e) =>
                  handleLicenseChange("expiryTime", e.target.value)
                }
                className="w-full min-w-0 bg-transparent outline-none dark:border-gray-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:border dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200">
            Duration:{" "}
            {calculateDuration(
              selectedLicense.issueDate,
              selectedLicense.issueTime,
              selectedLicense.expiryDate,
              selectedLicense.expiryTime,
            ) || "Not calculated"}
          </p>
        </div>
      )}

      {/* FINAL ACTION BUTTONS */}
      {selectedLicense && currentStep !== 3 && (
        <div className="my-4 flex items-center justify-between gap-3 px-4">
          <button
            onClick={handleEditUpdate}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 font-semibold ${
              isEditing
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
          >
            {isEditing ? (
              <>
                <Check size={18} />
                Update
              </>
            ) : (
              "Edit"
            )}
          </button>

          <button
            onClick={handleSendLicense}
            disabled={isEditing}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Send License
            <Check size={18} />
          </button>
        </div>
      )}

      {currentStep === 3 && (
        <div className="mx-4 my-6 rounded-lg bg-green-50 p-5 text-center">
          <Check size={40} className="mx-auto text-green-600" />
          <h2 className="mt-2 text-xl font-semibold text-green-700">
            License Sent Successfully
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This client has been moved to Active License.
          </p>
        </div>
      )}

      {pendingLicenses.length === 0 && (
        <p className="mx-4 my-6 text-center text-gray-500">
          No pending licenses available.
        </p>
      )}
    </div>
  );
};

export default GenerateLicense;
