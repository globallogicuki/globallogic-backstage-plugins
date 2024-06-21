import { StatusError } from "@backstage/core-components";
import { Grid, Typography } from "@material-ui/core";
import React from "react";


export const TerraformLatestRunError = ({ error }: { error: Error }) => (
    <Grid container direction='column' spacing={2} justifyContent='space-between' alignItems='center'>
        <Grid item>
            <Grid container direction='row' spacing={2} justifyContent='space-between' alignItems='center'>
                <Grid item>
                    <StatusError />
                </Grid>
                <Grid item>
                    <Typography variant='h6'>
                        {error.name}
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
        <Grid item>
            <Typography variant='body1'>
                {error.message}
            </Typography>
        </Grid>
    </Grid>
)
