import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Home from "./Home";
import Client from "./Client";
import License from "./License";
import GenerateLicense from "./GenerateLicense";
import { LicenseProvider } from "./context/LicenseContext";

const App = () => {
  const [activePage, setActivePage] = useState("Home");

  return (
    <div>
      <Navbar />
      <LicenseProvider>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar activePage={activePage} onNavigate={setActivePage} />
          <main className="min-w-0 flex-1">
            {activePage === "Home" && <Home />}

            {activePage === "Client" && <Client />}

            {activePage === "License" && <License />}

            {activePage === "Generate Licenses" && <GenerateLicense />}

            {activePage === "History" && (
              <h1 className="p-6 text-2xl font-bold">History</h1>
            )}
          </main>
        </div>
      </LicenseProvider>
    </div>
  );
};

export default App;
