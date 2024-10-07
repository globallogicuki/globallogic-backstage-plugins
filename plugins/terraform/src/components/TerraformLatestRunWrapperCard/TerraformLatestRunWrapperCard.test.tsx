import React from 'react';
import { render, screen } from '@testing-library/react';
import { TerraformLatestRunWrapperCard } from './TerraformLatestRunWrapperCard';

describe('TerraformLatestRunWrapperCard', () => {
  it('renders TerraformLatestRunWrapperCard with single workspace', async () => {
    const testWorkspaceName = 'Test Workspace';
    const testChildText = 'Test child text';
    render(
      <TerraformLatestRunWrapperCard workspaces={[testWorkspaceName]}>
        <p>{testChildText}</p>
      </TerraformLatestRunWrapperCard>,
    );

    const testTitle = await screen.findByText(
      `Latest Terraform run for ${testWorkspaceName}`,
    );
    const childText = await screen.findByText(testChildText);

    expect(testTitle).toBeInTheDocument();
    expect(childText).toBeInTheDocument();
  });

  it('renders TerraformLatestRunWrapperCard with multiple workspaces', async () => {
    const testWorkspaceName = 'Test Workspace';
    const testChildText = 'Test child text';
    render(
      <TerraformLatestRunWrapperCard
        workspaces={[testWorkspaceName, testWorkspaceName]}
      >
        <p>{testChildText}</p>
      </TerraformLatestRunWrapperCard>,
    );

    const testTitle = await screen.findByText(
      `Latest Terraform run for workspaces`,
    );
    const testSubheader = await screen.findByText(
      `Test Workspace, Test Workspace`,
    );
    const childText = await screen.findByText(testChildText);

    expect(testTitle).toBeInTheDocument();
    expect(testSubheader).toBeInTheDocument();
    expect(childText).toBeInTheDocument();
  });
});
