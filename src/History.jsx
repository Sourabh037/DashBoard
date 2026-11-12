import { Search, History as HistoryIcon, Pencil } from "lucide-react";
import { useState } from "react";
import { useLicenses } from "./context/useLicenses";

const History = ({ onRemake }) => {
  const { clients, activeLicenses } = useLicenses();
  const [search, setSearch] = useState("");

  // Same expiry logic as LicenseContext
  const getDaysLeft = (license) => {
    if (!license?.expiryDate) return null;

    const expiry = new Date(
      `${license.expiryDate}T${license.expiryTime || "23:59"}`,
    );

    const difference = expiry.getTime() - new Date().getTime();

    if (!Number.isFinite(difference)) return null;

    return difference / 86400000;
  };

  // Get expired licenses and their clients
  const expiredClients = activeLicenses
    .filter((license) => {
      const daysLeft = getDaysLeft(license);

      return license.status === "active" && daysLeft !== null && daysLeft < 0;
    })
    .map((license) => {
      const client =
        clients.find((item) => item.id === license.clientId) ||
        license.client ||
        {};

      return {
        ...client,
        license,
      };
    });

  // Search expired clients
  const filteredClients = expiredClients.filter((client) =>
    [client.name, client.region, client.email, client.contactNo].some((value) =>
      (value || "").toLowerCase().includes(search.toLowerCase()),
    ),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">History</h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's your expired client history.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm sm:w-72">
          <Search size={20} className="shrink-0 text-gray-400" />

          <input
            type="text"
            placeholder="Search client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 outline-none"
          />
        </div>
      </div>

      {/* History Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {filteredClients.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-4 rounded-full bg-blue-50 p-4">
              <HistoryIcon size={35} className="text-blue-500" />
            </div>

            <h2 className="text-lg font-semibold text-gray-700">
              {expiredClients.length === 0
                ? "No Expired Clients Yet"
                : "No Matching Clients"}
            </h2>

            <p className="mt-2 max-w-sm text-sm text-gray-400">
              {expiredClients.length === 0
                ? "Your expired client records will appear here once a license expires."
                : "Try searching with another client name."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-237.5">
              {/* Table Header */}
              <div className="grid grid-cols-[60px_1.2fr_1fr_1fr_1.5fr_1fr_110px] items-center gap-4 bg-gray-700 px-5 py-4 text-sm font-semibold text-white">
                <span>S.No.</span>
                <span>Name</span>
                <span>Region</span>
                <span>License</span>
                <span>Email</span>
                <span>Number</span>
                <span>Action</span>
              </div>

              {/* Expired Client List */}
              {filteredClients.map((client, index) => (
                <div
                  key={`${client.license.id}-${index}`}
                  className="grid grid-cols-[60px_1.2fr_1fr_1fr_1.5fr_1fr_110px] items-center gap-4 border-b border-gray-100 px-5 py-4 text-sm transition-colors hover:bg-gray-50"
                >
                  {/* Serial Number */}
                  <span className="font-semibold text-gray-500">
                    {index + 1}
                  </span>

                  {/* Name */}
                  <span className="font-semibold text-gray-800">
                    {client.name || "Unnamed Client"}
                  </span>

                  {/* Region */}
                  <span className="text-gray-600">
                    {client.region || "Not provided"}
                  </span>

                  {/* License Expiry */}
                  <span className="text-red-600">
                    {client.license.expiryDate || "Not available"}
                  </span>

                  {/* Email */}
                  <span className="break-all text-gray-600">
                    {client.email || "Not provided"}
                  </span>

                  {/* Number */}
                  <span className="text-gray-600">
                    {client.contactNo || "Not provided"}
                  </span>

                  {/* Remake Button */}
                  <div className="relative flex justify-center">
                    <button
                      onClick={() =>
                        onRemake({
                          requestId: `${client.license.id}-${Date.now()}`,
                          license: client.license,
                          client: {
                            ...client,
                            license: undefined,
                          },
                        })
                      }
                      aria-label="Remake license"
                      className="group relative flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white"
                    >
                      <Pencil size={17} />
                      <span className="font-medium">Remake</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
