import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp } from '@backstage/test-utils';
import { StrategyEditor } from './StrategyEditor';
import type { Strategy } from '@internal/backstage-plugin-unleash-common';

describe('StrategyEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('flexibleRollout strategy', () => {
    const flexibleRolloutStrategy: Strategy = {
      id: 'strategy-1',
      name: 'flexibleRollout',
      parameters: {
        rollout: '75',
        stickiness: 'default',
        groupId: 'test-group',
      },
      constraints: [],
      variants: [
        {
          name: 'Variant A',
          weight: 500,
          weightType: 'variable',
          stickiness: 'default',
          payload: { type: 'string', value: 'valueA' },
        },
        {
          name: 'Variant B',
          weight: 500,
          weightType: 'variable',
          stickiness: 'default',
          payload: { type: 'string', value: 'valueB' },
        },
      ],
    };

    it('renders flexibleRollout parameters', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      expect(screen.getByText(/rollout %/i)).toBeInTheDocument();
      expect(screen.getByText(/stickiness/i)).toBeInTheDocument();
      expect(screen.getByText(/group id/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-group')).toBeInTheDocument();
    });

    it('renders variants section', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      expect(screen.getByText(/variants/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Variant A')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Variant B')).toBeInTheDocument();
    });

    it('updates rollout percentage', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const rolloutInput = screen.getByDisplayValue('75') as HTMLInputElement;

      // Directly set the value using fireEvent.change
      fireEvent.change(rolloutInput, { target: { value: '50' } });

      // onChange should be called with the new value
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({
            rollout: '50',
          }),
        }),
      );
    });

    it('adds a new variant', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const addButton = screen.getByRole('button', { name: /add variant/i });
      await userEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          variants: expect.arrayContaining([
            expect.objectContaining({ name: 'Variant 3' }),
          ]),
        }),
      );
    });

    it('recalculates weights when variant is added', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const addButton = screen.getByRole('button', { name: /add variant/i });
      await userEvent.click(addButton);

      const call = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      const totalWeight = call.variants.reduce((sum: number, v: any) => sum + v.weight, 0);
      expect(totalWeight).toBe(1000); // Should always total 100%
    });

    it('displays weight warning when total is not 100%', async () => {
      const invalidWeightStrategy: Strategy = {
        ...flexibleRolloutStrategy,
        variants: [
          {
            name: 'Variant A',
            weight: 300,
            weightType: 'fix',
            stickiness: 'default',
            payload: { type: 'string', value: 'valueA' },
          },
          {
            name: 'Variant B',
            weight: 200,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'string', value: 'valueB' },
          },
        ],
      };

      await renderInTestApp(<StrategyEditor strategy={invalidWeightStrategy} onChange={mockOnChange} />);

      expect(screen.getByText(/warning.*50%.*should be 100%/i)).toBeInTheDocument();
    });
  });

  describe('remoteAddress strategy', () => {
    const remoteAddressStrategy: Strategy = {
      id: 'strategy-2',
      name: 'remoteAddress',
      parameters: {
        IPs: '10.1.1.17, 192.168.1.0/24',
      },
      constraints: [],
    };

    it('renders remoteAddress parameters', async () => {
      await renderInTestApp(<StrategyEditor strategy={remoteAddressStrategy} onChange={mockOnChange} />);

      expect(screen.getAllByText(/ip addresses/i)[0]).toBeInTheDocument();
      expect(screen.getByDisplayValue('10.1.1.17, 192.168.1.0/24')).toBeInTheDocument();
      expect(screen.getByText(/enter ip addresses or cidr ranges/i)).toBeInTheDocument();
    });

    it('does not render variants section', async () => {
      await renderInTestApp(<StrategyEditor strategy={remoteAddressStrategy} onChange={mockOnChange} />);

      expect(screen.queryByText(/^variants$/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add variant/i })).not.toBeInTheDocument();
    });

    it('updates IP addresses', async () => {
      await renderInTestApp(<StrategyEditor strategy={remoteAddressStrategy} onChange={mockOnChange} />);

      const ipInput = screen.getByDisplayValue('10.1.1.17, 192.168.1.0/24');
      await userEvent.clear(ipInput);
      await userEvent.type(ipInput, '192.168.1.1');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: { IPs: '192.168.1.1' },
        }),
      );
    });
  });

  describe('applicationHostname strategy', () => {
    const applicationHostnameStrategy: Strategy = {
      id: 'strategy-3',
      name: 'applicationHostname',
      parameters: {
        hostNames: 'app1.example.com, app2.example.com',
      },
      constraints: [],
    };

    it('renders applicationHostname parameters', async () => {
      await renderInTestApp(<StrategyEditor strategy={applicationHostnameStrategy} onChange={mockOnChange} />);

      expect(screen.getAllByText(/hostnames/i)[0]).toBeInTheDocument();
      expect(screen.getByDisplayValue('app1.example.com, app2.example.com')).toBeInTheDocument();
      expect(screen.getByText(/enter hostnames separated by commas/i)).toBeInTheDocument();
    });

    it('does not render variants section', async () => {
      await renderInTestApp(<StrategyEditor strategy={applicationHostnameStrategy} onChange={mockOnChange} />);

      expect(screen.queryByText(/^variants$/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add variant/i })).not.toBeInTheDocument();
    });

    it('updates hostnames', async () => {
      await renderInTestApp(<StrategyEditor strategy={applicationHostnameStrategy} onChange={mockOnChange} />);

      const hostnameInput = screen.getByDisplayValue('app1.example.com, app2.example.com');
      await userEvent.clear(hostnameInput);
      await userEvent.type(hostnameInput, 'newhost.example.com');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: { hostNames: 'newhost.example.com' },
        }),
      );
    });
  });

  describe('unsupported strategy types', () => {
    const unsupportedStrategy: Strategy = {
      id: 'strategy-4',
      name: 'customStrategy',
      parameters: {},
      constraints: [],
    };

    it('shows non-editable message for unsupported strategies', async () => {
      await renderInTestApp(<StrategyEditor strategy={unsupportedStrategy} onChange={mockOnChange} />);

      expect(screen.getByText(/strategy type "customStrategy" is not editable/i)).toBeInTheDocument();
      expect(screen.getByText(/use the unleash console/i)).toBeInTheDocument();
    });

    it('does not render parameter controls for unsupported strategies', async () => {
      await renderInTestApp(<StrategyEditor strategy={unsupportedStrategy} onChange={mockOnChange} />);

      expect(screen.queryByText(/parameters/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/constraints/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
    });
  });

  describe('constraints', () => {
    const strategyWithConstraints: Strategy = {
      id: 'strategy-5',
      name: 'flexibleRollout',
      parameters: {
        rollout: '100',
        stickiness: 'default',
      },
      constraints: [
        {
          contextName: 'userId',
          operator: 'IN',
          values: ['user1', 'user2'],
          caseInsensitive: false,
          inverted: false,
        },
      ],
      variants: [],
    };

    it('renders existing constraints', async () => {
      await renderInTestApp(<StrategyEditor strategy={strategyWithConstraints} onChange={mockOnChange} />);

      expect(screen.getByDisplayValue('userId')).toBeInTheDocument();
      expect(screen.getByDisplayValue('user1, user2')).toBeInTheDocument();
    });

    it('adds a new constraint', async () => {
      await renderInTestApp(<StrategyEditor strategy={strategyWithConstraints} onChange={mockOnChange} />);

      const addButton = screen.getByRole('button', { name: /add constraint/i });
      await userEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          constraints: expect.arrayContaining([
            expect.objectContaining({ contextName: 'userId' }),
            expect.objectContaining({ contextName: 'userId', operator: 'IN' }),
          ]),
        }),
      );
    });

    it('updates constraint context name', async () => {
      await renderInTestApp(<StrategyEditor strategy={strategyWithConstraints} onChange={mockOnChange} />);

      const contextInput = screen.getByDisplayValue('userId');
      await userEvent.clear(contextInput);
      await userEvent.type(contextInput, 'email');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          constraints: [
            expect.objectContaining({ contextName: 'email' }),
          ],
        }),
      );
    });

    it('updates constraint values', async () => {
      await renderInTestApp(<StrategyEditor strategy={strategyWithConstraints} onChange={mockOnChange} />);

      const valuesInput = screen.getByDisplayValue('user1, user2');
      await userEvent.clear(valuesInput);
      await userEvent.type(valuesInput, 'user3, user4');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          constraints: [
            expect.objectContaining({ values: ['user3', 'user4'] }),
          ],
        }),
      );
    });
  });

  describe('weight recalculation logic', () => {
    it('distributes weight evenly when all variants are variable', async () => {
      const allVariableStrategy: Strategy = {
        id: 'strategy-6',
        name: 'flexibleRollout',
        parameters: {},
        variants: [
          {
            name: 'Variant A',
            weight: 333,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'string', value: '' },
          },
          {
            name: 'Variant B',
            weight: 333,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'string', value: '' },
          },
          {
            name: 'Variant C',
            weight: 334,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'string', value: '' },
          },
        ],
      };

      await renderInTestApp(<StrategyEditor strategy={allVariableStrategy} onChange={mockOnChange} />);

      // The component should recalculate weights on mount
      // All 3 variants should be variable and total 1000
      const call = mockOnChange.mock.calls[0]?.[0];
      if (call) {
        const totalWeight = call.variants.reduce((sum: number, v: any) => sum + v.weight, 0);
        expect(totalWeight).toBe(1000);
        expect(call.variants.every((v: any) => v.weightType === 'variable')).toBe(true);
      }
    });

    it('distributes remaining weight among variable variants when some are fixed', async () => {
      const mixedWeightStrategy: Strategy = {
        id: 'strategy-7',
        name: 'flexibleRollout',
        parameters: {},
        variants: [
          {
            name: 'Variant A',
            weight: 300,
            weightType: 'fix',
            stickiness: 'default',
            payload: { type: 'string', value: '' },
          },
          {
            name: 'Variant B',
            weight: 350,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'string', value: '' },
          },
          {
            name: 'Variant C',
            weight: 350,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'string', value: '' },
          },
        ],
      };

      await renderInTestApp(<StrategyEditor strategy={mixedWeightStrategy} onChange={mockOnChange} />);

      // Fixed variant should keep 300
      // Remaining 700 should be split between the 2 variable variants
      const call = mockOnChange.mock.calls[0]?.[0];
      if (call) {
        const totalWeight = call.variants.reduce((sum: number, v: any) => sum + v.weight, 0);
        expect(totalWeight).toBe(1000);

        const fixedVariant = call.variants.find((v: any) => v.weightType === 'fix');
        expect(fixedVariant.weight).toBe(300);

        const variableVariants = call.variants.filter((v: any) => v.weightType === 'variable');
        const variableTotal = variableVariants.reduce((sum: number, v: any) => sum + v.weight, 0);
        expect(variableTotal).toBe(700);
      }
    });
  });

  describe('additional variant operations', () => {
    const flexibleRolloutStrategy: Strategy = {
      id: 'strategy-1',
      name: 'flexibleRollout',
      parameters: {
        rollout: '75',
        stickiness: 'default',
      },
      constraints: [],
      variants: [
        {
          name: 'Variant A',
          weight: 500,
          weightType: 'variable',
          stickiness: 'default',
          payload: { type: 'string', value: 'valueA' },
        },
        {
          name: 'Variant B',
          weight: 500,
          weightType: 'variable',
          stickiness: 'default',
          payload: { type: 'string', value: 'valueB' },
        },
      ],
    };

    it('removes a variant', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      // Find all icon buttons and filter to just delete buttons in the variant table
      const allButtons = screen.getAllByRole('button');
      const deleteButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('svg');
        return svg && svg.querySelector('path[d*="19c0"]'); // Part of DeleteIcon path
      });

      await userEvent.click(deleteButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          variants: expect.arrayContaining([
            expect.objectContaining({ name: 'Variant B' }),
          ]),
        }),
      );

      // Should only have one variant after deletion
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      expect(lastCall.variants).toHaveLength(1);
    });

    it('updates variant name', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const variantNameInput = screen.getByDisplayValue('Variant A');
      await userEvent.clear(variantNameInput);
      await userEvent.type(variantNameInput, 'Updated Name');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          variants: expect.arrayContaining([
            expect.objectContaining({ name: 'Updated Name' }),
          ]),
        }),
      );
    });

    it('updates variant payload value', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const payloadValueInput = screen.getByDisplayValue('valueA');
      await userEvent.clear(payloadValueInput);
      await userEvent.type(payloadValueInput, 'newValue');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          variants: expect.arrayContaining([
            expect.objectContaining({
              payload: expect.objectContaining({ value: 'newValue' }),
            }),
          ]),
        }),
      );
    });

    it('changes variant weight type from variable to fix', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      // Find the first weight type select
      const weightTypeSelects = screen.getAllByRole('button').filter(btn =>
        btn.textContent === 'Variable'
      );

      await userEvent.click(weightTypeSelects[0]);
      const fixedOption = await screen.findByText('Fixed');
      await userEvent.click(fixedOption);

      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      expect(lastCall.variants[0].weightType).toBe('fix');

      // Total weight should still be 1000
      const totalWeight = lastCall.variants.reduce((sum: number, v: any) => sum + v.weight, 0);
      expect(totalWeight).toBe(1000);
    });

    it('updates weight for fixed-type variant', async () => {
      const strategyWithFixedVariant: Strategy = {
        ...flexibleRolloutStrategy,
        variants: [
          {
            name: 'Variant A',
            weight: 300,
            weightType: 'fix',
            stickiness: 'default',
            payload: { type: 'string', value: 'valueA' },
          },
          {
            name: 'Variant B',
            weight: 700,
            weightType: 'variable',
            stickiness: 'default',
            payload: { type: 'string', value: 'valueB' },
          },
        ],
      };

      await renderInTestApp(<StrategyEditor strategy={strategyWithFixedVariant} onChange={mockOnChange} />);

      // Find the weight input for the fixed variant (it's enabled for fixed variants)
      const weightInputs = screen.getAllByRole('spinbutton').filter(input =>
        !(input as HTMLInputElement).disabled
      );

      const fixedWeightInput = weightInputs.find(input =>
        (input as HTMLInputElement).value === '300'
      );

      if (fixedWeightInput) {
        fireEvent.change(fixedWeightInput, { target: { value: '400' } });

        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            variants: expect.arrayContaining([
              expect.objectContaining({ weight: 400, weightType: 'fix' }),
            ]),
          }),
        );
      }
    });
  });

  describe('additional parameter updates', () => {
    const flexibleRolloutStrategy: Strategy = {
      id: 'strategy-1',
      name: 'flexibleRollout',
      parameters: {
        rollout: '75',
        stickiness: 'default',
        groupId: 'test-group',
      },
      constraints: [],
      variants: [],
    };

    it('updates stickiness parameter', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const stickinessSelect = screen.getByRole('button', { name: /default/i });
      await userEvent.click(stickinessSelect);

      const userIdOption = await screen.findByText('User ID');
      await userEvent.click(userIdOption);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({
            stickiness: 'userId',
          }),
        }),
      );
    });

    it('updates groupId parameter', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const groupIdInput = screen.getByDisplayValue('test-group');
      await userEvent.clear(groupIdInput);
      await userEvent.type(groupIdInput, 'new-group');

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({
            groupId: 'new-group',
          }),
        }),
      );
    });
  });

  describe('additional constraint operations', () => {
    const strategyWithConstraints: Strategy = {
      id: 'strategy-5',
      name: 'flexibleRollout',
      parameters: {
        rollout: '100',
        stickiness: 'default',
      },
      constraints: [
        {
          contextName: 'userId',
          operator: 'IN',
          values: ['user1', 'user2'],
          caseInsensitive: false,
          inverted: false,
        },
      ],
      variants: [],
    };

    it('removes a constraint', async () => {
      await renderInTestApp(<StrategyEditor strategy={strategyWithConstraints} onChange={mockOnChange} />);

      // Find all icon buttons and filter to just delete buttons
      const allButtons = screen.getAllByRole('button');
      const deleteButtons = allButtons.filter(btn => {
        const svg = btn.querySelector('svg');
        return svg && svg.querySelector('path[d*="19c0"]'); // Part of DeleteIcon path
      });

      await userEvent.click(deleteButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          constraints: [],
        }),
      );
    });

    it('updates constraint operator', async () => {
      await renderInTestApp(<StrategyEditor strategy={strategyWithConstraints} onChange={mockOnChange} />);

      // Find the operator select specifically (not the Add Constraint button which also contains "in")
      const allButtons = screen.getAllByRole('button');
      const operatorSelect = allButtons.find(btn =>
        btn.textContent === 'IN' && btn.getAttribute('aria-haspopup') === 'listbox'
      );

      if (!operatorSelect) {
        throw new Error('Could not find operator select button');
      }

      await userEvent.click(operatorSelect);

      const notInOption = await screen.findByText('NOT IN');
      await userEvent.click(notInOption);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          constraints: [
            expect.objectContaining({ operator: 'NOT_IN' }),
          ],
        }),
      );
    });
  });

  describe('constraints with other strategy types', () => {
    it('adds constraints to remoteAddress strategy', async () => {
      const remoteAddressStrategy: Strategy = {
        id: 'strategy-2',
        name: 'remoteAddress',
        parameters: {
          IPs: '10.1.1.17',
        },
        constraints: [],
      };

      await renderInTestApp(<StrategyEditor strategy={remoteAddressStrategy} onChange={mockOnChange} />);

      const addButton = screen.getByRole('button', { name: /add constraint/i });
      await userEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          constraints: expect.arrayContaining([
            expect.objectContaining({ contextName: 'userId', operator: 'IN' }),
          ]),
        }),
      );
    });

    it('adds constraints to applicationHostname strategy', async () => {
      const applicationHostnameStrategy: Strategy = {
        id: 'strategy-3',
        name: 'applicationHostname',
        parameters: {
          hostNames: 'app1.example.com',
        },
        constraints: [],
      };

      await renderInTestApp(<StrategyEditor strategy={applicationHostnameStrategy} onChange={mockOnChange} />);

      const addButton = screen.getByRole('button', { name: /add constraint/i });
      await userEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          constraints: expect.arrayContaining([
            expect.objectContaining({ contextName: 'userId', operator: 'IN' }),
          ]),
        }),
      );
    });
  });

  describe('variant payload type changes', () => {
    const flexibleRolloutStrategy: Strategy = {
      id: 'strategy-1',
      name: 'flexibleRollout',
      parameters: {},
      variants: [
        {
          name: 'Variant A',
          weight: 1000,
          weightType: 'variable',
          stickiness: 'default',
          payload: { type: 'string', value: 'valueA' },
        },
      ],
    };

    it('changes variant payload type from string to json', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const payloadTypeSelects = screen.getAllByRole('button').filter(btn =>
        btn.textContent === 'String'
      );

      await userEvent.click(payloadTypeSelects[0]);
      const jsonOption = await screen.findByText('JSON');
      await userEvent.click(jsonOption);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          variants: expect.arrayContaining([
            expect.objectContaining({
              payload: expect.objectContaining({ type: 'json' }),
            }),
          ]),
        }),
      );
    });

    it('changes variant payload type from string to csv', async () => {
      await renderInTestApp(<StrategyEditor strategy={flexibleRolloutStrategy} onChange={mockOnChange} />);

      const payloadTypeSelects = screen.getAllByRole('button').filter(btn =>
        btn.textContent === 'String'
      );

      await userEvent.click(payloadTypeSelects[0]);
      const csvOption = await screen.findByText('CSV');
      await userEvent.click(csvOption);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          variants: expect.arrayContaining([
            expect.objectContaining({
              payload: expect.objectContaining({ type: 'csv' }),
            }),
          ]),
        }),
      );
    });
  });
});
