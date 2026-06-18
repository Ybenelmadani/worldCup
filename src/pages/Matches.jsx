import { useState, useEffect } from 'react';
import api from '../services/api';
import MatchCard from '../components/MatchCard';

const Matches = () => {
    const [matches, setMatches] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [matchesRes, predictionsRes] = await Promise.all([
                api.get('/matches'),
                api.get('/predictions/me')
            ]);
            setMatches(matchesRes.data);
            setPredictions(predictionsRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="mt-10 text-center text-[#b7c9bb]">Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="mb-2 text-3xl font-bold text-[#f4f8f0]">Tous les matchs</h1>
            <p className="mb-8 text-[#b7c9bb]">Cette page garde la liste complete. Pour les pronostics limites aux prochaines 24 heures, utilise la page "Predire 24h".</p>
            {matches.map(match => {
                const prediction = predictions.find(p => p.matchId._id === match._id || p.matchId === match._id);
                return (
                    <MatchCard key={match._id} match={match} prediction={prediction} onPredictionSaved={fetchData} />
                );
            })}
        </div>
    );
};

export default Matches;
