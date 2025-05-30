import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TerraformNoMetrics } from './TerraformNoMetrics';

describe('TerraformNoMetrics', () => {
  it('should render the provided message', () => {
    const testMessage = 'No metrics found for this Terraform configuration.';
    render(<TerraformNoMetrics message={testMessage} />);
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  it('should render the default message when no message prop is provided', () => {
    const defaultMessage = 'No metrics found for this workspace.';
    render(<TerraformNoMetrics />);
    expect(screen.getByText(defaultMessage)).toBeInTheDocument();
  });
});
