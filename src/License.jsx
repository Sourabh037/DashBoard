import { useState } from "react";
import {
  Search,
  UserRound,
  ChevronDown,
  CalendarClock,
  Check,
  X,
} from "lucide-react";
import { useLicenses } from "./context/useLicenses";

// Get today's local date
const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Get current local time
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

// Calculate license duration
const calculateDuration = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime || !endDate || !endTime) {
    return "Select expiry date & time";
  }

  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  const difference = end.getTime() - start.getTime();

  if (!Number.isFinite(difference) || difference <= 0) {
    return "Expiry must be after issue date";
  }

  const totalMinutes = Math.floor(difference / 60000);

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return `${days} Days, ${hours} Hours, ${minutes} Minutes`;
};

// Read permanent clients saved by Client.jsx

const License = ({ initialClient, onContinue }) => {
  // Steps
  const steps = ["Client", "License", "Send"];

  // Client dropdown states
  const [clientOpen, setClientOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Load permanent clients from Client.jsx
  const { clients, generateLicense, deleteClient } = useLicenses();
  const [selectedClient, setSelectedClient] = useState(initialClient || null);

  // License progress
  // Client is already completed (1/3)
  const [licenseCompleted, setLicenseCompleted] = useState(false);

  // License date and time
  const [issueDate, setIssueDate] = useState(getToday);
  const [issueTime, setIssueTime] = useState(getCurrentTime);

  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");

  // Search clients
  const filteredClients = clients
    .filter((client) => client.status === "pending_license")
    .filter((client) =>
      (client.name || "").toLowerCase().includes(search.toLowerCase()),
    );

  // Delete saved client
  const handleDeleteClient = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?",
    );

    if (!confirmed) return;

    deleteClient(id);

    if (selectedClient?.id === id) {
      setSelectedClient(null);
    }
  };

  // Calculate duration automatically
  const duration = calculateDuration(
    issueDate,
    issueTime,
    expiryDate,
    expiryTime,
  );

  // Save and continue to license generation
  const handleSaveContinue = () => {
    if (!selectedClient) {
      alert("Please select a client first.");
      return;
    }

    if (!issueDate || !issueTime || !expiryDate || !expiryTime) {
      alert("Please select all issue and expiry date/time fields.");
      return;
    }

    const start = new Date(`${issueDate}T${issueTime}`);
    const end = new Date(`${expiryDate}T${expiryTime}`);

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      end <= start
    ) {
      alert("Expiry date and time must be after issue date and time.");
      return;
    }

    const licenseData = {
      id: Date.now(),
      client: selectedClient,
      clientId: selectedClient.id,
      issueDate,
      issueTime,
      expiryDate,
      expiryTime,
      duration,
      status: "pending",
    };

    // Save pending license in context
    generateLicense(licenseData);

    setLicenseCompleted(true);

    alert("License details saved successfully!");

    // Automatically open Generate Licenses
    onContinue?.(licenseData);
  };

  return (
    <div>
      <div className="p-4">
        {/* Headline */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold">License</h1>

          <p className="m-2">Configure License Validity For Your Client</p>
        </div>

        {/* Main Section */}
        <div className="box-border min-h-full min-w-full rounded-lg bg-white">
          {/* Select Client Heading */}
          <div className="mb-2 mr-2 flex items-center gap-1 py-2 pl-4">
            <span className="box-border rounded-lg bg-blue-200 px-2 py-2">
              <UserRound size={25} className="text-blue-600" />
            </span>

            <div className="px-4">
              <h3 className="text-xl font-semibold text-black">
                Select Client
              </h3>

              <p className="text-black">
                Choose a Client Saved in the Client Section
              </p>
            </div>
          </div>

          {/* Client Dropdown */}
          <div className="relative mx-4">
            {/* Client Button / Search */}
            {!clientOpen ? (
              <button
                onClick={() => setClientOpen(true)}
                className="flex w-full items-center justify-between rounded-lg bg-gray-100 px-4 py-3 text-left"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">
                    Client
                  </h3>

                  <p className="font-medium text-gray-800">
                    {selectedClient
                      ? selectedClient.name
                      : "Select a Client..."}
                  </p>
                </div>

                <ChevronDown size={20} className="text-gray-500" />
              </button>
            ) : (
              <div className="flex w-full items-center gap-3 rounded-lg border border-blue-400 bg-white px-4 py-3">
                <Search size={20} className="shrink-0 text-gray-500" />

                <input
                  autoFocus
                  type="text"
                  placeholder="Search client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />

                <button
                  onClick={() => {
                    setClientOpen(false);
                    setSearch("");
                  }}
                  className="text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Client List */}
            {clientOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
                {filteredClients.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">No clients found</p>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between border-b border-gray-100 hover:bg-gray-50"
                    >
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setClientOpen(false);
                          setSearch("");
                        }}
                        className="min-w-0 flex-1 px-4 py-3 text-left"
                      >
                        <p className="font-semibold text-gray-800">
                          {client.name || "Unnamed Client"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Region: {client.region || "Not provided"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Printers: {client.printers?.length || 0}
                        </p>
                      </button>

                      {/* Delete Client */}
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="mr-3 rounded-full p-2 text-red-500 hover:bg-red-50"
                        title="Delete client"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* STEP ANIMATION */}
          <div className="mx-4 mt-6">
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const completed =
                  index === 0 || (index === 1 && licenseCompleted);

                const active = index === 1 && !licenseCompleted;

                return (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 ${
                        completed || active
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {completed ? <Check size={18} /> : index + 1}
                    </div>

                    <span
                      className={`text-sm transition-colors duration-300 ${
                        completed || active
                          ? "font-semibold text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mb-4 mt-4 h-1 w-full rounded-full bg-gray-200">
              <div
                className="h-1 rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${licenseCompleted ? 200 / 3 : 100 / 3}%`,
                }}
              />
            </div>
          </div>

          {/* LICENSE VALIDITY */}
          <div className="mx-4 my-2 mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-xl font-semibold">License Validity</h3>

            <p className="mt-1 text-sm text-gray-500">
              Set the exact start and end of the license period.
            </p>

            {/* ISSUE DATE */}
            <h2 className="my-2 text-lg font-semibold">Issue Date & Time</h2>

            <div className="m-2 flex gap-3">
              <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-2">
                <p className="text-sm text-gray-400">Date</p>

                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full min-w-0 bg-transparent font-medium outline-none"
                />
              </div>

              <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-2">
                <p className="text-sm text-gray-400">Time</p>

                <input
                  type="time"
                  value={issueTime}
                  onChange={(e) => setIssueTime(e.target.value)}
                  className="w-full min-w-0 bg-transparent font-medium outline-none"
                />
              </div>
            </div>

            {/* EXPIRY DATE */}
            <h2 className="my-2 text-lg font-semibold">Expiry Date & Time</h2>

            <div className="m-2 flex gap-3">
              <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-2">
                <p className="text-sm text-gray-400">Date</p>

                <input
                  type="date"
                  min={issueDate}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full min-w-0 bg-transparent font-medium outline-none"
                />
              </div>

              <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-2">
                <p className="text-sm text-gray-400">Time</p>

                <input
                  type="time"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="w-full min-w-0 bg-transparent font-medium outline-none"
                />
              </div>
            </div>

            {/* LICENSE DURATION */}
            <div className="my-3 flex min-w-full items-center rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-2 rounded-lg">
                <CalendarClock className="shrink-0 text-blue-600" />

                <h2 className="font-semibold">License Duration</h2>
              </div>

              <div className="ml-auto text-right text-sm font-medium text-gray-600">
                {duration}
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          {/* BUTTONS */}
          <div className="my-2 flex justify-end p-4">
            <button
              onClick={handleSaveContinue}
              disabled={licenseCompleted}
              className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {licenseCompleted ? "License Saved" : "Save & Continue"}
            </button>
          </div>

          {/* Generated license confirmation */}
        </div>
      </div>
    </div>
  );
};

export default License;
