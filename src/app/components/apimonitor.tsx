"use client";
import React, { useState, useEffect } from "react";

type APIStatus = {
  isConnected: boolean;
  data: any;
  error: string | null;
  isChecking: boolean;
  isExpanded: boolean;
  lastChecked: Date | null;
  responseTime: number | null;
  showRawData: boolean;
};

type APIStatusState = Record<number, APIStatus>;

const apis = [
  { id: 1, name: "Projects API", url: "http://172.31.14.62:3005/api/projects", isSecured: true },
  { id: 2, name: "Users API", url: "http://34.211.221.154:443/api/users", isSecured: false },
  { id: 3, name: "System Health API", url: "http://34.211.221.154:443/api/health", isSecured: false },
  { id: 4, name: "Authentication API", url: "http://172.31.14.62:3005/api/auth", isSecured: true },
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
        responseTime: null,
        showRawData: false,
      };
      return acc;
    }, {} as APIStatusState)
  );

  // State to control whether monitoring is active
  const [monitorActive, setMonitorActive] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const checkAPIStatus = async (api: { id: number; name?: string; url: string; isSecured?: boolean }) => {
    setApiStatuses((prev) => ({
      ...prev,
      [api.id]: { ...prev[api.id], isChecking: true },
    }));

    // Simulate network delay (3-5 seconds)
    const delay = Math.random() * 2000 + 3000; // 3-5 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    const responseTime = Math.floor(Math.random() * 150 + 50);

    const responseData: Record<number, any> = {
      1: { projects: ["Project Alpha", "Project Beta", "Project Gamma"], total: 3, status: "active", encrypted: true },
      2: { users: ["john.doe@company.com", "jane.smith@company.com"], active: 2, total: 5, encrypted: false },
      3: { status: "healthy", uptime: "99.9%", server: "online", cpu: "45%", memory: "62%", encrypted: false },
      4: { authenticated: true, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", expires: "2h", encrypted: true }
    };

    // Secured APIs (id 1 and 4) connect successfully, unsecured ones show as connected but not secured
    setApiStatuses((prev) => ({
      ...prev,
      [api.id]: {
        ...prev[api.id],
        isConnected: true,
        data: responseData[api.id],
        error: null,
        isChecking: false,
        lastChecked: new Date(),
        responseTime: responseTime,
      },
    }));
  };

  const calculateAverageResponseTime = () => {
    const responseTimes = Object.values(apiStatuses)
      .map((status) => status.responseTime)
      .filter((time): time is number => time !== null); // Filter out null values
  
    if (responseTimes.length === 0) return "N/A";
  
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    return `${Math.round(avgTime)} ms`;
  };

  const calculateTotalRequestsPerMinute = () => {
    const intervalInSeconds = 10; // Change this if you modify the interval
    return apis.length * (60 / intervalInSeconds);
  };
  

  const checkAllAPIs = () => {
    console.log("Checking all APIs");
    apis.forEach((api) => checkAPIStatus(api));
  };

  const toggleExpand = (apiId: number) => {
    setApiStatuses((prev) => ({
      ...prev,
      [apiId]: { ...prev[apiId], isExpanded: !prev[apiId].isExpanded },
    }));
  };

  const toggleRawData = (apiId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent expanding/collapsing when clicking toggle
    setApiStatuses((prev) => ({
      ...prev,
      [apiId]: { ...prev[apiId], showRawData: !prev[apiId].showRawData },
    }));
  };

  // Function to generate Wireshark-like packet data
  const generateEncryptedData = (data: any): string => {
    const timestamp = new Date().toISOString();
    const srcPort = Math.floor(Math.random() * 10000 + 50000);
    const dstPort = 443;
    const seqNum = Math.floor(Math.random() * 1000000000);

    // Generate random hex bytes that look like encrypted network packets
    const generateHexLine = (offset: number) => {
      const hexBytes = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join(' ');
      const ascii = Array.from({ length: 16 }, () =>
        String.fromCharCode(Math.floor(Math.random() * 94) + 33)
      ).join('').replace(/[<>]/g, '.');
      return `${offset.toString(16).padStart(4, '0')}  ${hexBytes}  ${ascii}`;
    };

    const packetLines = Array.from({ length: 8 }, (_, i) => generateHexLine(i * 16)).join('\n');

    return `Frame 1: 324 bytes on wire (2592 bits), 324 bytes captured (2592 bits)
Ethernet II, Src: ${Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':')}, Dst: ${Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':')}
Transmission Control Protocol, Src Port: ${srcPort}, Dst Port: ${dstPort}, Seq: ${seqNum}, Len: 256
Transport Layer Security
    TLSv1.3 Record Layer: Application Data Protocol
        Content Type: Application Data (23)
        Version: TLS 1.2 (0x0303)
        Length: 256
        Encrypted Application Data: ${Array.from({length: 64}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join('')}

${packetLines}

[Decrypted payload: ${JSON.stringify(data).length} bytes]`;
  };

  const toggleMonitor = async () => {
    if (monitorActive) {
      // Disconnect: Reset all API statuses
      setMonitorActive(false);
      setShowToast(false);
      setApiStatuses(
        apis.reduce((acc, api) => {
          acc[api.id] = {
            isConnected: false,
            data: null,
            error: null,
            isChecking: false,
            isExpanded: false,
            lastChecked: null,
            responseTime: null,
            showRawData: false,
          };
          return acc;
        }, {} as APIStatusState)
      );
    } else {
      // Connect: Establish connection first (7-10 seconds), then check APIs (3-5 seconds each)
      setMonitorActive(true);
      setToastMessage("Establishing secure connection...");
      setShowToast(true);

      // Initial connection delay (7-10 seconds)
      const connectionDelay = Math.random() * 3000 + 7000; // 7-10 seconds
      await new Promise(resolve => setTimeout(resolve, connectionDelay));

      // Update toast message
      setToastMessage("Connection established! Checking APIs...");

      // Now start checking APIs
      checkAllAPIs();

      // Hide toast after a brief moment
      setTimeout(() => setShowToast(false), 2000);
    }
  };
  

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Server icon */}
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              {/* Connect/Disconnect Button */}
              <button
                onClick={toggleMonitor}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={monitorActive ? "Disconnect" : "Connect"}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {monitorActive ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v10" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.24 7.76a6 6 0 11-8.48 0" />
                      <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v10" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.24 7.76a6 6 0 11-8.48 0" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* API Status Cards */}
        <div className="grid gap-4">
          {apis.map((api) => {
            const status = apiStatuses[api.id];
            const isSecured = api.isSecured && status.isConnected;
            const isUnsecured = !api.isSecured && status.isConnected;

            return (
              <div key={api.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors bg-white" onClick={() => toggleExpand(api.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                          relative flex items-center justify-center
                          w-10 h-10 rounded-full
                          ${status.isChecking ? "bg-blue-100" : isSecured ? "bg-green-100" : isUnsecured ? "bg-yellow-100" : "bg-red-100"}
                          transition-colors duration-500
                        `}
                      >
                        <div
                          className={`
                            absolute inset-0 rounded-full
                            ${status.isChecking ? "bg-blue-500" : isSecured ? "bg-green-500" : isUnsecured ? "bg-yellow-500" : "bg-red-500"}
                            animate-pulse opacity-20
                          `}
                        />
                        {status.isChecking ? (
                          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : isSecured ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                        ) : isUnsecured ? (
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                      <span className={`text-sm font-medium ${status.isChecking ? "text-blue-600" : isSecured ? "text-green-600" : isUnsecured ? "text-yellow-600" : "text-red-600"}`}>
                        {status.isChecking ? "Connecting..." : isSecured ? "Secured" : isUnsecured ? "Unsecured" : "Not Connected"}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${status.isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Expanded Content */}
                {status.isExpanded && (
                  <div className="border-t border-gray-200 bg-white p-4 space-y-4 relative">
                    <div className="flex items-center justify-between">
                      {status.lastChecked && (
                        <p className="text-sm text-gray-500">Last checked: {status.lastChecked.toLocaleTimeString()}</p>
                      )}
                      {status.responseTime && (
                        <p className="text-sm text-gray-500">Latency: {status.responseTime}ms</p>
                      )}
                    </div>
                    {status.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{status.error}</p>
                      </div>
                    )}
                    {status.data && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">Response Data</h4>
                          {api.isSecured && (
                            <button
                              onClick={(e) => toggleRawData(api.id, e)}
                              className="px-3 py-1 text-xs font-medium rounded-md transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              {status.showRawData ? "Show Decrypted" : "Show Raw Data"}
                            </button>
                          )}
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg overflow-auto max-h-96 shadow-inner">
                          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                            {status.showRawData && api.isSecured
                              ? generateEncryptedData(status.data)
                              : JSON.stringify(status.data, null, 2)}
                          </pre>
                        </div>
                        {api.isSecured && !status.showRawData && (
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Data decrypted via secure tunnel</span>
                          </div>
                        )}
                        {api.isSecured && status.showRawData && (
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Encrypted payload as transmitted</span>
                          </div>
                        )}
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
            <div className="text-2xl font-bold text-green-600">
              {apis.filter(api => api.isSecured && apiStatuses[api.id]?.isConnected).length} / {apis.filter(api => api.isSecured).length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Encrypted endpoints</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Unsecured APIs</div>
            <div className="text-2xl font-bold text-yellow-600">
              {apis.filter(api => !api.isSecured && apiStatuses[api.id]?.isConnected).length} / {apis.filter(api => !api.isSecured).length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Public endpoints</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-sm text-gray-500">Average Response Time</div>
            <div className="text-2xl font-bold text-gray-800">{calculateAverageResponseTime()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIStatusMonitor;
