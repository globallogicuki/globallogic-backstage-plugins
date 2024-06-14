import React from 'react';
import { render, screen } from '@testing-library/react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Terraform } from './Terraform';
import { mockEntity } from '../../mocks/entity';

jest.mock('../TerraformRuns', () => {
  const MockTerraformRuns = () => <div>Mock TerraformRuns</div>;
  return { TerraformRuns: MockTerraformRuns };
});


describe('Terraform', () => {
  it('renders TerraformRuns when annotation is present', async () => {
    render(
      <EntityProvider entity={mockEntity}>
        <Terraform />
      </EntityProvider>,
    );

    const mockText = await screen.findByText('Mock TerraformRuns');

    expect(mockText).toBeInTheDocument();
  });

  it('renders MissingAnnotationEmptyState when annotation is not present', async () => {
    // If the following is refactored, ensure it is cloning mockEntity, and not merely referencing it!
    const missingAnnotation = JSON.parse(JSON.stringify(mockEntity));
    missingAnnotation.metadata.annotations = {};

    render(
      <EntityProvider entity={missingAnnotation}>
        <Terraform />
      </EntityProvider>,
    );

    const missingAnnotationText = await screen.findByText('Missing Annotation');

    expect(missingAnnotationText).toBeInTheDocument();
  });

});
