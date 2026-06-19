import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import TeamBadge from '../components/TeamBadge';

const formatMatchTime = (date) => new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
});

const formatMatchDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
});

const LiveMatch = () => {
    const { fixtureId } = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLiveMatch = async () => {
            try {
                const res = await api.get('/matches/live');
                const currentMatch = (res.data?.matches || []).find((item) => String(item.fixtureId) === String(fixtureId));

                if (!currentMatch) {
                    setMatch(null);
                    setError('Ce match n est plus en direct pour le moment.');
                } else {
                    setMatch(currentMatch);
                    setError('');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Impossible de charger le direct.');
            } finally {
                setLoading(false);
            }
        };

        fetchLiveMatch();
        const intervalId = window.setInterval(fetchLiveMatch, 30000);

        return () => window.clearInterval(intervalId);
    }, [fixtureId]);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top,rgba(111,219,134,0.12),transparent_24%),linear-gradient(180deg,#0f2517_0%,#08150d_72%)] px-4 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#7dc38d]">live center</div>
                        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Suivre maintenant</h1>
                    </div>
                    <Link
                        to="/"
                        className="rounded-full border border-[#3d6f49] bg-[rgba(7,20,12,0.4)] px-4 py-2 text-sm font-bold text-[#e8f5ea] transition hover:bg-[rgba(7,20,12,0.62)]"
                    >
                        Retour accueil
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-[28px] border border-[#d8ead8] bg-white px-6 py-12 text-center text-[#54705c] shadow-[0_30px_90px_-60px_rgba(16,58,31,0.16)]">
                        Chargement du direct...
                    </div>
                ) : error ? (
                    <div className="rounded-[28px] border border-[rgba(255,154,154,0.25)] bg-white px-6 py-12 text-center text-[#b85b5b] shadow-[0_30px_90px_-60px_rgba(16,58,31,0.16)]">
                        {error}
                    </div>
                ) : match ? (
                    <div className="overflow-hidden rounded-[32px] border border-[#d8ead8] bg-white shadow-[0_35px_110px_-60px_rgba(16,58,31,0.18)]">
                        <div className="border-b border-[#d8ead8] bg-[linear-gradient(120deg,#eef8ee,#f8fcf7)] px-5 py-4 sm:px-7">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#66806d] sm:text-xs sm:tracking-[0.28em]">
                                    {match.groupName || match.competition || 'World Cup 2026'}
                                </div>
                                <div className="rounded-full border border-[#1f7a36] bg-[#1f7a36] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white sm:text-xs">
                                    {match.currentMinute ? `live ${match.currentMinute}'` : 'live'}
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-6 sm:px-7 sm:py-7">
                            <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
                                <div>
                                    <div className="flex items-center gap-4">
                                        <TeamBadge src={match.flagHome} alt={match.teamHome} />
                                        <div>
                                            <div className="text-2xl font-black text-[#103a1f] sm:text-3xl">{match.teamHome}</div>
                                            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#66806d] sm:text-xs">equipe 1</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[26px] bg-[#1f7a36] px-6 py-5 text-center text-white shadow-xl shadow-green-900/20">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#d8f5dc]">
                                        {match.currentMinute ? `${match.currentMinute}'` : 'live'}
                                    </div>
                                    <div className="mt-2 font-display text-5xl leading-none">
                                        {match.scoreHome ?? 0} - {match.scoreAway ?? 0}
                                    </div>
                                </div>

                                <div className="md:text-right">
                                    <div className="flex items-center gap-4 md:justify-end">
                                        <div className="md:order-1">
                                            <div className="text-2xl font-black text-[#103a1f] sm:text-3xl">{match.teamAway}</div>
                                            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#66806d] sm:text-xs">equipe 2</div>
                                        </div>
                                        <div className="md:order-2">
                                            <TeamBadge src={match.flagAway} alt={match.teamAway} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
                                <div className="rounded-full bg-[#e7f7ea] px-3 py-1 text-[#1f7a36]">Buteurs: {match.goals?.length || 0}</div>
                                <div className="rounded-full bg-[#f0f7f0] px-3 py-1 text-[#3f5f49]">Joueurs notes: {match.topPlayers?.length || 0}</div>
                                <div className="rounded-full bg-[#103a1f] px-3 py-1 text-white">MVP: {match.manOfTheMatch?.name || 'en attente'}</div>
                            </div>

                            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                                <div className="rounded-[26px] bg-[#f4faf4] p-5">
                                    <div className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#66806d]">Buts du match</div>
                                    {match.goals?.length > 0 ? (
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {match.goals.map((goal, index) => (
                                                <div key={`${goal.playerName}-${index}`} className="flex items-center justify-between rounded-2xl border border-[#dcecdc] bg-white px-4 py-3 text-sm shadow-sm">
                                                    <span className="font-bold text-[#103a1f]">{goal.playerName}</span>
                                                    <span className="font-black text-[#2f8f46]">{goal.minute}'</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-[#cfe5cf] bg-white px-4 py-4 text-sm text-[#54705c]">
                                            Aucun but detaille disponible pour le moment.
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-[26px] bg-[linear-gradient(135deg,#f2fbf2,#e4f5e6)] p-5">
                                    <div className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#2f8f46]">Infos live</div>
                                    <div className="space-y-3 text-sm text-[#3f5f49]">
                                        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                                            Coup d envoi: {formatMatchDate(match.matchDate)} a {formatMatchTime(match.matchDate)}
                                        </div>
                                        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                                            Stade: {match.venue || 'a confirmer'}
                                        </div>
                                        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                                            Competition: {match.competition || 'World Cup 2026'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default LiveMatch;
