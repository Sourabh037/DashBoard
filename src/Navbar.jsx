import { ShieldUser, Bell } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="box-border flex w-full items-center bg-white px-2 py-1 border-gray-400 border-2 rounded-sm">
      <span className="text-white px-1 py-1 box-border rounded-lg bg-blue-600">
        <ShieldUser size={35} />
      </span>

      <div className="px-4">
        <h2 className="text-2xl text-black">LicenseHub</h2>
        <h3 className="text-black">License Management system</h3>
      </div>

      <div className="ml-auto flex items-center gap-4 mr-2">
        <button>
          <Bell size={25} />
        </button>
        
      </div>
    </nav>
  );
};

export default Navbar;