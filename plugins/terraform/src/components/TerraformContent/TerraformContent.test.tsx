import React from 'react';
import { render, screen } from '@testing-library/react';
import { TerraformContent, TerraformContentProps } from './TerraformContent';
import { TerraformRuns } from '../TerraformRuns/TerraformRuns';
import TerraformWorkspaceHealthAssessments from '../TerraformWorkspaceHealthAssessments/TerraformWorkspaceHealthAssessments';

// Mock the child components to isolate the TerraformContent component
jest.mock('../TerraformRuns/TerraformRuns', () => ({
  TerraformRuns: jest.fn(() => <div data-testid="terraform-runs" />),
}));

jest.mock(
  '../TerraformWorkspaceHealthAssessments/TerraformWorkspaceHealthAssessments',
  () => jest.fn(() => <div data-testid="terraform-workspace-health" />),
);

describe('TerraformContent', () => {
  const defaultProps: TerraformContentProps = {
    organization: 'testOrg',
    workspaceNames: ['ws1', 'ws2'],
  };

  const renderComponent = (props: Partial<TerraformContentProps> = {}) => {
    return render(<TerraformContent {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    // Clear mock calls before each test to ensure isolation
    jest.clearAllMocks();
  });

  it('renders the "Terraform" heading when hideDescription is false (default)', () => {
    renderComponent();
    expect(screen.getByText('Terraform')).toBeInTheDocument();
  });

  it('does not render the "Terraform" heading when hideDescription is true', () => {
    renderComponent({ hideDescription: true });
    expect(screen.queryByText('Terraform')).toBeNull();
  });

  it('renders the TerraformRuns component with correct props', () => {
    renderComponent();
    expect(screen.getByTestId('terraform-runs')).toBeInTheDocument();
    expect((TerraformRuns as jest.Mock).mock.calls[0][0]).toEqual({
      organization: 'testOrg',
      workspaceNames: ['ws1', 'ws2'],
      hideDescription: false,
    });
  });

  it('renders the TerraformRuns component with hideDescription prop when provided', () => {
    renderComponent({ hideDescription: true });
    expect(screen.getByTestId('terraform-runs')).toBeInTheDocument();
    expect((TerraformRuns as jest.Mock).mock.calls[0][0]).toEqual({
      organization: 'testOrg',
      workspaceNames: ['ws1', 'ws2'],
      hideDescription: true,
    });
  });

  it('renders the TerraformWorkspaceHealthAssessments component with correct props when showWorkspaceHealth is true (default)', () => {
    renderComponent();
    expect(
      screen.getByTestId('terraform-workspace-health'),
    ).toBeInTheDocument();
    expect(
      (TerraformWorkspaceHealthAssessments as jest.Mock).mock.calls[0][0],
    ).toEqual({
      organization: 'testOrg',
      workspaceNames: ['ws1', 'ws2'],
    });
  });

  it('does not render the TerraformWorkspaceHealthAssessments component when showWorkspaceHealth is false', () => {
    renderComponent({ showWorkspaceHealth: false });
    expect(screen.queryByTestId('terraform-workspace-health')).toBeNull();
    expect(TerraformWorkspaceHealthAssessments).not.toHaveBeenCalled();
  });

  it('renders correctly with different organization and workspaceNames', () => {
    const testOrg = 'anotherOrg';
    const testWorkspaces = ['wsA', 'wsB', 'wsC'];
    renderComponent({ organization: testOrg, workspaceNames: testWorkspaces });
    expect((TerraformRuns as jest.Mock).mock.calls[0][0]).toEqual({
      organization: testOrg,
      workspaceNames: testWorkspaces,
      hideDescription: false,
    });
    expect(
      (TerraformWorkspaceHealthAssessments as jest.Mock).mock.calls[0][0],
    ).toEqual({
      organization: testOrg,
      workspaceNames: testWorkspaces,
    });
  });
});
