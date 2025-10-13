import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { TerraformValidationChecks } from './TerraformValidationChecks';

jest.mock('@mui/x-charts', () => {
  const actual = jest.requireActual('@mui/x-charts');
  return {
    ...actual,
    PieChart: () => <div data-testid="pie-chart" />,
  };
});

describe('TerraformValidationChecks Component', () => {
  const defaultProps = {
    allChecksSucceeded: false,
    checksFailed: 1,
    checksUnknown: 2,
    checksPassed: 3,
    terraformValidationChecksUrl: 'https://app.terraform.io/app/',
  };

  it('renders the component with the title "Checks"', () => {
    renderInTestApp(<TerraformValidationChecks {...defaultProps} />);
    const titleElement = screen.getByText('Checks');
    expect(titleElement).toBeInTheDocument();
  });

  it('displays the warning icon when allChecksSucceeded is false (and checks exist)', () => {
    renderInTestApp(
      <TerraformValidationChecks
        {...defaultProps}
        allChecksSucceeded={false}
      />,
    );
    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();

    const successIcon = screen.queryByTestId('success-icon');
    expect(successIcon).toBeNull();
  });

  it('displays the warning icon when allChecksSucceeded is true but no checks exist', () => {
    renderInTestApp(
      <TerraformValidationChecks
        {...defaultProps}
        allChecksSucceeded
        checksFailed={0}
        checksUnknown={0}
        checksPassed={0}
      />,
    );

    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();

    const successIcon = screen.queryByTestId('success-icon');
    expect(successIcon).toBeNull();
  });

  it('displays the success icon when allChecksSucceeded is true AND checks exist', () => {
    renderInTestApp(
      <TerraformValidationChecks {...defaultProps} allChecksSucceeded />,
    );

    const successIcon = screen.getByTestId('success-icon');
    expect(successIcon).toBeInTheDocument();

    const warningIcon = screen.queryByTestId('warning-icon');
    expect(warningIcon).toBeNull();
  });

  it('renders the Pie Chart component when checks exist', () => {
    renderInTestApp(<TerraformValidationChecks {...defaultProps} />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders "No checks found." message inside Content when no checks exist', () => {
    renderInTestApp(
      <TerraformValidationChecks
        {...defaultProps}
        allChecksSucceeded={false}
        checksFailed={0}
        checksUnknown={0}
        checksPassed={0}
      />,
    );

    expect(screen.getByText('No checks found.')).toBeInTheDocument();

    expect(screen.queryByText('Failed')).toBeNull();
    expect(screen.queryByText('Unknown')).toBeNull();
    expect(screen.queryByText('Passed')).toBeNull();
  });

  it('renders the view details link in the actions slot with correct text and URL', () => {
    renderInTestApp(
      <TerraformValidationChecks
        {...defaultProps}
        allChecksSucceeded
        checksFailed={0}
        checksUnknown={0}
        checksPassed={0}
      />,
    );

    const viewDetailsLink = screen.getByRole('link', {
      name: /View in Terraform/i,
    });
    expect(viewDetailsLink).toBeInTheDocument();
    expect(viewDetailsLink).toHaveAttribute(
      'href',
      defaultProps.terraformValidationChecksUrl,
    );
    expect(viewDetailsLink).toHaveAttribute('target', '_blank');
  });
});
