import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface Props { children: React.ReactNode; }

export default function Layout({ children }: Props) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="page-wrapper animate-fade">
          {children}
        </main>
      </div>
    </div>
  );
}
