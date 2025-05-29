import { render, screen } from '@testing-library/react';
import TerraformDrift from './TerraformDrift';

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

const driftUrl = 'https://app.terraform.io/app/';

describe('TerraformDrift Component', () => {
  const defaultProps = {
    drifted: false,
    resourcesDrifted: 10,
    resourcesUndrifted: 90,
  };

  it('renders the component with the title "Drift"', () => {
    render(<TerraformDrift {...defaultProps} terraformDriftUrl={driftUrl} />);
    const titleElement = screen.getByText('Drift');
    expect(titleElement).toBeInTheDocument();
  });

  it('displays the warning icon when drifted is true (and metrics exist)', () => {
    render(
      <TerraformDrift
        drifted
        resourcesDrifted={10}
        resourcesUndrifted={90}
        terraformDriftUrl={driftUrl}
      />,
    );
    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();

    const successIcon = screen.queryByTestId('success-icon');
    expect(successIcon).toBeNull();
  });

  it('displays the warning icon when drifted is false but no drift metrics exist', () => {
    render(
      <TerraformDrift
        drifted={false}
        resourcesDrifted={0}
        resourcesUndrifted={0}
        terraformDriftUrl={driftUrl}
      />,
    );
    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();

    const successIcon = screen.queryByTestId('success-icon');
    expect(successIcon).toBeNull();
  });

  it('displays the success icon when drifted is false AND drift metrics exist', () => {
    render(<TerraformDrift {...defaultProps} terraformDriftUrl={driftUrl} />);

    const successIcon = screen.getByTestId('success-icon');
    expect(successIcon).toBeInTheDocument();

    const warningIcon = screen.queryByTestId('warning-icon');
    expect(warningIcon).toBeNull();
  });

  it('renders the Pie Chart component with the correct data labels when metrics exist', () => {
    render(<TerraformDrift {...defaultProps} terraformDriftUrl={driftUrl} />);

    expect(screen.getByText('Drifted')).toBeInTheDocument();
    expect(screen.getByText('Undrifted')).toBeInTheDocument();
    // Also confirm the numbers are displayed as arc labels
    expect(screen.getByText('10')).toBeInTheDocument(); // resourcesDrifted
    expect(screen.getByText('90')).toBeInTheDocument(); // resourcesUndrifted
  });

  it('renders "No drift metrics found." message inside Content when no metrics exist', () => {
    render(
      <TerraformDrift
        drifted={false}
        resourcesDrifted={0}
        resourcesUndrifted={0}
        terraformDriftUrl={driftUrl}
      />,
    );

    expect(screen.getByText('No drift metrics found.')).toBeInTheDocument();
    expect(screen.queryByText('Drifted')).toBeNull();
    expect(screen.queryByText('Undrifted')).toBeNull();
  });

  it('renders the view details link in the actions slot with correct text and URL', () => {
    render(
      <TerraformDrift
        drifted={false}
        resourcesDrifted={0}
        resourcesUndrifted={0}
        terraformDriftUrl={driftUrl}
      />,
    );

    const viewDetailsLink = screen.getByRole('link', {
      name: /View in Terraform/i,
    });
    expect(viewDetailsLink).toBeInTheDocument();
    expect(viewDetailsLink).toHaveAttribute('href', driftUrl);
    expect(viewDetailsLink).toHaveAttribute('target', '_blank');
  });
});
