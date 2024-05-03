import React, { useState } from 'react';
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
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { LogViewer } from '../LogViewer';
import { formatTimeToWords } from '../../utils';
import { getColor } from './utils';

interface DenseTableProps {
  data: Run[];
  isLoading?: boolean;
  title: string;
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

export const DenseTable = ({ data, isLoading, title }: DenseTableProps) => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<string | null | undefined>(
    null,
  );

  const closeDialog = () => setIsOpen(false);

  const columns: TableColumn[] = [
    { title: 'User', field: 'createdBy' },
    { title: 'Message', field: 'message' },
    { title: 'Created', field: 'createdAt' },
    { title: 'Status', field: 'status' },
    { title: 'Actions', field: 'actions' },
  ];

  const formattedData = data.map(run => {
    return {
      createdBy: (
        <Chip
          avatar={
            <Avatar
              alt={run.confirmedBy?.name || 'Unknown'}
              src={run.confirmedBy?.avatar}
            />
          }
          label={run.confirmedBy?.name || 'Unknown'}
          variant="outlined"
          size="small"
        />
      ),
      message: <OverflowTooltip text={run.message} line={2} placement="top" />,
      createdAt: formatTimeToWords(run.createdAt, { strict: true }),
      status: (
        <Chip
          label={run.status}
          style={{ backgroundColor: getColor(run.status) }}
          size="small"
          variant="default"
        />
      ),
      actions: (
        <>
          {run.plan?.logs && (
            <IconButton
              data-testid={`open-logs-${run.id}`}
              size="small"
              onClick={() => {
                setDialogContent(run.plan?.logs);
                setIsOpen(true);
              }}
            >
              <NotesIcon />
            </IconButton>
          )}
        </>
      ),
    };
  });

  return (
    <>
      <Table
        title={title}
        options={{ search: false, paging: true, pageSize: 10 }}
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
