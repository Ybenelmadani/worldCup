import { useState } from 'react';
import api from '../services/api';
import TeamBadge from './TeamBadge';

const MatchCard = ({ match, prediction, onPredictionSaved }) => {
    const [homeScore, setHomeScore] = useState(prediction ? prediction.predictedHomeScore : '');
    const [awayScore, setAwayScore] = useState(prediction ? prediction.predictedAwayScore : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isLocked = match.status !== 'upcoming' || new Date() >= new Date(match.matchDate) || (prediction && prediction.isLocked);

    const handleSave = async () => {
        if (homeScore === '' || awayScore === '') return;
        setLoading(true);
        setError('');
        try {
            if (prediction) {
                await api.put(`/predictions/${prediction._id}`, {
                    predictedHomeScore: Number(homeScore),
                    predictedAwayScore: Number(awayScore)
                });
            } else {
                await api.post('/predictions', {
                    matchId: match._id,
                    predictedHomeScore: Number(homeScore),
                    predictedAwayScore: Number(awayScore)
                });
            }
            if (onPredictionSaved) onPredictionSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur');
        }
        setLoading(false);
    };

    return (
        <div className="mb-4 rounded-[26px] border border-[#d8ead8] bg-white p-4 shadow-[0_24px_70px_-45px_rgba(16,58,31,0.18)]">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-[#66806d]">{match.groupName}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${match.status === 'upcoming' ? 'bg-[#edf8ec] text-[#2f8f46]' : match.status === 'live' ? 'bg-[#1f7a36] text-white' : 'bg-[#103a1f] text-white'}`}>
                    {match.status === 'upcoming' ? new Date(match.matchDate).toLocaleString() : match.status.toUpperCase()}
                </span>
            </div>
            
            <div className="flex justify-between items-center my-4">
                <div className="flex flex-col items-center w-1/3">
                    <div className="mb-2">
                        <TeamBadge src={match.flagHome} alt={match.teamHome} size="sm" />
                    </div>
                    <span className="text-xl font-bold text-[#103a1f]">{match.teamHome}</span>
                </div>
                
                <div className="flex items-center space-x-2 w-1/3 justify-center">
                    {isLocked ? (
                        <div className="rounded-2xl border border-[#cfe5cf] bg-[#f4faf4] px-4 py-2 text-2xl font-bold text-[#2f8f46] shadow-inner">
                            {prediction ? `${prediction.predictedHomeScore} - ${prediction.predictedAwayScore}` : '-'}
                        </div>
                    ) : (
                        <>
                            <input type="number" min="0" value={homeScore} onChange={e => setHomeScore(e.target.value)} className="w-14 rounded-xl border border-[#cfe5cf] bg-[#f8fcf7] p-1 text-center text-xl font-bold text-[#103a1f] focus:border-[#2f8f46] focus:ring-1 focus:ring-[#2f8f46] focus:outline-none" />
                            <span className="mx-2 font-bold text-[#66806d]">-</span>
                            <input type="number" min="0" value={awayScore} onChange={e => setAwayScore(e.target.value)} className="w-14 rounded-xl border border-[#cfe5cf] bg-[#f8fcf7] p-1 text-center text-xl font-bold text-[#103a1f] focus:border-[#2f8f46] focus:ring-1 focus:ring-[#2f8f46] focus:outline-none" />
                        </>
                    )}
                </div>

                <div className="flex flex-col items-center w-1/3">
                    <div className="mb-2">
                        <TeamBadge src={match.flagAway} alt={match.teamAway} size="sm" />
                    </div>
                    <span className="text-xl font-bold text-[#103a1f]">{match.teamAway}</span>
                </div>
            </div>

            {match.status === 'finished' && (
                <div className="mb-2 text-center text-sm text-[#54705c]">
                    Score final: <span className="font-bold">{match.scoreHome} - {match.scoreAway}</span>
                </div>
            )}

            {error && <div className="text-red-500 text-center text-sm mb-2">{error}</div>}

            {!isLocked && (
                <div className="text-center mt-4">
                    <button onClick={handleSave} disabled={loading || homeScore === '' || awayScore === ''} className="rounded-full border border-[#2f8f46] bg-[#2f8f46] px-6 py-2 font-bold text-white shadow transition hover:bg-[#256f38] disabled:opacity-50">
                        {loading ? 'Sauvegarde...' : 'Sauvegarder Pronostic'}
                    </button>
                </div>
            )}

            {prediction && isLocked && (
                <div className="mt-4 border-t border-[#d8ead8] pt-2 text-center text-sm text-[#54705c]">
                    Points obtenus : <span className="ml-2 text-xl font-bold text-[#2f8f46]">{prediction.points}</span>
                </div>
            )}
        </div>
    );
};

export default MatchCard;
