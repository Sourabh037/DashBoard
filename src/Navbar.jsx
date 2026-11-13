import { ShieldUser, Bell } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="box-border flex w-full items-center rounded-sm border-2 border-gray-400 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-800">
      <span className="box-border rounded-lg bg-blue-600 px-1 py-1 text-white">
        <ShieldUser size={35} />
      </span>

      <div className="px-4">
        <h2 className="text-2xl text-black dark:text-white">LicenseHub</h2>

        <h3 className="text-black dark:text-gray-300">
          License Management system
        </h3>
      </div>

      <div className="ml-auto mr-2 flex items-center gap-4">
        <button className="text-gray-700 dark:text-gray-200">
          <Bell size={25} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
