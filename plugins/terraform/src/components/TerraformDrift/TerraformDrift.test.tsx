import { render, screen } from '@testing-library/react';
import TerraformDrift from './TerraformDrift'; // Adjust the import path as necessary

describe('TerraformDrift Component', () => {
  it('renders the component with provided data and displays the Drift title', () => {
    render(
      <TerraformDrift
        drifted={false}
        resourcesDrifted={10}
        resourcesUndrifted={90}
      />,
    );

    const titleElement = screen.getByText('Drift');
    expect(titleElement).toBeInTheDocument();
  });

  it('displays the warning icon when drifted is true', () => {
    render(
      <TerraformDrift drifted resourcesDrifted={10} resourcesUndrifted={90} />,
    );

    const warningIcon = screen.getByText('⚠️');
    expect(warningIcon).toBeInTheDocument();
  });

  it('does not display the warning icon when drifted is false', () => {
    render(
      <TerraformDrift
        drifted={false}
        resourcesDrifted={10}
        resourcesUndrifted={90}
      />,
    );

    const warningIcon = screen.queryByText('⚠️');
    expect(warningIcon).not.toBeInTheDocument();
  });

  it('renders the StackedBar component with correct data', () => {
    render(
      <TerraformDrift drifted resourcesDrifted={20} resourcesUndrifted={80} />,
    );

    const driftedText = screen.getByText('Drifted');
    const undriftedText = screen.getByText('Undrifted');

    expect(driftedText).toBeInTheDocument();
    expect(undriftedText).toBeInTheDocument();
  });
});
