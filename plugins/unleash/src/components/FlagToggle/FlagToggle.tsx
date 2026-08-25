import { useState } from 'react';
import {
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Chip,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import { useApi, alertApiRef } from '@backstage/core-plugin-api';
import { unleashApiRef } from '../../api';

interface FlagToggleProps {
  projectId: string;
  flagName: string;
  environment: string;
  enabled: boolean;
  readonly?: boolean;
  onToggled: () => void;
  disabled?: boolean;
}

/**
 * Toggle switch component with confirmation dialog for feature flags
 */
export const FlagToggle = ({
  projectId,
  flagName,
  environment,
  enabled,
  readonly = false,
  onToggled,
  disabled,
}: FlagToggleProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const unleashApi = useApi(unleashApiRef);
  const alertApi = useApi(alertApiRef);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await unleashApi.toggleFlag(projectId, flagName, environment, !enabled);
      alertApi.post({
        message: `Flag ${flagName} ${
          !enabled ? 'enabled' : 'disabled'
        } in ${environment}`,
        severity: 'success',
      });
      onToggled();
    } catch (e: any) {
      // Extract user-friendly error message based on the structured error
      // info (statusCode/name) attached by the Unleash API client
      let errorMessage = 'Failed to toggle flag';

      if (e?.statusCode === 403 || e?.name === 'NotAllowedError') {
        // Non-editable-environment rejections (also 403) carry a
        // descriptive message about editable environments - surface it
        // as-is. Plain permission denials get a friendlier ownership hint.
        errorMessage = e.message?.includes('not editable')
          ? e.message
          : "You don't have permission to modify this flag. Only component owners can toggle flags.";
      } else if (e?.message) {
        errorMessage = e.message;
      }

      alertApi.post({
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  // In readonly mode, show a chip instead of a toggle
  if (readonly) {
    return (
      <Chip
        icon={enabled ? <CheckCircleIcon /> : <CancelIcon />}
        label={enabled ? 'Enabled' : 'Disabled'}
        color={enabled ? 'primary' : 'default'}
        size="small"
      />
    );
  }

  return (
    <>
      <Switch
        checked={enabled}
        onChange={() => setConfirmOpen(true)}
        disabled={disabled || loading}
        color="primary"
      />
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Flag Toggle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {enabled ? 'disable' : 'enable'}{' '}
            <strong>{flagName}</strong> in <strong>{environment}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleToggle} color="primary" disabled={loading}>
            {loading ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
