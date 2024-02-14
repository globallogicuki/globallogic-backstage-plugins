import React from 'react';
import useAsync from 'react-use/lib/useAsync';
import {
  LogViewer as LogViewerBackstage,
  Progress,
} from '@backstage/core-components';

interface Props {
  txtUrl: string;
}

const getLogs = async (url: string) => {
  const res = await fetch(url);
  const text = await res.text();

  return text;
};

export const LogViewer = ({ txtUrl }: Props) => {
  const { value, loading, error } = useAsync(async () => getLogs(txtUrl), []);

  if (loading) {
    return <Progress style={{ width: '100%' }} />;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div style={{ height: '100vh', width: '70vw' }}>
      <LogViewerBackstage text={value!} />
    </div>
  );
};
