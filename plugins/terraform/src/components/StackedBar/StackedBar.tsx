import { Grid } from '@material-ui/core';
import React from 'react';

export interface StackedBarItem {
  id: string;
  name: string;
  value: number;
  color: string;
  textColor?: string;
}

interface Props {
  data: StackedBarItem[];
}

export const StackedBar = ({ data }: Props) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ width: '100%' }}>
      <Grid container spacing={0} alignItems="center">
        {data.map(item => {
          const segmentWidth = `${(item.value / totalValue) * 100}%`;
          return (
            <Grid
              item
              style={{
                width: segmentWidth,
                backgroundColor: item.color,
                height: '20px',
              }}
              key={item.id}
              id={`${item.id}-segment`}
            />
          );
        })}
      </Grid>
      <div style={{ marginTop: '5px' }}>
        <Grid container spacing={2} justifyContent="space-between">
          {data.map((item, index) => {
            let textAlign: React.CSSProperties['textAlign'] = 'left';
            if (data.length === 2 && index === 1) {
              textAlign = 'right';
            } else if (data.length === 3) {
              if (index === 1) {
                textAlign = 'center';
              } else if (index === 2) {
                textAlign = 'right';
              }
            }

            return (
              <Grid
                item
                key={item.id}
                style={{ textAlign: textAlign, flexGrow: 1 }}
              >
                <div
                  id={`${item.id}-value`}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}:{' '}
                  <span style={{ color: item.textColor }}>{item.value}</span>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </div>
  );
};

export default StackedBar;
