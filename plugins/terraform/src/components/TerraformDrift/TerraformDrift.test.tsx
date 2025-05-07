import { render, screen } from '@testing-library/react';
import TerraformDrift from './TerraformDrift';

const driftUrl = 'https://app.terraform.io/app/';

describe('TerraformDrift Component', () => {
  it('renders the component with provided data and displays the Drift title', () => {
    render(
      <TerraformDrift
        drifted={false}
        resourcesDrifted={10}
        resourcesUndrifted={90}
        terraformDriftUrl={driftUrl}
      />,
    );

    const titleElement = screen.getByText('Drift');
    expect(titleElement).toBeInTheDocument();
  });

  it('displays the warning icon and not the success icon when drifted is true', () => {
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

  it('displays the success icon and not the warning icon when drifted is false', () => {
    render(
      <TerraformDrift
        drifted={false}
        resourcesDrifted={10}
        resourcesUndrifted={90}
        terraformDriftUrl={driftUrl}
      />,
    );

    const successIcon = screen.getByTestId('success-icon');
    expect(successIcon).toBeInTheDocument();

    const warningIcon = screen.queryByTestId('warning-icon');
    expect(warningIcon).toBeNull();
  });

  it('renders the PieChart component with correct data', () => {
    render(
      <TerraformDrift
        drifted
        resourcesDrifted={20}
        resourcesUndrifted={80}
        terraformDriftUrl={driftUrl}
      />,
    );

    const driftedText = screen.getByText('Drifted');
    const undriftedText = screen.getByText('Undrifted');

    expect(driftedText).toBeInTheDocument();
    expect(undriftedText).toBeInTheDocument();
  });

  it('renders the view details link in the actions slot', () => {
    render(
      <TerraformDrift
        drifted={false}
        resourcesDrifted={0}
        resourcesUndrifted={80}
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
