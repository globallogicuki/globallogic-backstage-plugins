const colorMap: Record<string, string> = {
  applied: '#a4f78d',
  planned: '#8ccbf5',
  planned_and_finished: '#c9fdf9',
  errored: '#ff9494',
  default: '#dbdbdb',
};

export const getColor = (status: string) =>
  colorMap[status] || colorMap.default;
