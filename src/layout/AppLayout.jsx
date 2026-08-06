import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';

export default function AppLayout() {
    return (
        <div className="bron-layout">
            <AppTopbar />
            <div className="bron-body">
                <AppSidebar />
                <main className="bron-main" id="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
