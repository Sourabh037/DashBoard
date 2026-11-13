import { X, UserRound } from "lucide-react";

const ProfileFloatingPanel = ({ onClose }) => {
  return (
    <div
      className="fixed bottom-4 top-20 z-100 overflow-y-auto
                 rounded-xl border border-gray-200 bg-white p-5
                 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
      style={{
        left: "max(25vw, 12rem)",
        width: "min(37.5vw, 420px)",
        minWidth: "280px",
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Profile Details
        </h2>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={22} />
        </button>
      </div>

      {/* User Information */}
      <div className="mb-6 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <UserRound size={42} className="text-blue-600" />
        </div>

        <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
          Sourabh
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Administrator
        </p>
      </div>

      <hr className="mb-5 dark:border-gray-700" />

      {/* Personal Details */}
      <div className="space-y-5">
        <div>
          <label className="text-sm text-gray-500">Full Name</label>
          <p className="font-medium text-gray-900 dark:text-white">Sourabh</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Email Address</label>
          <p className="break-all font-medium text-gray-900 dark:text-white">
            Not provided
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Phone Number</label>
          <p className="font-medium text-gray-900 dark:text-white">
            Not provided
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Role</label>
          <p className="font-medium text-gray-900 dark:text-white">
            Administrator
          </p>
        </div>
      </div>

      {/* Edit Profile */}
      <button
        className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3
                   font-semibold text-white hover:bg-blue-700"
      >
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileFloatingPanel;
