import { Layout } from 'react-admin';
import { MyAppBar } from './MyAppBar';

export const MyLayout = (props: any) => <Layout {...props} appBar={MyAppBar} />;
