import React, { useState } from 'react';
import {
  InfoCard,
  OverflowTooltip,
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
// import { LogViewer } from '../LogViewer';
// import { formatTimeToWords } from '../../utils';
// import { getColor } from './utils';

interface TerraformLatestRunCardProps {
  run?: Run;
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

export const TerraformLatestRunCard = ({ run, workspace }: TerraformLatestRunCardProps) => {
  // const classes = useStyles();
  // const [isOpen, setIsOpen] = useState(false);
  // const [dialogContent, setDialogContent] = useState<string | null | undefined>(
  //   null,
  // );

  // const closeDialog = () => setIsOpen(false);

  const { title, formattedData } = createFormattedDataFromRun(workspace,
    // () => {
    //   setDialogContent(run?.plan?.logs);
    //   setIsOpen(true);
    // },
    run);

  return (
    <>
      {/* <InfoCard title={title}> */}
      {title}
      {formattedData ?
        <div>
          <div>`User: ${formattedData.createdBy}`</div>
          <div>${formattedData.message}</div>
        </div>
        : <div />
      }
      {/* </InfoCard> */}
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


function createFormattedDataFromRun(
  workspace: string,
  // onClick: () => void,
  run?: Run
): {
  title: string,
  formattedData?: {
    // createdBy: JSX.Element,
    createdBy?: string,
    message: JSX.Element,
    // createdAt: string,
    // status: JSX.Element,
    // actions: JSX.Element
  }
} {
  return run ? {
    title: `Latest run for ${workspace}`,
    formattedData: {
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
      message: <OverflowTooltip text={run.message} line={2} placement="top" />,
      // createdAt: formatTimeToWords(run.createdAt, { strict: true }),
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
    : { title: `No runs for ${workspace}` };
}
