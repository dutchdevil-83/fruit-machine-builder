/**
 * Device Detector — identifies corporate/managed device indicators
 * to warn users before generating EXE files that could trigger EDR alerts.
 *
 * NOTE: Most of these checks only work in Electron (Node.js context).
 * In browser context, we can only do limited heuristic checks.
 */

export type DeviceStatus = 'personal' | 'managed' | 'unknown';

export interface DeviceCheckResult {
  status: DeviceStatus;
  detectedSoftware: string[];
  warnings: string[];
}

/**
 * Browser-safe heuristic checks.
 * Full checks require Electron's Node.js context.
 */
export function detectCorporateDevice(): DeviceCheckResult {
  const detectedSoftware: string[] = [];
  const warnings: string[] = [];

  // Check 1: navigator.managed (Corporate Policy Enrollment)
  if ('managed' in navigator) {
    detectedSoftware.push('Browser Enterprise Policy');
    warnings.push('Your browser is managed by an organization.');
  }

  // Check 2: WebGL renderer string (sometimes contains corporate VM identifiers)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (typeof renderer === 'string') {
          // Virtual machine indicators
          const vmIndicators = ['VMware', 'VirtualBox', 'Hyper-V', 'Citrix', 'QEMU'];
          for (const vm of vmIndicators) {
            if (renderer.toLowerCase().includes(vm.toLowerCase())) {
              detectedSoftware.push(`Virtual Machine (${vm})`);
              warnings.push(`Running in a virtual machine (${vm}) — likely a corporate environment.`);
            }
          }
        }
      }
    }
  } catch {
    // WebGL not available
  }

  // Check 3: Known corporate domain patterns in location
  try {
    const hostname = window.location.hostname;
    const corporatePatterns = ['.corp.', '.internal.', '.local', '.ad.', '.domain.'];
    for (const pattern of corporatePatterns) {
      if (hostname.includes(pattern)) {
        detectedSoftware.push('Corporate Network');
        warnings.push(`Running on what appears to be a corporate network (${hostname}).`);
        break;
      }
    }
  } catch {
    // No access
  }

  // Check 4: If running in Electron, use the preload API for real process scanning
  const electronAPI = (window as any).electronAPI;
  if (electronAPI?.detectCorporateDevice) {
    try {
      const result = electronAPI.detectCorporateDevice();
      if (result.isCorporate) {
        if (result.isDomainJoined) {
          detectedSoftware.push('Active Directory Domain');
          warnings.push('This device is joined to a corporate Active Directory domain.');
        }
        for (const proc of result.edrProcesses) {
          detectedSoftware.push(`EDR: ${proc}`);
          warnings.push(`Security software detected: ${proc}. EXE generation may trigger alerts.`);
        }
      }
    } catch {
      // Electron API call failed
    }
  }

  // Determine status
  let status: DeviceStatus = 'personal';
  if (detectedSoftware.length > 0) {
    status = 'managed';
  } else if (!electronAPI) {
    status = 'unknown'; // Can't fully determine without Electron
  }

  return { status, detectedSoftware, warnings };
}

/**
 * Electron-only checks (called from Electron main/preload process).
 * These check for actual EDR processes on the system.
 */
export const EDR_PROCESS_NAMES = [
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
  'cortex xdr',         // Palo Alto Cortex XDR
];
