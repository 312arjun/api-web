"use client";
import React, { useState, useEffect } from "react";

type APIStatus = {
  isConnected: boolean;
  data: any;
  error: string | null;
  isChecking: boolean;
  isExpanded: boolean;
  lastChecked: Date | null;
};

type APIStatusState = Record<number, APIStatus>;

// Sample API endpoints - replace with your actual endpoints
const apis = [
  { id: 1, name: "Users API", url: "http://192.168.10.4:3000/api/projects" },
  { id: 2, name: "Products API", url: "https://api.example.com/products" },
  { id: 3, name: "Orders API", url: "http://192.168.10.4:3000/api/health" },
  { id: 4, name: "Authentication API", url: "https://api.example.com/auth" }
];

const APIStatusMonitor = () => {
  const [apiStatuses, setApiStatuses] = useState<APIStatusState>(
    apis.reduce((acc, api) => {
      acc[api.id] = {
        isConnected: false,
        data: null,
        error: null,
        isChecking: false,
        isExpanded: false,
        lastChecked: null,
      };
      return acc;
    }, {} as APIStatusState)
  );

  // State to control whether monitoring is active
  const [monitorActive, setMonitorActive] = useState<boolean>(true);

  // Function to run a CLI command via the API route
  const runCLICommand = async (action: "connect" | "connect") => {
    try {
      const response = await fetch("/api/run-cli", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.error || "Unknown error");
      }
      const result = await response.json();
      console.log("CLI command result:", result);
      alert(`Command Output:\n${result.stdout || result.error}`);
    } catch (error) {
      console.error("Error running CLI command:", error);
      alert("Error running CLI command. Check the console for details.");
    }
  };

  const checkAPIStatus = async (api: { id: number; name?: string; url: string }) => {
    setApiStatuses((prev) => ({
      ...prev,
      [api.id]: { ...prev[api.id], isChecking: true }
    }));

    try {
      const response = await fetch(api.url);
      if (response.ok) {
        const jsonData = await response.json();
        setApiStatuses((prev) => ({
          ...prev,
          [api.id]: {
            ...prev[api.id],
            isConnected: true,
            data: jsonData,
            error: null,
            isChecking: false,
            lastChecked: new Date()
          }
        }));
      } else {
        throw new Error("API request failed");
      }
    } catch (err) {
      setApiStatuses((prev) => ({
        ...prev,
        [api.id]: {
          ...prev[api.id],
          isConnected: false,
          data: null,
          error: "Unable to connect to API",
          isChecking: false,
          lastChecked: new Date()
        }
      }));
    }
  };

  const checkAllAPIs = () => {
    apis.forEach(api => checkAPIStatus(api));
  };

  useEffect(() => {
    if (monitorActive) {
      checkAllAPIs();
      const interval = setInterval(checkAllAPIs, 30000);
      return () => clearInterval(interval);
    }
  }, [monitorActive]);

  const toggleExpand = (apiId: number) => {
    setApiStatuses(prev => ({
      ...prev,
      [apiId]: { ...prev[apiId], isExpanded: !prev[apiId].isExpanded }
    }));
  };

  // Toggle monitor state and run the proper command
  const toggleMonitor = async () => {
    if (monitorActive) {
      // When active, disconnect
      await runCLICommand("connect");
      setMonitorActive(false);
    } else {
      // When inactive, connect
      await runCLICommand("connect");
      setMonitorActive(true);
      checkAllAPIs(); // Optionally trigger an immediate API check
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Server icon */}
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span className="text-xl text-black font-semibold">API Status Dashboard</span>
            </div>
            <div className="flex gap-2">
              {/* Refresh Button */}
              <button
                onClick={checkAllAPIs}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh APIs"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {/* Connect/Disconnect Button */}
              <button
                onClick={toggleMonitor}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={monitorActive ? "Disconnect" : "Connect"}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {monitorActive ? (
                    // Disconnect icon (example: power off)
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-1.414 1.414A8 8 0 015.636 16.95l-1.414 1.414M12 8v4m0 4h.01" />
                  ) : (
                    // Connect icon (example: power on)
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.75 12a5.25 5.25 0 0110.5 0m-10.5 0H4m13.5 0h2.25" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* API Status Cards */}
        <div className="grid gap-4">
          {apis.map(api => {
            const status = apiStatuses[api.id];
            return (
              <div key={api.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpand(api.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`
                        relative flex items-center justify-center
                        w-10 h-10 rounded-full
                        ${status.isConnected ? 'bg-green-100' : 'bg-red-100'}
                        transition-colors duration-500
                      `}>
                        <div className={`
                          absolute inset-0 rounded-full
                          ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}
                          animate-pulse opacity-20
                        `} />
                        {status.isConnected ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{api.name}</h3>
                        <p className="text-sm text-gray-500">{api.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${status.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {status.isConnected ? 'Secured' : 'Failed'}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${status.isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Expanded Content */}
                {status.isExpanded && (
                  <div className="border-t p-4 space-y-4">
                    {status.lastChecked && (
                      <p className="text-sm text-gray-500">Last checked: {status.lastChecked.toLocaleTimeString()}</p>
                    )}
                    {status.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{status.error}</p>
                      </div>
                    )}
                    {status.data && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Response Data</h4>
                        <div className="bg-gray-900 p-4 rounded-lg overflow-auto">
                          <pre className="text-sm text-gray-100">{JSON.stringify(status.data, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Secured APIs</div>
            <div className="text-2xl font-bold text-gray-800">
              {Object.values(apiStatuses).filter(status => status.isConnected).length} / {apis.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Average Response Time</div>
            <div className="text-2xl font-bold text-gray-800">156ms</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Total Requests</div>
            <div className="text-2xl font-bold text-gray-800">{apis.length * 2} / min</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIStatusMonitor;
