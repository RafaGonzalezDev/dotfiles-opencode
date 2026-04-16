import React, { useState } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { gatherSystemInfo, getBlockingSystemFailures, getSystemChecks } from './checks/system.js';
import { checkOpenCode } from './checks/opencode.js';
import { detectConfig } from './detect/config.js';
import { createBackup, listRecentBackups, restoreBackup } from './backup/index.js';
import { listFrameworks } from './frameworks/index.js';
import { installConfig } from './install/index.js';
import { verifyInstallation } from './verify/index.js';
import { WelcomeScreen } from './ui/welcome.js';
import { SystemCheckScreen } from './ui/system-check.js';
import { OpenCodeInstallScreen } from './ui/opencode-install.js';
import { OpenCodeUpdateScreen } from './ui/opencode-update.js';
import { ConflictResolutionScreen } from './ui/conflict-resolution.js';
import { InstallationProgressScreen } from './ui/installation-progress.js';
import { SummaryScreen } from './ui/summary.js';
import { ManualInstallScreen } from './ui/manual-install.js';
import { PrerequisitesBlockedScreen } from './ui/prerequisites-blocked.js';
import { RecentBackupsScreen } from './ui/recent-backups.js';
import { DifferencesScreen } from './ui/differences.js';
import { InstallConfirmationScreen } from './ui/install-confirmation.js';
import { FrameworkSelectionScreen } from './ui/framework-selection.js';
import { installHomebrew } from './installers/homebrew.js';
import { getOpenCodeInstallCommand, installOpenCode, updateOpenCode } from './installers/opencode.js';
import { MANAGED_CONFIG_ENTRIES } from './utils/managed-config.js';
import type {
  BackupEntry,
  BackupResult,
  CheckResult,
  ConfigDetectionResult,
  FrameworkDefinition,
  InstallResult,
  OpenCodeInstallMethod,
  OpenCodeStatus,
  OpenCodeUpdateResult,
  SystemInfo,
  VerifyResult,
} from './types/index.js';

interface AppProps {
  flags: {
    verbose?: boolean;
    dryRun?: boolean;
    force?: boolean;
    skipOpencodeCheck?: boolean;
  };
}

type Phase =
  | 'welcome'
  | 'system-check'
  | 'prerequisites-blocked'
  | 'opencode-check'
  | 'opencode-update'
  | 'opencode-install'
  | 'opencode-installing'
  | 'opencode-manual'
  | 'framework-selection'
  | 'config-detection'
  | 'install-confirmation'
  | 'conflict-resolution'
  | 'view-differences'
  | 'recent-backups'
  | 'backup'
  | 'restoring-backup'
  | 'installation'
  | 'verification'
  | 'summary';

const INSTALL_MESSAGES = [
  'Installing...',
  'Hold on...',
  'Casi listo...',
  'Finalizando...',
];

function classifyOpenCodeUpdateResult(
  method: OpenCodeInstallMethod,
  previousVersion: string | null,
  refreshedStatus: OpenCodeStatus
): OpenCodeUpdateResult {
  if (!refreshedStatus.installed) {
    return {
      status: 'failed',
      method,
      previousVersion,
      currentVersion: null,
      activeInstallMethod: null,
      error: 'Update command completed, but the active opencode binary could not be verified afterwards.',
    };
  }

  if (
    refreshedStatus.installMethods.length > 0 &&
    refreshedStatus.activeInstallMethod !== null &&
    refreshedStatus.activeInstallMethod !== method
  ) {
    return {
      status: 'verification-mismatch',
      method,
      previousVersion,
      currentVersion: refreshedStatus.version,
      activeInstallMethod: refreshedStatus.activeInstallMethod,
      error: `The update ran with ${method}, but the active opencode binary is linked to ${refreshedStatus.activeInstallMethod}.`,
    };
  }

  if (refreshedStatus.installationAlignment === 'mismatch') {
    return {
      status: 'unverified',
      method,
      previousVersion,
      currentVersion: refreshedStatus.version,
      activeInstallMethod: null,
      error: 'The update command completed, but the active opencode binary could not be matched to the detected Homebrew/npm installation.',
    };
  }

  if (previousVersion && refreshedStatus.version && previousVersion !== refreshedStatus.version) {
    return {
      status: 'updated',
      method,
      previousVersion,
      currentVersion: refreshedStatus.version,
      activeInstallMethod: refreshedStatus.activeInstallMethod,
    };
  }

  return {
    status: 'unchanged',
    method,
    previousVersion,
    currentVersion: refreshedStatus.version,
    activeInstallMethod: refreshedStatus.activeInstallMethod,
    error: 'The update command completed, but the active opencode version did not change.',
  };
}

export function App({ flags }: AppProps) {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [systemChecks, setSystemChecks] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [openCodeStatus, setOpenCodeStatus] = useState<OpenCodeStatus | null>(null);
  const [frameworks, setFrameworks] = useState<FrameworkDefinition[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<FrameworkDefinition | null>(null);
  const [currentFramework, setCurrentFramework] = useState<FrameworkDefinition | null>(null);
  const [configDetection, setConfigDetection] = useState<ConfigDetectionResult | null>(null);
  const [backupResult, setBackupResult] = useState<BackupResult | null>(null);
  const [installResult, setInstallResult] = useState<InstallResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [installMessage, setInstallMessage] = useState(INSTALL_MESSAGES[0]);
  const [opencodeInstallError, setOpencodeInstallError] = useState<string | null>(null);
  const [openCodeUpdateResult, setOpenCodeUpdateResult] = useState<OpenCodeUpdateResult>({
    status: 'idle',
    method: null,
    previousVersion: null,
    currentVersion: null,
  });
  const [manualInstallCommand, setManualInstallCommand] = useState<string | null>(null);
  const [recentBackups, setRecentBackups] = useState<BackupEntry[]>([]);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [backupBrowserOrigin, setBackupBrowserOrigin] = useState<
    'welcome' | 'conflict-resolution' | 'install-confirmation'
  >('conflict-resolution');
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  const handleWelcomeStartSetup = () => {
    setWelcomeMessage(null);
    setPhase('system-check');
    setIsChecking(true);
    void runSystemCheck();
  };

  const handleExit = () => {
    process.exit(0);
  };

  async function runSystemCheck() {
    try {
      const info = await gatherSystemInfo();
      const status = await checkOpenCode();
      setSystemInfo(info);
      setSystemChecks(getSystemChecks(info));
      setOpenCodeStatus(status);
    } catch (error) {
      console.error('System check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }

  const handleSystemCheckComplete = () => {
    const blockingFailures = getBlockingSystemFailures(systemChecks);
    if (blockingFailures.length > 0) {
      setPhase('prerequisites-blocked');
      return;
    }

    if (flags.skipOpencodeCheck) {
      void loadFrameworksAndContinue();
      return;
    }

    setPhase('opencode-check');
    void runOpenCodeCheck();
  };

  async function runOpenCodeCheck() {
    try {
      const status = await checkOpenCode();
      setOpenCodeStatus(status);

      if (status.installed) {
        setOpencodeInstallError(null);
        setOpenCodeUpdateResult({
          status: 'idle',
          method: null,
          previousVersion: status.version,
          currentVersion: status.version,
          activeInstallMethod: status.activeInstallMethod,
        });

        if (status.installMethods.length > 0) {
          setPhase('opencode-update');
          return;
        }

        await loadFrameworksAndContinue();
      } else {
        setOpencodeInstallError(null);
        setPhase('opencode-install');
      }
    } catch (error) {
      console.error('OpenCode check failed:', error);
      setOpenCodeStatus({
        installed: false,
        version: null,
        path: null,
        installMethods: [],
        activeInstallMethod: null,
        installationAlignment: 'unknown',
      });
      setOpencodeInstallError(null);
      setPhase('opencode-install');
    }
  }

  async function loadFrameworksAndContinue() {
    try {
      const availableFrameworks = await listFrameworks();
      setFrameworks(availableFrameworks);

      if (availableFrameworks.length === 0) {
        setInstallResult({
          status: 'failed',
          success: false,
          filesInstalled: 0,
          errors: ['No valid frameworks were found in the repository assets.'],
        });
        setVerifyResult({ valid: false, errors: ['Framework discovery failed'], warnings: [] });
        setPhase('summary');
        return;
      }

      const initialFramework =
        availableFrameworks.find((framework) => framework.id === 'vanilla') ||
        availableFrameworks[0];

      const detectedFramework = await detectCurrentFramework(availableFrameworks);
      setCurrentFramework(detectedFramework);

      setSelectedFramework(initialFramework);

      setPhase('framework-selection');
    } catch (error) {
      console.error('Framework discovery failed:', error);
      setInstallResult({
        status: 'failed',
        success: false,
        filesInstalled: 0,
        errors: [error instanceof Error ? error.message : 'Unknown framework discovery error'],
      });
      setVerifyResult({ valid: false, errors: ['Framework discovery failed'], warnings: [] });
      setPhase('summary');
    }
  }

  async function detectCurrentFramework(
    availableFrameworks: FrameworkDefinition[]
  ): Promise<FrameworkDefinition | null> {
    for (const framework of availableFrameworks) {
      const detection = await detectConfig(framework.id);
      const isExactMatch =
        detection.configDirExists &&
        detection.files.length > 0 &&
        detection.files.every((file) => file.status === 'identical');

      if (isExactMatch) {
        return framework;
      }
    }

    return null;
  }

  const handleHomebrewInstall = async () => {
    setOpencodeInstallError(null);
    setPhase('opencode-installing');

    const homebrewResult = await installHomebrew((message) => {
      setInstallMessage(message);
    });

    if (!homebrewResult.success) {
      console.error('Homebrew installation failed:', homebrewResult.error);
      setOpencodeInstallError(homebrewResult.error || 'Failed to install Homebrew.');
      setPhase('opencode-install');
      return;
    }

    const openCodeResult = await installOpenCode('homebrew', (message) => {
      setInstallMessage(message);
    });

    if (openCodeResult.success) {
      await runOpenCodeCheck();
      return;
    }

    console.error('OpenCode installation failed:', openCodeResult.error);
    setOpencodeInstallError(openCodeResult.error || 'Failed to install OpenCode with Homebrew.');
    setPhase('opencode-install');
  };

  const handleNpmInstall = async () => {
    setOpencodeInstallError(null);
    setPhase('opencode-installing');

    const result = await installOpenCode('npm', (message) => {
      setInstallMessage(message);
    });

    if (result.success) {
      await runOpenCodeCheck();
      return;
    }

    console.error('OpenCode installation failed:', result.error);
    setOpencodeInstallError(result.error || 'Failed to install OpenCode with npm.');
    setPhase('opencode-install');
  };

  const handleManualInstall = () => {
    const method =
      systemInfo && systemInfo.os !== 'windows' && systemInfo.homebrewInstalled
        ? 'homebrew'
        : 'npm';
    setManualInstallCommand(getOpenCodeInstallCommand(method));
    setPhase('opencode-manual');
  };

  const handleOpenCodeUpdate = async (method: OpenCodeInstallMethod) => {
    const previousVersion = openCodeStatus?.version || null;
    setOpencodeInstallError(null);
    setOpenCodeUpdateResult({
      status: 'idle',
      method,
      previousVersion,
      currentVersion: previousVersion,
      activeInstallMethod: openCodeStatus?.activeInstallMethod ?? null,
    });
    setPhase('opencode-installing');

    const result = await updateOpenCode(method, (message) => {
      setInstallMessage(message);
    });

    if (!result.success) {
      setOpenCodeUpdateResult({
        status: 'failed',
        method,
        previousVersion,
        currentVersion: previousVersion,
        activeInstallMethod: openCodeStatus?.activeInstallMethod ?? null,
        error: result.error || 'Failed to update OpenCode.',
      });
      setOpencodeInstallError(result.error || 'Failed to update OpenCode.');
      setPhase('opencode-update');
      return;
    }

    const refreshedStatus = await checkOpenCode();
    setOpenCodeStatus(refreshedStatus);
    setOpenCodeUpdateResult(classifyOpenCodeUpdateResult(method, previousVersion, refreshedStatus));
    await loadFrameworksAndContinue();
  };

  const handleContinueWithoutUpdate = async () => {
    setOpencodeInstallError(null);
    setOpenCodeUpdateResult((current) => {
      if (
        current.status === 'updated' ||
        current.status === 'unchanged' ||
        current.status === 'failed' ||
        current.status === 'verification-mismatch' ||
        current.status === 'unverified'
      ) {
        return current;
      }

      const currentVersion = openCodeStatus?.version || null;
      return {
        status: 'skipped',
        method: null,
        previousVersion: currentVersion,
        currentVersion,
        activeInstallMethod: openCodeStatus?.activeInstallMethod ?? null,
      };
    });
    await loadFrameworksAndContinue();
  };

  async function runConfigDetection(frameworkId: string) {
    try {
      const detection = await detectConfig(frameworkId);
      setConfigDetection(detection);

      const hasConflicts = detection.files.some((file) => file.status === 'different');

      if (hasConflicts && !flags.force) {
        setPhase('conflict-resolution');
        return;
      }

      if (!flags.force) {
        setPhase('install-confirmation');
        return;
      }

      setPhase('installation');
      await runInstallation(detection);
    } catch (error) {
      console.error('Config detection failed:', error);
      setPhase('installation');
      await runInstallation();
    }
  }

  async function runBackup(): Promise<BackupResult> {
    try {
      const result = await createBackup({ frameworkId: selectedFramework?.id ?? null });
      setBackupResult(result);
      return result;
    } catch (error) {
      console.error('Backup failed:', error);
      const failedResult = {
        success: false,
        backupPath: null,
        filesBackedUp: 0,
        frameworkId: selectedFramework?.id ?? null,
        error: error instanceof Error ? error.message : 'Unknown backup error',
      };
      setBackupResult(failedResult);
      return failedResult;
    }
  }

  const handleFrameworkSelect = async (framework: FrameworkDefinition) => {
    setSelectedFramework(framework);
    setRestoreMessage(null);
    setPhase('config-detection');
    await runConfigDetection(framework.id);
  };

  const handleSkipFrameworkInstall = () => {
    setInstallResult({
      status: 'skipped',
      success: true,
      filesInstalled: 0,
      errors: [],
    });
    setBackupResult(null);
    setVerifyResult({ valid: true, errors: [], warnings: [] });
    setPhase('summary');
  };

  const handleContinueInstall = async () => {
    setRestoreMessage(null);
    setPhase('installation');
    await runInstallation();
  };

  const handleViewDiff = () => {
    setPhase('view-differences');
  };

  const handleShowRecentBackups = async () => {
    setBackupBrowserOrigin('conflict-resolution');
    const backups = await listRecentBackups(5);
    setRecentBackups(backups);
    setPhase('recent-backups');
  };

  const handleShowRecentBackupsFromWelcome = async () => {
    setWelcomeMessage(null);
    setBackupBrowserOrigin('welcome');
    const backups = await listRecentBackups(5);
    setRecentBackups(backups);
    setPhase('recent-backups');
  };

  const handleRestoreBackup = async (backup: BackupEntry) => {
    setRestoreMessage(null);
    setPhase('restoring-backup');

    const safetyBackup = await runBackup();
    if (!safetyBackup.success) {
      setRestoreMessage(
        `Restore failed: could not create a safety backup. ${safetyBackup.error || ''}`.trim()
      );
      setPhase('recent-backups');
      return;
    }

    const result = await restoreBackup(backup.path);
    if (!result.success) {
      setRestoreMessage(`Restore failed: ${result.error || 'Unknown restore error'}`);
      setPhase('recent-backups');
      return;
    }

    const frameworkMessage = backup.frameworkId ? ` Framework: ${backup.frameworkId}.` : '';
    const successMessage =
      `Restored ${result.filesRestored} files from ${backup.name}.` +
      `${frameworkMessage} Safety backup: ${safetyBackup.backupPath}.`;

    if (backupBrowserOrigin === 'welcome') {
      setWelcomeMessage(successMessage);
      setPhase('welcome');
      return;
    }

    if (backupBrowserOrigin === 'install-confirmation') {
      setRestoreMessage(successMessage);
      setPhase('install-confirmation');
      return;
    }

    setRestoreMessage(successMessage);
    if (selectedFramework) {
      setPhase('config-detection');
      await runConfigDetection(selectedFramework.id);
      return;
    }

    setPhase('welcome');
  };

  const handleCancel = () => {
    console.log('\nInstallation cancelled.');
    process.exit(0);
  };

  async function runInstallation(detectionOverride?: ConfigDetectionResult) {
    if (!selectedFramework) {
      setInstallResult({
        status: 'failed',
        success: false,
        filesInstalled: 0,
        errors: ['No framework selected for installation.'],
      });
      setVerifyResult({ valid: false, errors: ['Installation failed'], warnings: [] });
      setPhase('summary');
      return;
    }

    if (flags.dryRun) {
      console.log(
        `\n[Dry run] Would install framework: ${selectedFramework.name} (${selectedFramework.id})`
      );
      console.log('[Dry run] Managed entries would be removed before reinstalling:');
      for (const entry of MANAGED_CONFIG_ENTRIES) {
        console.log(`  - ${entry}${entry === 'agents' || entry === 'skills' ? '/' : ''}`);
      }
      console.log('[Dry run] Managed entries would then be copied from the selected framework:');
      for (const entry of MANAGED_CONFIG_ENTRIES) {
        console.log(`  - ${entry}${entry === 'agents' || entry === 'skills' ? '/' : ''}`);
      }
      setPhase('summary');
      setInstallResult({
        status: 'success',
        success: true,
        filesInstalled: 0,
        frameworkId: selectedFramework.id,
        errors: [],
      });
      setVerifyResult({ valid: true, errors: [], warnings: [] });
      return;
    }

    try {
      const detection = detectionOverride || configDetection;
      if (detection?.configDirExists) {
        setPhase('backup');
        setInstallMessage(`Creating safety backup before switching to "${selectedFramework.name}"...`);
        const backup = await runBackup();

        if (!backup.success) {
          setInstallResult({
            status: 'failed',
            success: false,
            filesInstalled: 0,
            frameworkId: selectedFramework.id,
            errors: [`Backup failed: ${backup.error || 'Unable to create safety backup'}`],
          });
          setVerifyResult({
            valid: false,
            errors: ['Installation aborted because backup failed'],
            warnings: [],
          });
          setPhase('summary');
          return;
        }
      }

      setPhase('installation');
      setInstallMessage(`Replacing managed files with framework "${selectedFramework.name}"...`);
      const result = await installConfig(selectedFramework.id);
      setInstallResult(result);

      setPhase('verification');
      await runVerification();
    } catch (error) {
      console.error('Installation failed:', error);
      setInstallResult({
        status: 'failed',
        success: false,
        filesInstalled: 0,
        frameworkId: selectedFramework.id,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
      setPhase('summary');
      setVerifyResult({ valid: false, errors: ['Installation failed'], warnings: [] });
    }
  }

  async function runVerification() {
    try {
      const result = await verifyInstallation();
      setVerifyResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerifyResult({
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
      });
    } finally {
      setPhase('summary');
    }
  }

  switch (phase) {
    case 'welcome':
      return (
        <WelcomeScreen
          message={welcomeMessage}
          onStartSetup={handleWelcomeStartSetup}
          onRestoreBackups={() => void handleShowRecentBackupsFromWelcome()}
          onExit={handleExit}
        />
      );

    case 'system-check':
      return (
        <SystemCheckScreen
          checks={systemChecks}
          systemInfo={systemInfo}
          openCodeStatus={openCodeStatus}
          isChecking={isChecking}
          onComplete={handleSystemCheckComplete}
          onExit={handleExit}
        />
      );

    case 'prerequisites-blocked':
      return <PrerequisitesBlockedScreen failures={getBlockingSystemFailures(systemChecks)} />;

    case 'opencode-install':
      return (
        <OpenCodeInstallScreen
          os={systemInfo?.os || 'unknown'}
          homebrewInstalled={systemInfo?.homebrewInstalled || false}
          errorMessage={opencodeInstallError}
          onSelectHomebrew={() => void handleHomebrewInstall()}
          onSelectNpm={() => void handleNpmInstall()}
          onManualInstall={handleManualInstall}
          onBack={() => setPhase('welcome')}
        />
      );

    case 'opencode-update':
      return (
        <OpenCodeUpdateScreen
          status={
            openCodeStatus || {
              installed: true,
              version: null,
              path: null,
              installMethods: [],
              activeInstallMethod: null,
              installationAlignment: 'unknown',
            }
          }
          errorMessage={opencodeInstallError || openCodeUpdateResult.error || null}
          onUpdate={(method) => void handleOpenCodeUpdate(method)}
          onContinueWithoutUpdate={() => void handleContinueWithoutUpdate()}
          onBack={() => setPhase('welcome')}
        />
      );

    case 'opencode-installing':
      return <InstallationProgressScreen phase="Working on OpenCode" messages={[installMessage]} />;

    case 'opencode-manual':
      return (
        <ManualInstallScreen
          command={manualInstallCommand || getOpenCodeInstallCommand('npm')}
          onRetryCheck={() => {
            setPhase('opencode-check');
            void runOpenCodeCheck();
          }}
          onBack={() => {
            setOpencodeInstallError(null);
            setPhase('opencode-install');
          }}
        />
      );

    case 'opencode-check':
      return (
        <Box paddingTop={1}>
          <Text>
            <Spinner type="dots" /> Checking OpenCode installation...
          </Text>
        </Box>
      );

    case 'framework-selection':
      return (
        <FrameworkSelectionScreen
          frameworks={frameworks}
          selectedFrameworkId={selectedFramework?.id}
          openCodeUpdateResult={openCodeUpdateResult}
          onSelect={(framework) => void handleFrameworkSelect(framework)}
          onSkip={handleSkipFrameworkInstall}
          onCancel={handleCancel}
        />
      );

    case 'config-detection':
      return (
        <InstallationProgressScreen
          phase="Detecting existing configuration"
          messages={[
            selectedFramework
              ? `Checking configuration against framework "${selectedFramework.name}"...`
              : 'Checking configuration...',
            'Hold on...',
            'Casi listo...',
          ]}
        />
      );

    case 'conflict-resolution':
      return (
        <ConflictResolutionScreen
          frameworkName={selectedFramework?.name || selectedFramework?.id || 'selected framework'}
          conflicts={configDetection?.files.filter((file) => file.status === 'different') || []}
          backupNotice="Any installation now creates a safety backup automatically before cleaning and replacing the managed files."
          restoreNotice={restoreMessage}
          onContinueInstall={() => void handleContinueInstall()}
          onViewDiff={handleViewDiff}
          onShowRecentBackups={() => void handleShowRecentBackups()}
          onCancel={handleCancel}
        />
      );

    case 'install-confirmation':
      return (
        <InstallConfirmationScreen
          frameworkName={selectedFramework?.name || selectedFramework?.id || 'selected framework'}
          files={configDetection?.files || []}
          backupNotice="The installer will create a safety backup automatically before cleaning and importing the managed files."
          restoreNotice={restoreMessage}
          onContinueInstall={() => void handleContinueInstall()}
          onShowRecentBackups={async () => {
            setBackupBrowserOrigin('install-confirmation');
            const backups = await listRecentBackups(5);
            setRecentBackups(backups);
            setPhase('recent-backups');
          }}
          onCancel={handleCancel}
        />
      );

    case 'view-differences':
      return (
        <DifferencesScreen
          frameworkName={selectedFramework?.name || selectedFramework?.id || 'selected framework'}
          conflicts={configDetection?.files.filter((file) => file.status === 'different') || []}
          onBack={() => setPhase('conflict-resolution')}
        />
      );

    case 'recent-backups':
      return (
        <RecentBackupsScreen
          backups={recentBackups}
          selectedFrameworkName={selectedFramework?.name || null}
          message={backupBrowserOrigin === 'welcome' ? welcomeMessage : restoreMessage}
          onRestore={(backup) => void handleRestoreBackup(backup)}
          onBack={() => setPhase(backupBrowserOrigin)}
        />
      );

    case 'backup':
      return (
        <InstallationProgressScreen
          phase="Creating backup"
          messages={[
            installMessage,
            'Saving current managed configuration...',
            'Preparing a safe restore point...',
          ]}
        />
      );

    case 'restoring-backup':
      return (
        <InstallationProgressScreen
          phase="Restoring backup"
          messages={['Restoring files...', 'Preparing the selected backup...', 'Almost done...']}
        />
      );

    case 'installation':
      return (
        <InstallationProgressScreen
          phase="Installing configuration"
          messages={[installMessage, 'Cleaning managed files...', 'Copying framework files...', 'Finalizando...']}
        />
      );

    case 'verification':
      return (
        <InstallationProgressScreen
          phase="Verifying installation"
          messages={['Verifying...', 'Hold on...', 'Casi listo...']}
        />
      );

    case 'summary':
      return (
        <SummaryScreen
          frameworkName={selectedFramework?.name || selectedFramework?.id || null}
          currentFrameworkName={currentFramework?.name || currentFramework?.id || null}
          installResult={
            installResult || {
              status: 'failed',
              success: false,
              filesInstalled: 0,
              errors: ['No installation attempted'],
            }
          }
          backupResult={backupResult}
          openCodeUpdateResult={openCodeUpdateResult}
          verifyResult={verifyResult || { valid: false, errors: ['Verification not run'], warnings: [] }}
        />
      );

    default:
      return <Text>Loading...</Text>;
  }
}
