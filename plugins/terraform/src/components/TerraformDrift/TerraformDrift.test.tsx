import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { TerraformDrift } from './TerraformDrift';

jest.mock('@mui/x-charts', () => {
  return {
    ...jest.requireActual('@mui/x-charts'),
    PieChart: () => <div data-testid="pie-chart" />,
  };
});

const driftUrl = 'https://app.terraform.io/app/';

describe('TerraformDrift Component', () => {
  const defaultProps = {
    drifted: false,
    resourcesDrifted: 10,
    resourcesUndrifted: 90,
    terraformDriftUrl: 'https://app.terraform.io/app/',
  };

  it('renders the component with the title "Drift"', () => {
    renderInTestApp(<TerraformDrift {...defaultProps} />);
    const titleElement = screen.getByText('Drift');
    expect(titleElement).toBeInTheDocument();
  });

  it('displays the warning icon when drifted is true (and metrics exist)', () => {
    renderInTestApp(
      <TerraformDrift
        {...defaultProps}
        drifted
        resourcesDrifted={10}
        resourcesUndrifted={90}
      />,
    );
    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();

    const successIcon = screen.queryByTestId('success-icon');
    expect(successIcon).toBeNull();
  });

  it('displays the warning icon when drifted is false but no drift metrics exist', () => {
    renderInTestApp(
      <TerraformDrift
        {...defaultProps}
        drifted={false}
        resourcesDrifted={0}
        resourcesUndrifted={0}
      />,
    );
    const warningIcon = screen.getByTestId('warning-icon');
    expect(warningIcon).toBeInTheDocument();

    const successIcon = screen.queryByTestId('success-icon');
    expect(successIcon).toBeNull();
  });

  it('displays the success icon when drifted is false AND drift metrics exist', () => {
    renderInTestApp(<TerraformDrift {...defaultProps} />);

    const successIcon = screen.getByTestId('success-icon');
    expect(successIcon).toBeInTheDocument();

    const warningIcon = screen.queryByTestId('warning-icon');
    expect(warningIcon).toBeNull();
  });

  it('renders the Pie Chart component when metrics exist', () => {
    renderInTestApp(<TerraformDrift {...defaultProps} />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders "No drift metrics found." message inside Content when no metrics exist', () => {
    renderInTestApp(
      <TerraformDrift
        {...defaultProps}
        drifted={false}
        resourcesDrifted={0}
        resourcesUndrifted={0}
      />,
    );

    expect(screen.getByText('No drift metrics found.')).toBeInTheDocument();
    expect(screen.queryByText('Drifted')).toBeNull();
    expect(screen.queryByText('Undrifted')).toBeNull();
  });

  it('renders the view details link in the actions slot with correct text and URL', () => {
    renderInTestApp(
      <TerraformDrift
        {...defaultProps}
        drifted={false}
        resourcesDrifted={0}
        resourcesUndrifted={0}
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
