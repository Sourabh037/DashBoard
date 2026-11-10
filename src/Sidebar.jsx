import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FilePlus,
  History,
  UserRound,
} from "lucide-react";

const menuItems = [
  { name: "Home", icon: LayoutDashboard },
  { name: "Client", icon: Users },
  { name: "License", icon: ShieldCheck },
  { name: "Generate Licenses", icon: FilePlus },
  { name: "History", icon: History },
];

const Sidebar = ({ onNavigate, activePage }) => {
  return (
    <aside className="flex min-h-screen w-1/4 min-w-48 flex-col border-r border-gray-300 bg-gray-700 p-3">
      <h3 className="px-3 py-3 font-bold text-white">MAIN MENU</h3>

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

      {/* User Profile at Bottom */}
      <button className="mt-auto flex w-full items-center gap-3 rounded-lg p-3 text-white hover:bg-blue-400">
        <span className="rounded-full bg-gray-200 p-2">
          <UserRound size={25} className="text-blue-600" />
        </span>
        <span className="font-medium">Profile</span>
      </button>
    </aside>
  );
};

export default Sidebar;
