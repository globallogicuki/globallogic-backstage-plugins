import React from 'react';
import { render, screen } from '@testing-library/react';
import { TerraformLatestRunWrapperCard } from './TerraformLatestRunWrapperCard';


describe('TerraformLatestRunWrapperCard', () => {
    it('renders TerraformLatestRunWrapperCard with simple component', async () => {
        const testWorkspaceName = 'Test Workspace';
        const testChildText = 'Test child text';
        render(
            <TerraformLatestRunWrapperCard workspace={testWorkspaceName} >
                <p>{testChildText}</p>
            </TerraformLatestRunWrapperCard>
        )

        const testTitle = await screen.findByText(`Latest run for ${testWorkspaceName}`)
        const childText = await screen.findByText(testChildText);

        expect(testTitle).toBeInTheDocument();
        expect(childText).toBeInTheDocument();
    });
});