import { useApp } from 'components/hooks/useApp';


export const ReactView = () => {
  const { vault } = useApp();

  console.log('hello react')
  return (<h4>vault name: {vault.getName()}</h4>);

  };