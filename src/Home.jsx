import {
  Search,
  Users,
  StickyNoteCheck,
  Clock10,
  MessageCircleDashedCheck,
  ArrowLeft,
} from "lucide-react";

import { useLicenses } from "./context/useLicenses";
import { useState } from "react";

const Home = () => {
  const {
    clients,
    activeLicenses,
    pendingLicenses,
    totalClients,
    pendingClientCount,
    totalExpiredCount,
    activeLicenseCount,
    expiringSoonCount,
    pendingLicenseCount,
  } = useLicenses();

  const [showFile, setShowFile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");

  // Calculate remaining license time
  const getRemainingTime = (license) => {
    if (!license?.expiryDate) return null;

    const expiry = new Date(
      `${license.expiryDate}T${license.expiryTime || "23:59"}`,
    );

    const now = new Date();
    const difference = expiry.getTime() - now.getTime();

    if (!Number.isFinite(difference)) return null;

    return difference / 86400000;
  };

  // Get client creation timestamp for sorting
  const getClientCreatedTime = (client) => {
    const timestamp = client.createdAt
      ? new Date(client.createdAt).getTime()
      : Number(client.id);

    return Number.isFinite(timestamp) ? timestamp : 0;
  };

  // Get clients according to selected dashboard category
  const getCategoryClients = () => {
    let result = [];

    // Total Clients: Newest to Oldest
    if (selectedCategory === "Total Clients") {
      result = [...clients].sort(
        (a, b) => getClientCreatedTime(b) - getClientCreatedTime(a),
      );
    }

    // Active License: Closest expiry first (more than 30 days)
    if (selectedCategory === "Active License") {
      result = activeLicenses
        .filter((license) => {
          const days = getRemainingTime(license);
          return days !== null && days > 30;
        })
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
        .map((license) => ({
          ...(clients.find((c) => c.id === license.clientId) ||
            license.client ||
            {}),
          license,
        }));
    }

    // Expiring Soon: Only licenses that have not expired
    if (selectedCategory === "Expiring Soon") {
      result = activeLicenses
        .filter((license) => {
          const days = getRemainingTime(license);

          return (
            license.status === "active" &&
            days !== null &&
            days > 0 &&
            days <= 30
          );
        })
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
        .map((license) => ({
          ...(clients.find((c) => c.id === license.clientId) ||
            license.client ||
            {}),
          license,
        }));
    }

    // Pending License: Newest to Oldest
    if (selectedCategory === "Pending License") {
      result = [...pendingLicenses]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .map((license) => ({
          ...(clients.find((c) => c.id === license.clientId) ||
            license.client ||
            {}),
          license,
        }));
    }

    return result;
  };

  const openCategory = (category) => {
    setSelectedCategory(category);
    setSearch("");
    setShowFile(true);
  };

  const filteredClients = getCategoryClients().filter((client) =>
    (client.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  // Dashboard view
  if (!showFile) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <h3 className="m-2">Welcome back! Here's your license overview.</h3>

        <div className="flex w-full min-w-0 items-center gap-2">
          <button
            onClick={() => openCategory("Total Clients")}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-6 text-left"
          >
            <Users size={35} className="text-blue-600" />
            <h3 className="font-semibold">Total Clients</h3>
            <p className="mt-2 text-2xl font-bold">{totalClients}</p>
          </button>

          <button
            onClick={() => openCategory("Active License")}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-6 text-left"
          >
            <StickyNoteCheck size={35} className="text-green-600" />
            <h3 className="font-semibold">Active License</h3>
            <p className="mt-2 text-2xl font-bold">{activeLicenseCount}</p>
          </button>
        </div>

        <div className="mt-2 flex w-full min-w-0 items-center gap-2">
          <button
            onClick={() => openCategory("Expiring Soon")}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-6 text-left"
          >
            <Clock10 size={35} className="text-red-500" />
            <h3 className="font-semibold">Expiring Soon</h3>
            <p className="mt-2 text-2xl font-bold">{expiringSoonCount}</p>
          </button>

          <button
            onClick={() => openCategory("Pending License")}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-6 text-left"
          >
            <MessageCircleDashedCheck size={35} className="text-green-400" />
            <h3 className="font-semibold">Pending License</h3>
            <p className="mt-2 text-2xl font-bold">{pendingLicenseCount}</p>
          </button>
        </div>

        {/* License Overview */}
        <div className="my-4 box-border rounded-lg border border-gray-200 bg-white px-3 py-4">
          <h2 className="font-semibold">License Overview</h2>

          <div className="mt-3 flex justify-between">
            <span className="text-gray-600">Total Clients</span>
            <span className="font-semibold">{totalClients}</span>
          </div>

          <div className="mt-2 flex justify-between">
            <span className="text-gray-600">Pending Clients</span>
            <span className="font-semibold">{pendingClientCount}</span>
          </div>

          <div className="mt-2 flex justify-between">
            <span className="text-gray-600">Total Expired</span>
            <span className="font-semibold">{totalExpiredCount}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="my-4 box-border rounded-lg border border-gray-200 bg-white px-2 py-4">
          <h2 className="font-semibold">Recent Activity</h2>

          <p className="mt-3 text-sm text-gray-500">
            Your license activity will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Client list view
  return (
    <div className="p-4">
      {/* Headline and Back */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{selectedCategory}</h1>
          <p className="m-2 text-gray-500">
            All available clients ({filteredClients.length})
          </p>
        </div>

        <button
          onClick={() => {
            setShowFile(false);
            setSearch("");
          }}
          className="rounded-lg border bg-white p-2"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Search */}
      <div className="mt-4 flex items-center gap-3 rounded-lg border bg-white px-3 py-3">
        <Search size={20} className="text-gray-500" />

        <input
          type="text"
          placeholder="Search client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* Client List */}
      <div className="mt-4 space-y-3">
        {filteredClients.length === 0 ? (
          <p className="rounded-lg bg-white p-5 text-center text-gray-500">
            No clients found.
          </p>
        ) : (
          filteredClients.map((client, index) => {
            const license =
              client.license ||
              activeLicenses.find((item) => item.clientId === client.id);

            const days = license ? getRemainingTime(license) : null;

            return (
              <div
                key={`${client.id}-${index}`}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold">
                    {index + 1}. {client.name || "Unnamed Client"}
                  </h3>

                  {days !== null && days >= 0 && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        days <= 30
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {`${Math.ceil(days)} days left`}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Region:</span>{" "}
                    {client.region || "Not provided"}
                  </p>

                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {client.email || "Not provided"}
                  </p>

                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {client.contactNo || "Not provided"}
                  </p>

                  <p>
                    <span className="font-semibold">Expiry Date:</span>{" "}
                    {license?.expiryDate || "Not generated"}
                  </p>

                  <p>
                    <span className="font-semibold">Time Remaining:</span>{" "}
                    {days === null
                      ? "Not available"
                      : days <= 0
                        ? "Expired"
                        : `${Math.ceil(days)} Days`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
