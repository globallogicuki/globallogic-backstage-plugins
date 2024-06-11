import React, { useState } from 'react';
import {
  InfoCard,
  OverflowTooltip,
  Table,
} from '@backstage/core-components';
import { Run } from '../../hooks/types';
import {
  Avatar,
  // Drawer,
  // IconButton,
  Chip,
  // Grid,
  // Typography,
} from '@material-ui/core';
// import NotesIcon from '@material-ui/icons/Notes';
// import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { formatDate } from 'date-fns';
import { formatTimeToWords } from '../../utils';
// import { LogViewer } from '../LogViewer';
// import { formatTimeToWords } from '../../utils';
// import { getColor } from './utils';

interface TerraformLatestRunCardProps {
  run?: Run;
  isLoading: boolean,
  workspace: string;
}

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     closeButton: {
//       color: theme.palette.grey[500],
//       height: '1rem',
//       width: '1rem',
//     },
//   }),
// );

export const TerraformLatestRunCard = ({ run, isLoading, workspace }: TerraformLatestRunCardProps) => {
  // const classes = useStyles();
  // const [isOpen, setIsOpen] = useState(false);
  // const [dialogContent, setDialogContent] = useState<string | null | undefined>(
  //   null,
  // );

  // const closeDialog = () => setIsOpen(false);

  const { title, dataObj } = createDataObjectFromRun(workspace,
    // () => {
    //   setDialogContent(run?.plan?.logs);
    //   setIsOpen(true);
    // },
    run);


  const conditionalLatestRunComponent = () => run ?
    (
      <div>
        <div><p>User: {dataObj.createdBy}</p></div>
        <div><p>Message: {dataObj.message}</p></div>
        <div><p>Created: {dataObj.createdAt}</p></div>
        <div><p>Status: {dataObj.status}</p></div>
      </div>
    ) :
    <div />

  return (
    <>
      <InfoCard title={title}>
        {conditionalLatestRunComponent()}
      </InfoCard>
      {/* <Drawer
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
      </Drawer> */}
    </>
  );

};


function createDataObjectFromRun(
  workspace: string,
  // onClick: () => void,
  run?: Run
): {
  title: string,
  dataObj: {
    // createdBy: JSX.Element,
    createdBy?: string,
    message?: string,
    createdAt?: string,
    status?: string,
    // actions: JSX.Element
  }
} {
  return run ? {
    title: `Latest run for ${workspace}`,
    dataObj: {
      createdBy: run.confirmedBy?.name ?? 'Unknown',
      //   (
      //   <Chip
      //     avatar={<Avatar
      //       alt={run.confirmedBy?.name ?? 'Unknown'}
      //       src={run.confirmedBy?.avatar} />}
      //     label={run.confirmedBy?.name ?? 'Unknown'}
      //     variant="outlined"
      //     size="small" />
      // ),
      // message: <OverflowTooltip text={run.message} line={2} placement="top" />,
      message: run.message,
      status: run.status,
      createdAt: formatTimeToWords(run.createdAt, { strict: true }),
      // status: (
      //   <Chip
      //     label={run.status}
      //     style={{ backgroundColor: getColor(run.status) }}
      //     size="small"
      //     variant="default" />
      // ),
      // actions: (
      //   <>
      //     {run.plan?.logs && (
      //       <IconButton
      //         data-testid={`open-logs-${run.id}`}
      //         size="small"
      //         onClick={onClick}
      //       >
      //         <NotesIcon />
      //       </IconButton>
      //     )}
      //   </>
      // ),
    }
  }
    : { title: `No runs for ${workspace}`, dataObj: {} };
}
