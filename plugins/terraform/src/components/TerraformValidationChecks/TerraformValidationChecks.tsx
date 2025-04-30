import { PieChart } from '@mui/x-charts';
import { InfoCard } from '@backstage/core-components';
import WarningIcon from '@material-ui/icons/Warning';
import { IconButton } from '@material-ui/core';



interface Props {
  allChecksSucceeded: boolean;
  checksFailed: number;
  checksUnknown: number;
  checksPassed: number;
}

export const TerraformValidationChecks = ({
  allChecksSucceeded,
  checksFailed,
  checksUnknown,
  checksPassed,
}: Props) => {
  const barData = [
    {
      id: 'failed',
      label: 'Failed',
      value: checksFailed,
      color: '#EFC7CC',
      textColor: '#C00005',
    },
    {
      id: 'unknown',
      label: 'Unknown',
      value: checksUnknown,
      color: '#BFD4FF',
      textColor: '#1060FF',
    },
    {
      id: 'passed',
      label: 'Passed',
      value: checksPassed,
      color: '#C6E9C9',
      textColor: '#008A22',
    },
  ];

  return (
    <InfoCard
      title={"Checks"}
      variant='gridItem'
      action={!allChecksSucceeded ? 
      <IconButton disabled={true}>
        <WarningIcon />
      </IconButton> 
      : ''}
    >
      <PieChart
        skipAnimation
        height={100}
        series={[
          {
            arcLabel: item => `${item.value}`,
            arcLabelMinAngle: 35,
            arcLabelRadius: '60%',
            innerRadius: 20,
            data: barData,
          },
        ]}
      />
    </InfoCard>
  );
};

export default TerraformValidationChecks;
