import { Theme } from '@material-ui/core';

export const getColor = (status: string, theme: Theme): string => {
  switch (status) {
    case 'applied':
      return theme.palette.success.light;
    case 'planned':
      return theme.palette.info.main;
    case 'planned_and_finished':
      return theme.palette.info.light;
    case 'errored':
      return theme.palette.error.light;
    default:
      return theme.palette.action.selected;
  }
};
