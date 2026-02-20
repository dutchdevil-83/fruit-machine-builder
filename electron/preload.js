const { contextBridge, ipcRenderer } = require('electron');
const { execSync } = require('child_process');

/**
 * Preload script — runs in a sandboxed context.
 * Exposes safe APIs to the renderer process.
 */

// EDR / Corporate device detection (Node.js context only)
function detectEDRProcesses() {
  const knownEDR = [
    'csfalconservice',    // CrowdStrike Falcon
    'csfalconcontainer',  // CrowdStrike Container
    'cbdefense',          // Carbon Black Defense
    'cbagent',            // Carbon Black Agent
    'sentinelagent',      // SentinelOne
    'sentinelone',        // SentinelOne
    'mssense',            // Microsoft Defender ATP
    'mdatp',              // Microsoft Defender ATP (legacy)
    'cyoptics',           // Cybereason
    'taniumclient',       // Tanium
  ];

  const detected = [];

  try {
    // Windows: tasklist
    const tasks = execSync('tasklist /FO CSV /NH', { encoding: 'utf-8', timeout: 5000 });
    const lower = tasks.toLowerCase();

    for (const proc of knownEDR) {
      if (lower.includes(proc)) {
        detected.push(proc);
      }
    }
  } catch {
    // tasklist failed — possibly Linux/Mac or restricted
  }

  // Check domain join (Windows)
  let isDomainJoined = false;
  try {
    const domain = execSync('echo %USERDNSDOMAIN%', { encoding: 'utf-8', shell: true, timeout: 3000 }).trim();
    if (domain && domain !== '%USERDNSDOMAIN%' && domain.length > 0) {
      isDomainJoined = true;
    }
  } catch {
    // Not Windows or restricted
  }

  return {
    edrProcesses: detected,
    isDomainJoined,
    isCorporate: detected.length > 0 || isDomainJoined,
  };
}

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Check if this device appears to be corporate/managed.
   * Returns { edrProcesses: string[], isDomainJoined: boolean, isCorporate: boolean }
   */
  detectCorporateDevice: () => detectEDRProcesses(),

  /**
   * Get platform info
   */
  getPlatform: () => process.platform,
  getVersion: () => process.versions.electron,
});
