import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FilePlus,
  History,
  UserRound,
  Moon,
  ToggleLeft,
  ToggleRight,
  User,
  ShieldCog,
  LogOut,
} from "lucide-react";

import { useState } from "react";

const menuItems = [
  { name: "Home", icon: LayoutDashboard },
  { name: "Client", icon: Users },
  { name: "License", icon: ShieldCheck },
  { name: "Generate Licenses", icon: FilePlus },
  { name: "History", icon: History },
];

const Sidebar = ({ onNavigate, activePage }) => {
  const [openProfile, setOpenProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <aside className="flex min-h-screen w-1/4 min-w-48 flex-col border-r border-gray-300 bg-gray-700 p-3">
      <h3 className="px-3 py-3 font-bold text-white">MAIN MENU</h3>

      {/* Navigation - UNCHANGED */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name)}
              className={`flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                activePage === item.name
                  ? "bg-blue-100 text-blue-700"
                  : "text-white hover:bg-blue-400"
              }`}
            >
              <Icon size={22} className="shrink-0" />
              <span className="min-w-0 wrap-break-words font-medium">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="relative mt-auto">
        {/* Profile Dropdown - Opens Upward */}
        {openProfile && (
          <div className="absolute bottom-full left-0 mb-3 w-full min-w-46 rounded-xl border border-gray-200 bg-white px-2 py-2 shadow-xl">
            {/* User Image and Name */}
            <div className="flex flex-col items-center border-b border-gray-200 pb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <UserRound size={35} className="text-blue-600" />
              </div>

              <h2 className="mt-2 text-lg font-semibold text-gray-800">
                Sourabh
              </h2>

              <p className="text-xs text-gray-500">Administrator</p>
            </div>

            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="mt-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-blue-100 hover:text-blue-700"
            >
              <span className="flex items-center gap-3">
                <Moon size={19} />
                Dark Mode
              </span>

              {darkMode ? (
                <ToggleRight size={24} className="text-blue-600" />
              ) : (
                <ToggleLeft size={24} className="text-gray-400" />
              )}
            </button>

            {/* Profile Details */}
            <button
              onClick={() => {
                setOpenProfile(false);
                onNavigate("Profile Details");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-blue-100 hover:text-blue-700"
            >
              <User size={19} />
              Profile Details
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                setOpenProfile(false);
                onNavigate("Settings");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-blue-100 hover:text-blue-700"
            >
              <ShieldCog size={19} />
              Settings
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                setOpenProfile(false);
                // Add your logout function here
                console.log("Logout clicked");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut size={19} />
              Log Out
            </button>
          </div>
        )}

        {/* Profile Button */}
        <button
          onClick={() => setOpenProfile(!openProfile)}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-white transition-colors hover:bg-blue-400"
        >
          <span className="rounded-full bg-gray-200 p-2">
            <UserRound size={25} className="text-blue-600" />
          </span>

          <span className="font-medium">Profile</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
