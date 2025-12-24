import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  makeStyles,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import type {
  Strategy,
  Variant,
  Constraint,
} from '@internal/backstage-plugin-unleash-common';

const useStyles = makeStyles(theme => ({
  section: {
    marginBottom: theme.spacing(3),
  },
  addButton: {
    marginTop: theme.spacing(1),
  },
  table: {
    marginTop: theme.spacing(1),
  },
  weightInput: {
    width: 100,
  },
  typeChip: {
    marginLeft: theme.spacing(1),
  },
}));

interface StrategyEditorProps {
  strategy: Strategy;
  onChange: (strategy: Strategy) => void;
}

export const StrategyEditor = ({ strategy, onChange }: StrategyEditorProps) => {
  const classes = useStyles();
  const [localStrategy, setLocalStrategy] = useState<Strategy>(strategy);

  // Variant weight management following Unleash's logic
  const recalculateVariantWeights = (variants: Variant[]): Variant[] => {
    const total = 1000; // 100%

    // Count fixed weights
    const fixedVariants = variants.filter(v => v.weightType === 'fix');
    const variableVariants = variants.filter(v => v.weightType === 'variable');

    if (fixedVariants.length === 0) {
      // All variable - split evenly
      const evenWeight = Math.floor(total / variants.length);
      const remainder = total - evenWeight * variants.length;

      return variants.map((v, i) => ({
        ...v,
        weight: i === 0 ? evenWeight + remainder : evenWeight,
        weightType: 'variable' as const,
      }));
    }

    // Calculate remaining weight for variable variants
    const fixedTotal = fixedVariants.reduce((sum, v) => sum + v.weight, 0);
    const remainingWeight = total - fixedTotal;

    if (variableVariants.length === 0) {
      return variants;
    }

    const evenVariableWeight = Math.floor(
      remainingWeight / variableVariants.length,
    );
    const variableRemainder =
      remainingWeight - evenVariableWeight * variableVariants.length;

    let variableIndex = 0;
    return variants.map(v => {
      if (v.weightType === 'fix') {
        return v;
      }
      const weight =
        variableIndex === 0
          ? evenVariableWeight + variableRemainder
          : evenVariableWeight;
      variableIndex++;
      return { ...v, weight };
    });
  };

  useEffect(() => {
    setLocalStrategy(strategy);
  }, [strategy]);

  // Recalculate variant weights on mount to ensure proper distribution
  useEffect(() => {
    if (strategy.variants && strategy.variants.length > 0) {
      const recalculated = recalculateVariantWeights(strategy.variants);
      const updated = { ...strategy, variants: recalculated };
      setLocalStrategy(updated);
      onChange(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStrategy = (updates: Partial<Strategy>) => {
    const updated = { ...localStrategy, ...updates };
    setLocalStrategy(updated);
    onChange(updated);
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: any,
  ) => {
    const newVariants = [...(localStrategy.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };

    const recalculated = recalculateVariantWeights(newVariants);
    updateStrategy({ variants: recalculated });
  };

  const handleVariantWeightTypeChange = (
    index: number,
    weightType: 'fix' | 'variable',
  ) => {
    const newVariants = [...(localStrategy.variants || [])];
    newVariants[index] = { ...newVariants[index], weightType };

    const recalculated = recalculateVariantWeights(newVariants);
    updateStrategy({ variants: recalculated });
  };

  const addVariant = () => {
    const newVariant: Variant = {
      name: `Variant ${(localStrategy.variants?.length || 0) + 1}`,
      weight: 0,
      weightType: 'variable',
      stickiness: 'default',
      payload: { type: 'string', value: '' },
    };

    const newVariants = [...(localStrategy.variants || []), newVariant];
    const recalculated = recalculateVariantWeights(newVariants);
    updateStrategy({ variants: recalculated });
  };

  const removeVariant = (index: number) => {
    const newVariants = (localStrategy.variants || []).filter(
      (_, i) => i !== index,
    );
    const recalculated = recalculateVariantWeights(newVariants);
    updateStrategy({ variants: recalculated });
  };

  const addConstraint = () => {
    const newConstraint: Constraint = {
      contextName: 'userId',
      operator: 'IN',
      values: [''],
      caseInsensitive: false,
      inverted: false,
    };

    updateStrategy({
      constraints: [...(localStrategy.constraints || []), newConstraint],
    });
  };

  const updateConstraint = (index: number, updates: Partial<Constraint>) => {
    const newConstraints = [...(localStrategy.constraints || [])];
    newConstraints[index] = { ...newConstraints[index], ...updates };
    updateStrategy({ constraints: newConstraints });
  };

  const removeConstraint = (index: number) => {
    updateStrategy({
      constraints: (localStrategy.constraints || []).filter(
        (_, i) => i !== index,
      ),
    });
  };

  const totalWeight = (localStrategy.variants || []).reduce(
    (sum, v) => sum + v.weight,
    0,
  );
  const variableCount = (localStrategy.variants || []).filter(
    v => v.weightType === 'variable',
  ).length;

  // Determine if this strategy type is supported for editing
  const supportedStrategies = [
    'flexibleRollout',
    'remoteAddress',
    'applicationHostname',
  ];
  const isSupported = supportedStrategies.includes(localStrategy.name);

  if (!isSupported) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="textSecondary">
          Strategy type "{localStrategy.name}" is not editable in this
          interface. Use the Unleash console to edit this strategy type.
        </Typography>
      </Box>
    );
  }

  const renderParametersSection = () => {
    switch (localStrategy.name) {
      case 'flexibleRollout':
        return (
          <>
            <TextField
              label="Rollout %"
              type="number"
              value={localStrategy.parameters?.rollout || '100'}
              onChange={e =>
                updateStrategy({
                  parameters: {
                    ...localStrategy.parameters,
                    rollout: e.target.value,
                  },
                })
              }
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              style={{ width: 120 }}
            />
            <FormControl style={{ width: 150 }}>
              <InputLabel>Stickiness</InputLabel>
              <Select
                value={localStrategy.parameters?.stickiness || 'default'}
                onChange={e =>
                  updateStrategy({
                    parameters: {
                      ...localStrategy.parameters,
                      stickiness: e.target.value as string,
                    },
                  })
                }
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="userId">User ID</MenuItem>
                <MenuItem value="sessionId">Session ID</MenuItem>
                <MenuItem value="random">Random</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Group ID"
              value={localStrategy.parameters?.groupId || ''}
              onChange={e =>
                updateStrategy({
                  parameters: {
                    ...localStrategy.parameters,
                    groupId: e.target.value,
                  },
                })
              }
              style={{ width: 200 }}
            />
          </>
        );

      case 'remoteAddress':
        return (
          <TextField
            label="IP Addresses (comma separated)"
            value={localStrategy.parameters?.IPs || ''}
            onChange={e =>
              updateStrategy({
                parameters: { IPs: e.target.value },
              })
            }
            placeholder="e.g., 10.1.1.17, 192.168.1.0/24"
            fullWidth
            helperText="Enter IP addresses or CIDR ranges separated by commas"
          />
        );

      case 'applicationHostname':
        return (
          <TextField
            label="Hostnames (comma separated)"
            value={localStrategy.parameters?.hostNames || ''}
            onChange={e =>
              updateStrategy({
                parameters: { hostNames: e.target.value },
              })
            }
            placeholder="e.g., app1.example.com, app2.example.com"
            fullWidth
            helperText="Enter hostnames separated by commas"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Parameters */}
      <Box className={classes.section}>
        <Typography variant="subtitle2" gutterBottom>
          Parameters
        </Typography>
        <Box display="flex" flexWrap="wrap" style={{ gap: 16 }}>
          {renderParametersSection()}
        </Box>
      </Box>

      <Divider />

      {/* Constraints */}
      <Box className={classes.section}>
        <Typography variant="subtitle2" gutterBottom>
          Constraints
        </Typography>
        {(localStrategy.constraints || []).map((constraint, index) => (
          <Box key={index} display="flex" alignItems="center" mb={1}>
            <TextField
              label="Context"
              value={constraint.contextName}
              onChange={e =>
                updateConstraint(index, { contextName: e.target.value })
              }
              style={{ width: 150 }}
            />
            <FormControl style={{ width: 100 }}>
              <InputLabel>Operator</InputLabel>
              <Select
                value={constraint.operator}
                onChange={e =>
                  updateConstraint(index, {
                    operator: e.target.value as string,
                  })
                }
              >
                <MenuItem value="IN">IN</MenuItem>
                <MenuItem value="NOT_IN">NOT IN</MenuItem>
                <MenuItem value="STR_CONTAINS">Contains</MenuItem>
                <MenuItem value="STR_STARTS_WITH">Starts with</MenuItem>
                <MenuItem value="STR_ENDS_WITH">Ends with</MenuItem>
                <MenuItem value="NUM_EQ">= (number)</MenuItem>
                <MenuItem value="NUM_GT">{'>'} (number)</MenuItem>
                <MenuItem value="NUM_LT">{'<'} (number)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Values (comma separated)"
              value={(constraint.values || []).join(', ')}
              onChange={e =>
                updateConstraint(index, {
                  values: e.target.value.split(',').map(v => v.trim()),
                })
              }
              style={{ flexGrow: 1 }}
            />
            <IconButton size="small" onClick={() => removeConstraint(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={addConstraint}
          className={classes.addButton}
          size="small"
        >
          Add Constraint
        </Button>
      </Box>

      <Divider />

      {/* Variants - only for flexibleRollout */}
      {localStrategy.name === 'flexibleRollout' && (
        <Box className={classes.section}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2">
              Variants
              {totalWeight !== 1000 && (
                <Chip
                  size="small"
                  label={`Warning: Total ${totalWeight / 10}% (should be 100%)`}
                  color="secondary"
                  className={classes.typeChip}
                />
              )}
            </Typography>
          </Box>

          <Table size="small" className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Payload Type</TableCell>
                <TableCell>Payload Value</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(localStrategy.variants || []).map((variant, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      value={variant.name}
                      onChange={e =>
                        handleVariantChange(index, 'name', e.target.value)
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={variant.weight}
                      onChange={e =>
                        handleVariantChange(
                          index,
                          'weight',
                          parseInt(e.target.value, 10) || 0,
                        )
                      }
                      size="small"
                      className={classes.weightInput}
                      disabled={variant.weightType === 'variable'}
                      InputProps={{
                        endAdornment: (
                          <span>({(variant.weight / 10).toFixed(1)}%)</span>
                        ),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={variant.weightType}
                      onChange={e =>
                        handleVariantWeightTypeChange(
                          index,
                          e.target.value as 'fix' | 'variable',
                        )
                      }
                    >
                      <MenuItem value="variable">Variable</MenuItem>
                      <MenuItem
                        value="fix"
                        disabled={
                          variant.weightType === 'variable' &&
                          variableCount <= 1
                        }
                      >
                        Fixed
                      </MenuItem>
                    </Select>
                    {variant.weightType === 'variable' &&
                      variableCount <= 1 && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          At least 1 must be variable
                        </Typography>
                      )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={variant.payload?.type || 'string'}
                      onChange={e =>
                        handleVariantChange(index, 'payload', {
                          ...variant.payload,
                          type: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="string">String</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={variant.payload?.value || ''}
                      onChange={e =>
                        handleVariantChange(index, 'payload', {
                          ...variant.payload,
                          value: e.target.value,
                        })
                      }
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => removeVariant(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            startIcon={<AddIcon />}
            onClick={addVariant}
            className={classes.addButton}
            size="small"
          >
            Add Variant
          </Button>
        </Box>
      )}
    </Box>
  );
};
