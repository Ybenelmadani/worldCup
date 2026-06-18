import { useState, useEffect } from 'react';
import api from '../services/api';
import MatchCard from '../components/MatchCard';

const MyPredictions = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/predictions/me');
            setPredictions(res.data);
        } catch (error) {
            console.error('Error fetching predictions', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="mt-10 text-center text-[#b7c9bb]">Chargement...</div>;

    if (predictions.length === 0) return <div className="mt-10 text-center text-[#b7c9bb]">Vous n'avez fait aucun pronostic pour le moment.</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="mb-8 text-3xl font-bold text-[#f4f8f0]">Mes Pronostics</h1>
            {predictions.map(pred => (
                <MatchCard key={pred._id} match={pred.matchId} prediction={pred} onPredictionSaved={fetchData} />
            ))}
        </div>
    );
};

export default MyPredictions;
