import { AppProvider } from './context/AppContext';
import AppLayout from './components/Layout/AppLayout';
import './styles/global.css';

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
