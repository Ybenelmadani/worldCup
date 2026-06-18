import { useState, useEffect } from 'react';
import api from '../services/api';
import TeamBadge from './TeamBadge';

const TodayMatches = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [loadingPredictions, setLoadingPredictions] = useState(false);

    useEffect(() => {
        const fetchTodayMatches = async () => {
            try {
                const res = await api.get('/matches/today');
                setMatches(res.data);
            } catch (error) {
                console.error('Error fetching today matches', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTodayMatches();
    }, []);

    const viewPredictions = async (matchId) => {
        if (selectedMatch === matchId) {
            setSelectedMatch(null);
            return;
        }

        setSelectedMatch(matchId);
        setLoadingPredictions(true);

        try {
            const res = await api.get(`/matches/${matchId}/predictions`);
            setPredictions(res.data);
        } catch (error) {
            console.error('Error fetching predictions', error);
        } finally {
            setLoadingPredictions(false);
        }
    };

    if (loading) {
        return <div className="py-10 text-center text-[#b7c9bb]">Chargement des matchs du jour...</div>;
    }

    if (matches.length === 0) {
        return (
            <div className="rounded-[24px] border border-[#d8ead8] bg-white p-6 shadow-lg shadow-green-950/10">
                <h3 className="text-xl font-black text-[#103a1f]">Matchs du jour</h3>
                <p className="mt-2 text-[#54705c]">Aucun match n'est prevu pour aujourd'hui.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[28px] border border-[#24472f] bg-[#0b1c12] shadow-lg shadow-black/30">
            <div className="border-b border-[#295b38]/60 bg-[#12311c] p-5 text-white">
                <h3 className="text-xl font-black">Matchs du jour</h3>
                <p className="mt-1 text-sm text-[#b7c9bb]">
                    Consulte en temps reel les pronostics des autres joueurs pour les rencontres d'aujourd'hui.
                </p>
            </div>

            <div className="divide-y divide-[#295b38]/50">
                {matches.map((match) => (
                    <div key={match._id} className="p-4 transition hover:bg-[#112a1b]">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-1 items-center justify-end gap-3 text-right">
                                <div className="text-lg font-black text-white">{match.teamHome}</div>
                                <TeamBadge src={match.flagHome} alt={match.teamHome} size="sm" />
                            </div>
                            <div className="min-w-[110px] text-center">
                                <span className={`rounded-full px-3 py-1 text-sm font-bold ${match.status === 'live' ? 'bg-[#1f7a36] text-white' : 'bg-[#edf8ec] text-[#2f8f46]'}`}>
                                    {match.status === 'finished'
                                        ? `${match.scoreHome} - ${match.scoreAway}`
                                        : match.status === 'live'
                                            ? 'EN DIRECT'
                                            : new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex flex-1 items-center justify-start gap-3 text-left">
                                <TeamBadge src={match.flagAway} alt={match.teamAway} size="sm" />
                                <div className="text-lg font-black text-white">{match.teamAway}</div>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => viewPredictions(match._id)}
                                className="text-sm font-bold text-[#9ce2ac] underline decoration-[#9ce2ac]/50 underline-offset-4 transition hover:text-white"
                            >
                                {selectedMatch === match._id ? 'Masquer les pronostics' : 'Voir les pronostics des joueurs'}
                            </button>
                        </div>

                        {selectedMatch === match._id && (
                            <div className="mt-5 rounded-2xl border border-[#295b38]/60 bg-[#12311c] p-5">
                                {loadingPredictions ? (
                                    <div className="py-4 text-center text-sm text-[#b7c9bb]">Chargement des pronostics...</div>
                                ) : predictions.length === 0 ? (
                                    <div className="py-4 text-center text-sm text-[#b7c9bb]">Personne n'a encore ose pronostiquer ce match.</div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {predictions.map((pred) => (
                                            <div key={pred._id} className="rounded-2xl border border-[#295b38]/60 bg-[#0b1c12] p-3 text-center shadow-sm">
                                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1f7a36] text-sm font-black text-white">
                                                    {pred.userId.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="truncate text-xs font-bold text-[#edf7ef]" title={pred.userId.name}>
                                                    {pred.userId.name}
                                                </div>
                                                <div className="mt-2 rounded-xl bg-[#edf8ec] py-2 font-mono text-lg font-black text-[#2f8f46]">
                                                    {pred.predictedHomeScore} - {pred.predictedAwayScore}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodayMatches;
