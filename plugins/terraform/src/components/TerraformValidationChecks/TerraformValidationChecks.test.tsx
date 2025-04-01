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
    render(<TerraformValidationChecks {...defaultProps} />);
    const warningIcon = screen.getByText('⚠️');
    expect(warningIcon).toBeInTheDocument();
  });

  it('does not display the warning icon when allChecksSucceeded is true', () => {
    render(<TerraformValidationChecks {...defaultProps} allChecksSucceeded />);
    const warningIcon = screen.queryByText('⚠️');
    expect(warningIcon).not.toBeInTheDocument();
  });

  it('renders the StackedBar component with the correct data', () => {
    render(<TerraformValidationChecks {...defaultProps} />);
    const stackedBar = screen.getByTestId('stacked-bar-mock');
    expect(stackedBar).toBeInTheDocument();

    expect(screen.getByText('Failed: 1')).toBeInTheDocument();
    expect(screen.getByText('Unknown: 2')).toBeInTheDocument();
    expect(screen.getByText('Passed: 3')).toBeInTheDocument();
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
    const stackedBar = screen.getByTestId('stacked-bar-mock');
    expect(stackedBar).toBeInTheDocument();
    expect(screen.getByText('Failed: 0')).toBeInTheDocument();
    expect(screen.getByText('Unknown: 0')).toBeInTheDocument();
    expect(screen.getByText('Passed: 0')).toBeInTheDocument();
  });
});
