import { useEffect, useState } from 'react';
import api from '../services/api';
import MatchCard from '../components/MatchCard';

const PredictionHub = () => {
    const [matches, setMatches] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [windowInfo, setWindowInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [windowRes, predictionsRes] = await Promise.all([
                api.get('/matches/prediction-window'),
                api.get('/predictions/me')
            ]);

            setMatches(windowRes.data.matches || []);
            setWindowInfo(windowRes.data);
            setPredictions(predictionsRes.data || []);
        } catch (error) {
            console.error('Error fetching prediction window', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <div className="py-12 text-center text-[#b7c9bb]">Chargement des matchs a predire...</div>;
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <div className="rounded-[32px] border border-[#d8ead8] bg-[linear-gradient(135deg,#f7fcf6_0%,#ebf7eb_100%)] px-8 py-10 text-[#103a1f] shadow-2xl shadow-green-950/10">
                <div className="text-sm font-bold uppercase tracking-[0.28em] text-[#2f8f46]">Prediction window</div>
                <h1 className="mt-3 text-4xl font-black">Pronostics des prochaines 24 heures</h1>
                <p className="mt-4 max-w-2xl text-[#54705c]">
                    Cette page montre uniquement les matchs Coupe du Monde 2026 qui commencent dans les prochaines 24 heures. Les pronostics se verrouillent automatiquement au coup d envoi.
                </p>
                {windowInfo?.windowEnd && (
                    <div className="mt-6 inline-flex rounded-full border border-[#bfe2c4] bg-white px-4 py-2 text-sm font-medium text-[#2f8f46]">
                        Fenetre active jusqu au {new Date(windowInfo.windowEnd).toLocaleString()}
                    </div>
                )}
            </div>

            <div className="mt-8">
                {matches.length === 0 ? (
                    <div className="rounded-[28px] border border-[#d8ead8] bg-white p-8 text-[#54705c] shadow-lg shadow-green-950/10">
                        Aucun match a predire dans les prochaines 24 heures.
                    </div>
                ) : (
                    matches.map((match) => {
                        const prediction = predictions.find((item) => item.matchId?._id === match._id || item.matchId === match._id);
                        return (
                            <MatchCard
                                key={match._id}
                                match={match}
                                prediction={prediction}
                                onPredictionSaved={fetchData}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PredictionHub;
