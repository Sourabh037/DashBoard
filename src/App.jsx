import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Home from "./Home";
import Client from "./Client";
import License from "./License";
import GenerateLicense from "./GenerateLicense";
import History from "./History";
import { LicenseProvider } from "./context/LicenseContext";
import ProfileFloatingPanel from "./ProfileFloatingPanel";

const App = () => {
  const [activePage, setActivePage] = useState("Home");

  // Pass the newly saved client to License
  const [clientForLicense, setClientForLicense] = useState(null);

  // Pass the newly created pending license to GenerateLicense
  const [licenseForGenerate, setLicenseForGenerate] = useState(null);

  const [remakeRequest, setRemakeRequest] = useState(null);

  const [showProfile, setShowProfile] = useState(false);

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

  // Dark mood
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("licensehub-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("licensehub-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("licensehub-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />

        <LicenseProvider>
          <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar
              activePage={activePage}
              onNavigate={handleNavigate}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onProfileDetails={() => setShowProfile(true)}
            />

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
              
              {showProfile && (
                <ProfileFloatingPanel onClose={() => setShowProfile(false)} />
              )}
            </main>
          </div>
        </LicenseProvider>
      </div>
    </div>
  );
};

export default App;
