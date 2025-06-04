import { render, screen } from '@testing-library/react';
import TerraformValidationChecks from './TerraformValidationChecks';

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  useTheme: () => ({
    palette: {
      error: { light: '#f44336' },
      warning: { light: '#ff9800' },
      success: { light: '#4caf50' },
    },
  }),
}));

describe('TerraformValidationChecks Component', () => {
  const defaultProps = {
    allChecksSucceeded: false,
    checksFailed: 1,
    checksUnknown: 2,
    checksPassed: 3,
  };

  const terraformChecksUrl = 'https://app.terraform.io/app/';

  it('renders the component with the title "Checks"', () => {
    render(
      <TerraformValidationChecks
        {...defaultProps}
        terraformValidationChecksUrl={terraformChecksUrl}
      />,
    );
    const titleElement = screen.getByText('Checks');
    expect(titleElement).toBeInTheDocument();
  });

  it('displays the warning icon when allChecksSucceeded is false (and checks exist)', () => {
    render(
      <TerraformValidationChecks
        {...defaultProps}
        allChecksSucceeded={false}
        terraformValidationChecksUrl={terraformChecksUrl}
      />,
    );
    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();

    const successIcon = screen.queryByTestId('success-icon');
    expect(successIcon).toBeNull();
  });

  it('displays the warning icon when allChecksSucceeded is true but no checks exist', () => {
    render(
      <TerraformValidationChecks
        allChecksSucceeded
        checksFailed={0}
        checksUnknown={0}
        checksPassed={0}
        terraformValidationChecksUrl={terraformChecksUrl}
      />,
    );

    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();

    const successIcon = screen.queryByTestId('success-icon');
    expect(successIcon).toBeNull();
  });

  it('displays the success icon when allChecksSucceeded is true AND checks exist', () => {
    render(
      <TerraformValidationChecks
        {...defaultProps}
        allChecksSucceeded
        terraformValidationChecksUrl={terraformChecksUrl}
      />,
    );

    const successIcon = screen.getByTestId('success-icon');
    expect(successIcon).toBeInTheDocument();

    const warningIcon = screen.queryByTestId('warning-icon');
    expect(warningIcon).toBeNull();
  });

  it('renders the Pie Chart component with the correct data labels when checks exist', () => {
    render(
      <TerraformValidationChecks
        {...defaultProps}
        terraformValidationChecksUrl={terraformChecksUrl}
      />,
    );

    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // checksFailed
    expect(screen.getByText('2')).toBeInTheDocument(); // checksUnknown
    expect(screen.getByText('3')).toBeInTheDocument(); // checksPassed
  });

  it('renders "No checks found." message inside Content when no checks exist', () => {
    render(
      <TerraformValidationChecks
        allChecksSucceeded={false}
        checksFailed={0}
        checksUnknown={0}
        checksPassed={0}
        terraformValidationChecksUrl={terraformChecksUrl}
      />,
    );

    expect(screen.getByText('No checks found.')).toBeInTheDocument();

    expect(screen.queryByText('Failed')).toBeNull();
    expect(screen.queryByText('Unknown')).toBeNull();
    expect(screen.queryByText('Passed')).toBeNull();
  });

  it('renders the view details link in the actions slot with correct text and URL', () => {
    render(
      <TerraformValidationChecks
        allChecksSucceeded
        checksFailed={0}
        checksUnknown={0}
        checksPassed={0}
        terraformValidationChecksUrl={terraformChecksUrl}
      />,
    );

    const viewDetailsLink = screen.getByRole('link', {
      name: /View in Terraform/i,
    });
    expect(viewDetailsLink).toBeInTheDocument();
    expect(viewDetailsLink).toHaveAttribute('href', terraformChecksUrl);
    expect(viewDetailsLink).toHaveAttribute('target', '_blank');
  });
});
