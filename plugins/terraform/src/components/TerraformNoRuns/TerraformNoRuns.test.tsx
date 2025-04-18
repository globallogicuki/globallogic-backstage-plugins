import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { TerraformNoRuns } from './TerraformNoRuns';

describe('TerraformNoRuns', () => {
  it('renders TerraformNoRuns', async () => {
    await renderInTestApp(<TerraformNoRuns />);

    const message = await screen.findByText('No runs for this workspace!');
    expect(message).toBeInTheDocument();
  });
});
