import { useAsync } from 'react-use';
import {
  Content,
  ContentHeader,
  Header,
  Page,
  SupportButton,
  Progress,
  ResponseErrorPanel,
  InfoCard,
} from '@backstage/core-components';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  makeStyles,
  Chip,
} from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { unleashApiRef } from '../../api';

const useStyles = makeStyles(theme => ({
  metricCard: {
    height: '100%',
  },
  metricValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  metricLabel: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  environmentChip: {
    margin: theme.spacing(0.5),
  },
  projectCard: {
    marginBottom: theme.spacing(2),
  },
  technicalDebtBadge: {
    fontWeight: 'bold',
  },
}));

/**
 * Standalone page for Unleash feature flag management
 * Shows summary metrics from projects and environments
 */
export const UnleashPage = () => {
  const classes = useStyles();
  const unleashApi = useApi(unleashApiRef);

  const { value, loading, error } = useAsync(async () => {
    const [projectsData, environmentsData] = await Promise.all([
      unleashApi.getProjects(),
      unleashApi.getEnvironments(),
    ]);
    return { projectsData, environmentsData };
  }, []);

  if (loading) {
    return (
      <Page themeId="tool">
        <Header
          title="Feature Flags"
          subtitle="Manage feature flags across your organization"
        />
        <Content>
          <Progress />
        </Content>
      </Page>
    );
  }

  if (error) {
    return (
      <Page themeId="tool">
        <Header
          title="Feature Flags"
          subtitle="Manage feature flags across your organization"
        />
        <Content>
          <ResponseErrorPanel error={error} />
        </Content>
      </Page>
    );
  }

  const allProjects = value?.projectsData?.projects ?? [];
  const allEnvironments = value?.environmentsData?.environments ?? [];

  // Filter out archived projects and disabled environments
  const projects = allProjects.filter(p => p.archivedAt === null);
  const environments = allEnvironments.filter(e => e.enabled);

  const totalFlags = projects.reduce((sum, p) => sum + p.featureCount, 0);
  // Technical debt is inverted health (100% health = 0% technical debt)
  const averageTechnicalDebt =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + (100 - p.health), 0) /
            projects.length,
        )
      : 0;
  const totalEnabledToggles = environments.reduce(
    (sum, e) => sum + e.enabledToggleCount,
    0,
  );

  return (
    <Page themeId="tool">
      <Header
        title="Feature Flags"
        subtitle="Manage feature flags across your organization"
      />
      <Content>
        <ContentHeader title="Unleash Dashboard">
          <SupportButton>
            View and manage feature flags for all projects
          </SupportButton>
        </ContentHeader>

        <Grid container spacing={3}>
          {/* Summary Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.metricCard}>
              <CardContent>
                <Typography variant="subtitle2" className={classes.metricLabel}>
                  Total Projects
                </Typography>
                <Typography className={classes.metricValue}>
                  {projects.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.metricCard}>
              <CardContent>
                <Typography variant="subtitle2" className={classes.metricLabel}>
                  Total Flags
                </Typography>
                <Typography className={classes.metricValue}>
                  {totalFlags}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.metricCard}>
              <CardContent>
                <Typography variant="subtitle2" className={classes.metricLabel}>
                  Avg Technical Debt
                </Typography>
                <Typography className={classes.metricValue}>
                  {averageTechnicalDebt}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card className={classes.metricCard}>
              <CardContent>
                <Typography variant="subtitle2" className={classes.metricLabel}>
                  Enabled Toggles
                </Typography>
                <Typography className={classes.metricValue}>
                  {totalEnabledToggles}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Environments Summary */}
          <Grid item xs={12}>
            <InfoCard title="Environments">
              <Grid container spacing={1}>
                {environments.map(env => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={env.name}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{env.name}</Typography>
                        <Chip
                          size="small"
                          label={env.type}
                          color={
                            env.type === 'production' ? 'secondary' : 'default'
                          }
                          className={classes.environmentChip}
                        />
                        {env.protected && (
                          <Chip
                            size="small"
                            label="Protected"
                            color="primary"
                            className={classes.environmentChip}
                          />
                        )}
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          {env.projectCount} projects • {env.enabledToggleCount}{' '}
                          toggles
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </InfoCard>
          </Grid>

          {/* Projects Summary */}
          <Grid item xs={12}>
            <InfoCard title="Projects">
              <Grid container spacing={1}>
                {projects.map(project => (
                  <Grid item xs={12} sm={6} md={3} key={project.id}>
                    <Card variant="outlined" className={classes.projectCard}>
                      <CardContent>
                        <Typography variant="subtitle1">
                          {project.name}
                        </Typography>
                        {project.description && (
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            display="block"
                          >
                            {project.description}
                          </Typography>
                        )}
                        <Typography variant="caption" display="block">
                          <span className={classes.technicalDebtBadge}>
                            Debt: {100 - project.health}%
                          </span>
                          {' • '}
                          {project.featureCount} flags
                          {' • '}
                          {project.memberCount} members
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
