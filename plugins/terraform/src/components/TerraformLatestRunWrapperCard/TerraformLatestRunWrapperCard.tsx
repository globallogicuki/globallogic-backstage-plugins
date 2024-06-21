import React from "react"
import { Grid } from "@material-ui/core"
import { InfoCard } from "@backstage/core-components"



export const TerraformLatestRunWrapperCard = ({ workspace, children }: { workspace: string, children: JSX.Element }) => (
    <Grid container spacing={2} direction="column">
        <Grid item>
            <InfoCard title={`Latest run for ${workspace}`}>
                {children}
            </InfoCard>
        </Grid>
    </Grid>
);

