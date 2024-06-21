import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import React from 'react';
import { TerraformLatestRunError } from './TerraformLatestRunError';

describe('TerraformLatestRunError', () => {
  it('renders TerraformLatestRunError', async () => {
    const mockError = {
      name: 'Mock Error Name',
      message: 'Mock Error Message',
    };
    await renderInTestApp(<TerraformLatestRunError error={mockError} />);

    const errorName = await screen.findByText(mockError.name);
    const errorMessage = await screen.findByText(mockError.message);

    expect(errorName).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });
});
