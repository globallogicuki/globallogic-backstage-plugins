import { useState } from 'react';
import {
  OverflowTooltip,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { Run } from '../../hooks/types';
import {
  Avatar,
  Drawer,
  IconButton,
  Chip,
  Grid,
  Typography,
} from '@material-ui/core';
import NotesIcon from '@material-ui/icons/Notes';
import CloseIcon from '@material-ui/icons/Close';
import {
  makeStyles,
  createStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import { LogViewer } from '../LogViewer';
import { formatTimeToWords } from '../../utils';
import { getColor } from './utils';

interface DenseTableProps {
  data: Run[];
  isLoading?: boolean;
  title: string;
  hasMultipleWorkspaces?: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeButton: {
      color: theme.palette.grey[500],
      height: '1rem',
      width: '1rem',
    },
  }),
);

export const DenseTable = ({
  data,
  isLoading,
  title,
  hasMultipleWorkspaces,
}: DenseTableProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<string | null | undefined>(
    null,
  );

  const closeDialog = () => setIsOpen(false);

  type RowData = {
    id: string;
    createdBy: { name: string; avatar?: string };
    message: string;
    createdAt: string;
    status: string;
    workspaceName: string;
    actions: {
      logs?: string | null;
    };
  };

  const columns: TableColumn<RowData>[] = [
    {
      title: 'Workspace',
      customFilterAndSearch: (query, row) => row.workspaceName?.includes(query),
      field: 'workspaceName',
      hidden: !hasMultipleWorkspaces,
    },
    {
      title: 'User',
      customFilterAndSearch: (query, row) =>
        row.createdBy.name?.includes(query),
      render: row => {
        return (
          <Chip
            avatar={
              <Avatar alt={row.createdBy.name} src={row.createdBy.avatar} />
            }
            label={row.createdBy.name}
            variant="outlined"
            size="small"
          />
        );
      },
      customSort: (row1, row2) =>
        row1.createdBy.name < row2.createdBy.name ? 1 : -1,
      field: 'createdBy',
    },
    {
      title: 'Message',
      customFilterAndSearch: (query, row) => row.message?.includes(query),
      render: row => {
        return <OverflowTooltip text={row.message} line={2} placement="top" />;
      },
      field: 'message',
    },
    {
      title: 'Created',
      customFilterAndSearch: (query, row) => row.createdAt?.includes(query),
      render: row => {
        return row.createdAt;
      },
      field: 'createdAt',
    },
    {
      title: 'Status',
      customFilterAndSearch: (query, row) => row.status?.includes(query),
      render: row => {
        return (
          <Chip
            label={row.status}
            style={{ backgroundColor: getColor(row.status, theme) }}
            size="small"
            variant="default"
          />
        );
      },
      field: 'status',
    },
    {
      title: 'Actions',
      field: 'actions',
      sorting: false,
      filtering: false,
      render: row => {
        return (
          <>
            {row.actions.logs && (
              <IconButton
                data-testid={`open-logs-${row.id}`}
                size="small"
                onClick={() => {
                  setDialogContent(row.actions.logs);
                  setIsOpen(true);
                }}
              >
                <NotesIcon />
              </IconButton>
            )}
          </>
        );
      },
    },
  ];

  const formattedData: RowData[] = data.map(run => {
    return {
      id: run.id,
      createdBy: {
        name: run.confirmedBy?.name || 'Unknown',
        avatar: run.confirmedBy?.avatar,
      },
      message: run.message,
      createdAt: formatTimeToWords(run.createdAt, { strict: true }),
      status: run.status,
      workspaceName: run.workspace?.name || 'Unknown',
      actions: {
        logs: run.plan?.logs,
      },
    };
  });

  return (
    <>
      <Table
        title={title}
        options={{ paging: true, pageSize: 10 }}
        columns={columns}
        data={formattedData}
        isLoading={isLoading}
        page={10}
      />
      <Drawer
        variant="temporary"
        anchor="right"
        open={isOpen}
        onClose={closeDialog}
      >
        <Grid
          container
          direction="column"
          spacing={1}
          style={{ padding: '1rem', minWidth: '70vw' }}
        >
          <Grid item>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h5">Logs</Typography>
              </Grid>
              <Grid item>
                <IconButton
                  data-testid="close-icon"
                  aria-label="close"
                  className={classes.closeButton}
                  onClick={closeDialog}
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            {dialogContent ? (
              <LogViewer txtUrl={dialogContent} />
            ) : (
              <Typography>No logs available</Typography>
            )}
          </Grid>
        </Grid>
      </Drawer>
    </>
  );
};
