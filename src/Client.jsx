import { useState, useEffect } from "react";
import {
  ChevronDown,
  Search,
  UserPlus,
  ListPlus,
  Check,
  X,
} from "lucide-react";
import { useLicenses } from "./context/useLicenses";

const FormField = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  maxLength,
}) => {
  return (
    <div className="mb-2 flex items-center">
      <label className="w-24 pl-4 text-sm font-semibold">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="min-w-0 flex-1 rounded-lg border px-2 py-2"
      />
    </div>
  );
};

const createEmptyPrinter = () => ({
  id: `${Date.now()}-${Math.random()}`,
  printername: "",
  serialNumber: "",
});

const readStorage = (key) => {
  try {
    if (typeof window === "undefined") return [];

    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const Client = () => {
  const steps = ["Client", "License", "Send"];
  const { addClient } = useLicenses();
  // Progress starts at 0%
  const [currentStep, setCurrentStep] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [clientListOpen, setClientListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientCompleted, setClientCompleted] = useState(false);
  // Temporary drafts
  const [draftClients, setDraftClients] = useState(() =>
    readStorage("draftClients"),
  );

  // LocalStorage persistence

  useEffect(() => {
    localStorage.setItem("draftClients", JSON.stringify(draftClients));
  }, [draftClients]);

  // Client information
  const [clientName, setClientName] = useState("");
  const [region, setRegion] = useState("");
  const [timeZone, setTimeZone] = useState("");

  // Contact information
  const [personName, setPersonName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");

  // Printer information
  const [printers, setPrinters] = useState([createEmptyPrinter()]);

  // Selected client information
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [permanentClientId, setPermanentClientId] = useState(null);

  // Clear form for new client
  const handleAddClient = () => {
    setClientName("");
    setRegion("");
    setTimeZone("");

    setPersonName("");
    setContactNo("");
    setEmail("");

    setPrinters([createEmptyPrinter()]);

    setSelectedClient(null);
    setSelectedDraftId(null);
    setPermanentClientId(null);
    setClientCompleted(false);
    setCurrentStep(0);
    setClientListOpen(false);
    setSearchTerm("");
    setIsOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setClientName("");
    setRegion("");
    setTimeZone("");

    setPersonName("");
    setContactNo("");
    setEmail("");

    setPrinters([createEmptyPrinter()]);

    setSelectedClient(null);
    setSelectedDraftId(null);
    setPermanentClientId(null);

    setCurrentStep(0);
  };

  // Add printer
  const handleAddPrinter = () => {
    setPrinters((prev) => [...prev, createEmptyPrinter()]);
  };

  // Update printer
  const handlePrinterChange = (id, field, value) => {
    setPrinters((prev) =>
      prev.map((printer) =>
        printer.id === id ? { ...printer, [field]: value } : printer,
      ),
    );
  };

  // Remove printer
  const handleRemovePrinter = (id) => {
    setPrinters((prev) => prev.filter((printer) => printer.id !== id));
  };

  // Get form information
  const getClientData = () => ({
    id: selectedDraftId || permanentClientId || Date.now(),

    name: clientName.trim(),
    region,
    timeZone,

    personName,
    contactNo,
    email,

    printers: printers.map((printer) => ({
      ...printer,
    })),

    permanentClientId,
  });

  // Save temporary draft
  const handleSaveClient = () => {
    if (!clientName.trim()) {
      alert("Please enter client name");
      return;
    }

    const clientData = getClientData();

    setDraftClients((prev) => {
      const exists = prev.some((draft) => draft.id === selectedDraftId);

      if (exists) {
        return prev.map((draft) =>
          draft.id === selectedDraftId ? clientData : draft,
        );
      }

      return [...prev, clientData];
    });

    setSelectedDraftId(clientData.id);
    setSelectedClient(clientData);

    alert("Client saved as temporary draft!");
  };

  // Validate before permanent saving
  const validatePermanentClient = () => {
    if (!clientName.trim()) {
      alert("Please enter client name.");
      return false;
    }

    // Proper name: letters and spaces, with common name punctuation
    const nameRegex = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;

    if (!nameRegex.test(clientName.trim())) {
      alert("Please enter a valid client name.");
      return false;
    }

    if (!personName.trim() || !nameRegex.test(personName.trim())) {
      alert("Please enter a valid contact person name.");
      return false;
    }

    // Exactly 10 digits
    if (!/^\d{10}$/.test(contactNo)) {
      alert("Contact number must contain exactly 10 digits.");
      return false;
    }

    // Valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email.trim())) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  // Save permanently and continue to License
  const handleSavePermanent = () => {
    if (!validatePermanentClient()) {
      return;
    }

    const permanentId =
      permanentClientId ||
      (!selectedDraftId && selectedClient ? selectedClient.id : Date.now());

    const clientData = {
      ...getClientData(),
      id: permanentId,
      permanentClientId: null,
      status: "pending_license",
    };

    // Add client to shared permanent client list
    addClient(clientData);

    // Remove temporary draft after permanent save
    if (selectedDraftId !== null) {
      setDraftClients((prev) =>
        prev.filter((draft) => draft.id !== selectedDraftId),
      );
    }

    setSelectedClient(clientData);
    setPermanentClientId(permanentId);
    setSelectedDraftId(null);
    setClientCompleted(true);
    setCurrentStep(0);

    alert("Client permanently saved successfully!");
  };

  // Select permanent client or temporary draft
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSelectedDraftId(client.id);
    setPermanentClientId(null);

    setClientName(client.name || "");
    setRegion(client.region || "");
    setTimeZone(client.timeZone || "");

    setPersonName(client.personName || "");
    setContactNo(client.contactNo || "");
    setEmail(client.email || "");

    setPrinters(
      client.printers?.length
        ? client.printers.map((printer) => ({ ...printer }))
        : [createEmptyPrinter()],
    );

    setClientListOpen(false);
    setSearchTerm("");
    setCurrentStep(0);
    setIsOpen(true);
  };

  // Delete permanent client or temporary draft
  const handleDeleteClient = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this draft?",
    );

    if (!confirmed) return;

    setDraftClients((prev) => prev.filter((draft) => draft.id !== id));

    if (selectedDraftId === id) {
      resetForm();
    }
  };

  // Search temporary drafts
  const filteredDrafts = draftClients.filter((draft) =>
    (draft.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4">
      {/* Headline */}
      <div>
        <h1 className="text-2xl font-bold">Client</h1>
        <h3 className="m-2">Create License</h3>
      </div>

      {/* Add Client / Client List / Country */}
      <div className="mb-5 mt-4 flex gap-4">
        {/* Add Client */}
        <button
          className="flex items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-2"
          onClick={handleAddClient}
        >
          <h3 className="px-2 font-semibold">Add Client</h3>
          <UserPlus size={18} />
        </button>

        {/* Searchable Client List */}
        <div className="relative flex-1">
          {/* Client List Button / Search */}
          {!clientListOpen ? (
            <button
              onClick={() => {
                setClientListOpen(true);
                setSearchTerm("");
              }}
              className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-2"
            >
              <h3 className="font-semibold">Client List</h3>
              <ChevronDown size={18} className="text-gray-500" />
            </button>
          ) : (
            <div className="flex w-full items-center gap-3 rounded-full border border-blue-400 bg-white px-4 py-2">
              <Search size={18} className="shrink-0 text-gray-500" />

              <input
                autoFocus
                type="text"
                placeholder="Search client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none"
              />

              <button
                onClick={() => {
                  setClientListOpen(false);
                  setSearchTerm("");
                }}
                className="text-gray-500 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Client List Dropdown */}
          {clientListOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-112.5 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-md">
              {/* Temporary Drafts */}
              {filteredDrafts.length > 0 && (
                <>
                  <p className="bg-gray-50 px-4 py-2 text-xs font-bold uppercase text-gray-500">
                    Temporary Drafts
                  </p>

                  {filteredDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className={`flex items-center justify-between border-b border-gray-100 px-4 py-3 hover:bg-gray-50 ${
                        selectedDraftId === draft.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <button
                        onClick={() => handleSelectClient(draft)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {draft.name || "Unnamed Client"}
                          </p>

                          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                            Draft
                          </span>
                        </div>

                        <p className="text-sm text-gray-500">
                          Region: {draft.region || "Not provided"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Printers: {draft.printers?.length || 0}
                        </p>
                      </button>

                      <button
                        onClick={() => handleDeleteClient(draft.id)}
                        className="ml-3 rounded-full p-2 text-red-500 hover:bg-red-50"
                        title="Delete draft"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Country */}
        <button className="flex flex-1 items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-2">
          <h3 className="font-semibold">Country</h3>
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Main Form */}
      {isOpen && (
        <div className="my-4 rounded-xl border border-gray-200 bg-white px-4 py-5">
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const completed = index === 0 && clientCompleted;

              return (
                <div
                  key={step}
                  className="z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      completed
                        ? "bg-blue-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {completed ? <Check size={20} /> : index + 1}
                  </div>

                  <span
                    className={`text-sm ${
                      completed
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
          <div className="mb-4 mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{
                width: clientCompleted ? "33.33%" : "0%",
              }}
            />
          </div>

          {/* Client Information Step */}
          {currentStep === 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Client Details */}
                <div className="rounded-lg bg-gray-50 p-2">
                  <h3 className="p-2 font-semibold">License Information</h3>

                  <FormField
                    label="License"
                    placeholder="Enter License name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />

                  <div className="mb-2 flex items-center gap-2">
                    <label className="w-24 pl-4 text-sm font-semibold">
                      Region
                    </label>

                    <div className="relative flex-1">
                      <input
                        placeholder="Enter Region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 pr-9"
                      />

                      <ChevronDown
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 pl-4 text-sm font-semibold">
                      Time Zone
                    </label>

                    <div className="relative flex-1">
                      <input
                        placeholder="Enter Time Zone"
                        value={timeZone}
                        onChange={(e) => setTimeZone(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 pr-9"
                      />

                      <ChevronDown
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="rounded-lg bg-gray-50 p-2">
                  <h3 className="p-2 font-semibold">
                    Client Contact Information
                  </h3>

                  <FormField
                    label="Person Name"
                    placeholder="Enter Person name"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                  />

                  <FormField
                    label="Contact No."
                    placeholder="Enter 10-digit number"
                    type="tel"
                    maxLength={10}
                    value={contactNo}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setContactNo(digits.slice(0, 10));
                    }}
                  />

                  <FormField
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Save Temporary Draft */}
              <button
                onClick={handleSaveClient}
                className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Save The Form
              </button>

              {/* Multiple Printers */}
              {printers.map((printer, index) => (
                <div
                  key={printer.id}
                  className="my-4 rounded-xl bg-gray-50 px-4 py-2"
                >
                  <div className="flex items-center justify-between py-2">
                    <h3 className="font-semibold">Printer {index + 1}</h3>

                    {/* Remove Printer */}
                    <button
                      onClick={() => handleRemovePrinter(printer.id)}
                      className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <FormField
                    label="PrinterName"
                    placeholder="Enter printer name"
                    value={printer.printername}
                    onChange={(e) =>
                      handlePrinterChange(
                        printer.id,
                        "printername",
                        e.target.value,
                      )
                    }
                  />

                  <FormField
                    label="Serial Number"
                    placeholder="Enter number"
                    value={printer.serialNumber}
                    onChange={(e) =>
                      handlePrinterChange(
                        printer.id,
                        "serialNumber",
                        e.target.value,
                      )
                    }
                  />
                </div>
              ))}

              {/* Add Printer */}
              <button
                className="mt-4 flex items-center rounded-full bg-green-400 px-4 py-1 text-black"
                onClick={handleAddPrinter}
              >
                Add Printer
                <ListPlus size={30} className="pl-2" />
              </button>

              {/* Save Permanently and Continue */}
              <button
                onClick={handleSavePermanent}
                className="mt-3 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Save & Continue to License
              </button>
            </>
          )}

          {currentStep === 0 && permanentClientId && (
            <button
              onClick={handleAddClient}
              className="mt-5 w-full rounded-lg bg-blue-600 px-8 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Add New Client
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Client;
