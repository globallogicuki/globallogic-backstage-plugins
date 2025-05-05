import { render, screen } from '@testing-library/react';
import TerraformValidationChecks from './TerraformValidationChecks';

describe('TerraformValidationChecks Component', () => {
  const defaultProps = {
    allChecksSucceeded: false,
    checksFailed: 1,
    checksUnknown: 2,
    checksPassed: 3,
  };

  it('renders the component with the title "Checks"', () => {
    render(<TerraformValidationChecks {...defaultProps} />);
    const titleElement = screen.getByText('Checks');
    expect(titleElement).toBeInTheDocument();
  });

  it('displays the warning icon and not the success icon when allChecksSucceeded is false', () => {
    render(
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

  it('displays the success icon and not the warning icon when allChecksSucceeded is true', () => {
    render(<TerraformValidationChecks {...defaultProps} allChecksSucceeded />);

    const successIcon = screen.getByTestId('success-icon');
    expect(successIcon).toBeInTheDocument();

    const warningIcon = screen.queryByTestId('warning-icon');
    expect(warningIcon).toBeNull();
  });

  it('renders the Pie Chart component with the correct data', () => {
    render(<TerraformValidationChecks {...defaultProps} />);

    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });

  it('renders correctly with zero checks', () => {
    render(
      <TerraformValidationChecks
        allChecksSucceeded
        checksFailed={0}
        checksUnknown={0}
        checksPassed={0}
      />,
    );
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });
});
