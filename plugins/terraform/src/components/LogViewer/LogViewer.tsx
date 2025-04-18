import {
  LogViewer as LogViewerBackstage,
  Progress,
} from '@backstage/core-components';
import { useLogs } from '../../hooks';

interface Props {
  txtUrl: string;
}

export const LogViewer = ({ txtUrl }: Props) => {
  const { data, isLoading, error } = useLogs(txtUrl);

  if (isLoading) {
    return <Progress style={{ width: '100%' }} />;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div style={{ height: '100vh', width: '70vw' }}>
      <LogViewerBackstage text={data!} />
    </div>
  );
};
