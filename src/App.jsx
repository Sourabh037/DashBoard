import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Home from "./Home";
import Client from "./Client";
import License from "./License";
import GenerateLicense from "./GenerateLicense";
import History from "./History";
import { LicenseProvider } from "./context/LicenseContext";

const App = () => {
  const [activePage, setActivePage] = useState("Home");

  // Pass the newly saved client to License
  const [clientForLicense, setClientForLicense] = useState(null);

  // Pass the newly created pending license to GenerateLicense
  const [licenseForGenerate, setLicenseForGenerate] = useState(null);

  const [remakeRequest, setRemakeRequest] = useState(null);

  const handleRemake = (request) => {
    setRemakeRequest(request);
    setActivePage("Generate Licenses");
  };

  // Normal sidebar navigation
  const handleNavigate = (page) => {
    setClientForLicense(null);
    setLicenseForGenerate(null);
    setRemakeRequest(null);
    setActivePage(page);
  };

  // Client -> License
  const handleClientSaved = (client) => {
    setClientForLicense(client);
    setActivePage("License");
  };

  // License -> Generate Licenses
  const handleLicenseSaved = (license) => {
    setLicenseForGenerate(license);
    setActivePage("Generate Licenses");
  };

  return (
    <div>
      <Navbar />

      <LicenseProvider>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar activePage={activePage} onNavigate={handleNavigate} />

          <main className="min-w-0 flex-1">
            {activePage === "Home" && <Home />}

            {activePage === "Client" && (
              <Client onClientSaved={handleClientSaved} />
            )}

            {activePage === "License" && (
              <License
                initialClient={clientForLicense}
                onContinue={handleLicenseSaved}
              />
            )}

            {activePage === "Generate Licenses" && (
              <GenerateLicense
                initialLicense={licenseForGenerate}
                remakeRequest={remakeRequest}
                onRemakeLoaded={() => setRemakeRequest(null)}
              />
            )}

            {activePage === "History" && <History onRemake={handleRemake} />}
          </main>
        </div>
      </LicenseProvider>
    </div>
  );
};

export default App;
