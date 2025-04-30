import { render, screen } from '@testing-library/react';
import TerraformValidationChecks from './TerraformValidationChecks'; // Adjust the import path as necessary
import { StackedBarItem } from '../StackedBar/StackedBar';

// Mock the StackedBar component
jest.mock('../StackedBar/StackedBar.tsx', () => ({
  __esModule: true,
  default: ({ data }: { data: StackedBarItem[] }) => (
    <div data-testid="stacked-bar-mock">
      {data.map(item => (
        <div key={item.id}>
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  ),
}));

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

  it('displays the warning icon when allChecksSucceeded is false', () => {
    render(
      <TerraformValidationChecks
        {...defaultProps}
        allChecksSucceeded={false}
      />,
    );
    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();
  });

  it('does not display the warning icon when allChecksSucceeded is true', () => {
    render(<TerraformValidationChecks {...defaultProps} allChecksSucceeded />);
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
