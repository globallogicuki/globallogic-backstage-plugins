import React from 'react';
import { render, screen } from '@testing-library/react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Terraform } from './Terraform';
import { mockEntity } from '../../mocks/entity';

jest.mock('../TerraformRuns', () => {
  const MockTerraformRuns = () => <div>Mock TerraformRuns</div>;
  return { TerraformRuns: MockTerraformRuns };
});

jest.mock('../TerraformLatestRun', () => {
  const MockTerraformLatestRun = () => <div>Mock TerraformLatestRun</div>;
  return { TerraformLatestRun: MockTerraformLatestRun };
});

describe('Terraform', () => {
  it.only('renders TerraformRuns when annotation is present', async () => {
    render(
      <EntityProvider entity={mockEntity}>
        <Terraform />
      </EntityProvider>,
    );

    const mockText = await screen.findByText('Mock TerraformRuns');

    expect(mockText).toBeInTheDocument();
  });

  it('renders MissingAnnotationEmptyState when annotation is not present', async () => {
    const missingAnnotation = { ...mockEntity };
    // @ts-ignore
    missingAnnotation.metadata.annotations = {};

    render(
      <EntityProvider entity={missingAnnotation}>
        <Terraform />
      </EntityProvider>,
    );

    const missingAnnotationText = await screen.findByText('Missing Annotation');

    expect(missingAnnotationText).toBeInTheDocument();
  });

  it('renders TerraformLatestRun', async () => {
    const testEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'mock-component-entity',
        title: 'Mock Component Entity',
        namespace: 'default',
        annotations: {
          'terraform/organization': 'gluk',
          // 'terraform/workspace': 'terraform-cloud-gluk-project-config',
        },
        spec: {
          owner: 'guest',
          type: 'service',
          lifecycle: 'production',
        },
      },
    };

    render(
      <EntityProvider entity={testEntity}>
        <Terraform showLatestRun={true} />
      </EntityProvider>,
    );

    const mockText = await screen.findByText('Mock TerraformLatestRun');

    expect(mockText).toBeInTheDocument();
  })
});
