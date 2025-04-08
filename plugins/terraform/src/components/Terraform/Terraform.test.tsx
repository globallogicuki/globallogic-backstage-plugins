import React from 'react';
import { render, screen } from '@testing-library/react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Terraform } from './Terraform';
import { mockEntity } from '../../mocks/entity';

jest.mock('../TerraformContent', () => {
  const MockTerraformContent = () => <div>Mock TerraformContent</div>;
  return { TerraformContent: MockTerraformContent };
});

describe('Terraform', () => {
  it('renders TerraformContent when annotation is present', async () => {
    render(
      <EntityProvider entity={mockEntity}>
        <Terraform />
      </EntityProvider>,
    );

    const mockText = await screen.findByText('Mock TerraformContent');

    expect(mockText).toBeInTheDocument();

    jest.clearAllMocks();
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
