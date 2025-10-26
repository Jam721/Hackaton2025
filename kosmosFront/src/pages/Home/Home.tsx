import SolarSystem from '../../components/SolarSystem/SolarSystem';
import { useSolarSystem } from '../../hooks/useSolarSystem';
import "./Home.css"

export const Home: React.FC = () => {
    const { celestialBodies, selectedBody, handleBodyClick, loading } = useSolarSystem();

    return (
        <div className="home">
            <main className="main">
                <SolarSystem
                    bodies={celestialBodies}
                    onBodyClick={handleBodyClick}
                    selectedBody={selectedBody}
                    loading={loading}
                />
            </main>
        </div>
    );
};

