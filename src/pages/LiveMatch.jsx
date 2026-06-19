import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import TeamBadge from '../components/TeamBadge';

const WATCH_NOW_URL = import.meta.env.VITE_WATCH_NOW_URL || '';

const formatMatchTime = (date) => new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
});

const formatMatchDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
});

const buildGoalTimeline = (goals = [], homeTeam, awayTeam) => {
    let homeScore = 0;
    let awayScore = 0;

    return [...goals]
        .sort((a, b) => (a.minute || 0) - (b.minute || 0))
        .map((goal, index) => {
            const normalizedGoalTeam = (goal.team || '').trim().toLowerCase();
            const isHomeGoal = normalizedGoalTeam === (homeTeam || '').trim().toLowerCase();

            if (isHomeGoal) {
                homeScore += 1;
            } else {
                awayScore += 1;
            }

            return {
                ...goal,
                id: `${goal.playerName}-${goal.minute}-${index}`,
                scoreline: `${homeScore} - ${awayScore}`
            };
        })
        .reverse();
};

const StatChip = ({ label, value, accent = 'green' }) => {
    const palette = {
        green: 'bg-[#0f2d1a] text-[#79d18a] border-[#214e2d]',
        soft: 'bg-[#102919] text-[#dcecdf] border-[#1d4127]',
        gold: 'bg-[#2a2411] text-[#f3d27a] border-[#5b4c1d]'
    };

    return (
        <div className={`rounded-full border px-4 py-2 text-sm font-bold ${palette[accent] || palette.green}`}>
            {label}: {value}
        </div>
    );
};

const InfoTile = ({ label, value }) => (
    <div className="rounded-[24px] border border-[#1d4127] bg-[rgba(7,20,12,0.36)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6ea97a]">{label}</div>
        <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
);

const PlayerCard = ({ player, highlight = false }) => (
    <div className={`rounded-[24px] border px-4 py-4 ${highlight ? 'border-[#2f8f46] bg-[rgba(16,49,27,0.85)] shadow-[0_20px_50px_-35px_rgba(47,143,70,0.55)]' : 'border-[#1d4127] bg-[rgba(7,20,12,0.38)]'}`}>
        <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#295437] bg-[linear-gradient(135deg,#173724,#0c1e14)]">
                {player.photo ? (
                    <img src={player.photo} alt={player.name} className="h-full w-full object-cover" />
                ) : null}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-xl font-black text-white">{player.name}</div>
                    <div className={`rounded-full px-3 py-1 text-sm font-black ${highlight ? 'bg-[#f1c85d] text-[#1a1f12]' : 'bg-[#163523] text-[#d5ead8]'}`}>
                        {player.rating}
                    </div>
                </div>
                <div className="mt-1 text-sm text-[#98b49f]">{player.team}</div>
                {highlight ? (
                    <div className="mt-3 inline-flex rounded-full bg-[#1f7a36] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                        mvp
                    </div>
                ) : null}
            </div>
        </div>
    </div>
);

const LiveMatch = () => {
    const { fixtureId } = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFallbackData, setIsFallbackData] = useState(false);

    useEffect(() => {
        const fetchLiveMatch = async () => {
            try {
                const liveRes = await api.get('/matches/live').catch(() => ({ data: { matches: [] } }));
                const currentLiveMatch = (liveRes.data?.matches || []).find((item) => String(item.fixtureId) === String(fixtureId));

                if (currentLiveMatch) {
                    setMatch(currentLiveMatch);
                    setIsFallbackData(false);
                    setError('');
                    return;
                }

                const matchesRes = await api.get('/matches').catch(() => ({ data: [] }));
                const fallbackMatch = (matchesRes.data || []).find((item) => String(item.fixtureId) === String(fixtureId));

                if (fallbackMatch) {
                    setMatch(fallbackMatch);
                    setIsFallbackData(true);
                    setError('');
                    return;
                }

                setMatch(null);
                setIsFallbackData(false);
                setError('Ce match n est plus disponible pour le moment.');
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

    const timeline = buildGoalTimeline(match?.goals, match?.teamHome, match?.teamAway);
    const featuredPlayers = match?.topPlayers?.slice(0, 3) || [];
    const isLive = match?.status === 'live' && !isFallbackData;
    const headerStatus = isLive
        ? (match?.currentMinute ? `En direct ${match.currentMinute}'` : 'En direct')
        : 'Dernier etat connu';

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top,rgba(111,219,134,0.12),transparent_24%),linear-gradient(180deg,#0d2516_0%,#07140c_72%)] px-4 py-8 sm:px-5 sm:py-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.34em] text-[#7dc38d]">live center</div>
                        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Suivre maintenant</h1>
                        <div className="mt-3 text-base text-[#9eb8a5]">
                            {headerStatus}
                            {match?.groupName ? ` • ${match.groupName}` : ''}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        {WATCH_NOW_URL ? (
                            <a
                                href={WATCH_NOW_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-[#2d5a38] bg-[rgba(7,20,12,0.48)] px-5 py-3 text-sm font-bold text-white transition hover:border-[#3c7a4b] hover:bg-[rgba(7,20,12,0.68)]"
                            >
                                Regarder sur M6+
                            </a>
                        ) : null}
                        <Link
                            to="/"
                            className="rounded-full border border-[#2d5a38] bg-[rgba(7,20,12,0.48)] px-5 py-3 text-sm font-bold text-white transition hover:border-[#3c7a4b] hover:bg-[rgba(7,20,12,0.68)]"
                        >
                            Retour accueil
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-[30px] border border-[#15331f] bg-[rgba(5,16,10,0.72)] px-6 py-14 text-center text-[#b8cfbf] shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)]">
                        Chargement du direct...
                    </div>
                ) : error ? (
                    <div className="rounded-[30px] border border-[rgba(255,154,154,0.2)] bg-white px-6 py-14 text-center text-[#c86464] shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)]">
                        {error}
                    </div>
                ) : match ? (
                    <div className="space-y-6">
                        {isFallbackData ? (
                            <div className="rounded-[24px] border border-[#325c3d] bg-[rgba(12,35,20,0.68)] px-4 py-4 text-sm text-[#d9eadc] shadow-[0_20px_50px_-35px_rgba(0,0,0,0.45)]">
                                Le flux live temps reel n est pas disponible pour ce match. Cette page affiche le dernier etat connu enregistre sur le site.
                            </div>
                        ) : null}

                        <section className="overflow-hidden rounded-[34px] border border-[#20482c] bg-[linear-gradient(180deg,rgba(5,18,11,0.9),rgba(7,20,12,0.96))] shadow-[0_35px_110px_-60px_rgba(0,0,0,0.55)]">
                            <div className="relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_105%,rgba(111,219,134,0.25),transparent_32%),radial-gradient(circle_at_20%_48%,rgba(111,219,134,0.10),transparent_18%),radial-gradient(circle_at_80%_48%,rgba(111,219,134,0.10),transparent_18%)]" />
                                <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,transparent,rgba(70,128,73,0.18)_40%,rgba(39,87,46,0.32))]" />
                                <div className="absolute inset-x-10 bottom-8 h-28 rounded-[999px] border border-[#264e2f]/60 bg-[radial-gradient(circle,rgba(111,219,134,0.16),transparent_70%)] blur-xl" />

                                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#76b584]">
                                        {match.groupName || match.competition || 'World Cup 2026'}
                                    </div>
                                    <div className={`rounded-full px-5 py-2 text-sm font-black uppercase tracking-[0.24em] text-white ${isLive ? 'bg-[linear-gradient(135deg,#ff513c,#ff1538)] shadow-[0_0_30px_rgba(255,59,59,0.35)]' : 'bg-[linear-gradient(135deg,#52705a,#314637)]'}`}>
                                        {isLive ? 'live' : 'resume'}
                                    </div>
                                </div>

                                <div className="relative z-10 mt-6 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
                                    <div className="text-center md:text-left">
                                        <div className="mx-auto flex w-fit items-center gap-4 md:mx-0">
                                            <TeamBadge src={match.flagHome} alt={match.teamHome} />
                                            <div>
                                                <div className="text-3xl font-black text-white sm:text-4xl">{match.teamHome}</div>
                                                <div className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-[#7dc38d]">equipe 1</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="mx-auto mb-4 inline-flex rounded-[20px] border border-[#295437] bg-[rgba(12,35,20,0.88)] px-5 py-3 text-2xl font-black text-[#a8efb6] shadow-[0_16px_40px_-24px_rgba(111,219,134,0.35)]">
                                            {isLive
                                                ? (match.currentMinute ? `${match.currentMinute}'` : 'live')
                                                : (match.status === 'finished' ? 'FT' : (match.currentMinute ? `${match.currentMinute}'` : 'resume'))}
                                        </div>
                                        <div className="font-display text-[5rem] leading-none text-white sm:text-[6rem]">
                                            {match.scoreHome ?? 0} - {match.scoreAway ?? 0}
                                        </div>
                                        <div className="mt-4 text-lg text-[#93b59b]">
                                            {isLive
                                                ? (match.currentMinute ? `Minute ${match.currentMinute}` : 'Match en direct')
                                                : (match.status === 'finished' ? 'Match termine' : 'Dernier etat connu')}
                                        </div>
                                    </div>

                                    <div className="text-center md:text-right">
                                        <div className="mx-auto flex w-fit items-center gap-4 md:ml-auto md:mr-0">
                                            <div className="md:order-1">
                                                <div className="text-3xl font-black text-white sm:text-4xl">{match.teamAway}</div>
                                                <div className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-[#7dc38d]">equipe 2</div>
                                            </div>
                                            <div className="md:order-2">
                                                <TeamBadge src={match.flagAway} alt={match.teamAway} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                                    <StatChip label="Buteurs" value={match.goals?.length || 0} accent="green" />
                                    <StatChip label="Joueurs notes" value={match.topPlayers?.length || 0} accent="soft" />
                                    <StatChip label="MVP" value={match.manOfTheMatch?.name || 'en attente'} accent="gold" />
                                </div>

                                <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2">
                                    <Link
                                        to={`/live/${match.fixtureId}`}
                                        className="inline-flex items-center justify-center rounded-[24px] border border-[#2f8f46] bg-[linear-gradient(135deg,#1f7a36,#1a5f2b)] px-5 py-4 text-lg font-black text-white shadow-[0_18px_48px_-24px_rgba(47,143,70,0.55)] transition hover:translate-y-[-1px] hover:bg-[linear-gradient(135deg,#24863b,#1f7031)]"
                                    >
                                        Suivre maintenant
                                    </Link>
                                    {WATCH_NOW_URL ? (
                                        <a
                                            href={WATCH_NOW_URL}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center rounded-[24px] border border-[#264b31] bg-[rgba(8,22,13,0.72)] px-5 py-4 text-lg font-black text-white transition hover:border-[#315d3d] hover:bg-[rgba(8,22,13,0.92)]"
                                        >
                                            Regarder sur M6+
                                        </a>
                                    ) : (
                                        <div className="inline-flex items-center justify-center rounded-[24px] border border-[#264b31] bg-[rgba(8,22,13,0.48)] px-5 py-4 text-lg font-black text-[#89a48f]">
                                            Diffuseur a configurer
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                            <section className="rounded-[30px] border border-[#1c4127] bg-[rgba(8,22,13,0.72)] p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)] sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#7dc38d]">Temps forts</div>
                                        <div className="mt-2 text-2xl font-black text-white">Moments du match</div>
                                    </div>
                                    <div className="text-sm text-[#a8bcae]">Voir tout</div>
                                </div>

                                {timeline.length > 0 ? (
                                    <div className="space-y-3">
                                        {timeline.map((goal, index) => (
                                            <div key={goal.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[24px] border border-[#1d4127] bg-[rgba(6,18,11,0.62)] px-4 py-4">
                                                <div className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl font-black ${index === 0 ? 'bg-[#1f7a36] text-white' : 'bg-[rgba(31,122,54,0.18)] text-[#9ce8aa]'}`}>
                                                    {goal.minute}'
                                                </div>
                                                <div>
                                                    <div className="text-xl font-black text-white">
                                                        But {goal.team === match.teamHome ? match.teamHome : match.teamAway} !
                                                    </div>
                                                    <div className="mt-1 text-lg text-[#b3c7b8]">{goal.playerName}</div>
                                                </div>
                                                <div className="rounded-full bg-[#1a5f2b] px-4 py-2 text-xl font-black text-white">
                                                    {goal.scoreline}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-[24px] border border-dashed border-[#295437] bg-[rgba(7,20,12,0.42)] px-4 py-5 text-[#a7bcae]">
                                        Aucun temps fort detaille disponible pour le moment.
                                    </div>
                                )}
                            </section>

                            <section className="space-y-6">
                                <div className="rounded-[30px] border border-[#1c4127] bg-[rgba(8,22,13,0.72)] p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)] sm:p-6">
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#7dc38d]">Meilleurs joueurs</div>
                                            <div className="mt-2 text-2xl font-black text-white">Top players</div>
                                        </div>
                                        <div className="text-sm text-[#a8bcae]">Voir tout</div>
                                    </div>

                                    {featuredPlayers.length > 0 ? (
                                        <div className="space-y-4">
                                            {featuredPlayers.map((player, index) => (
                                                <PlayerCard
                                                    key={`${player.name}-${index}`}
                                                    player={player}
                                                    highlight={index === 0}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-[24px] border border-dashed border-[#295437] bg-[rgba(7,20,12,0.42)] px-4 py-5 text-[#a7bcae]">
                                            Les notes joueurs du direct ne sont pas encore revenues.
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-[30px] border border-[#1c4127] bg-[rgba(8,22,13,0.72)] p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)] sm:p-6">
                                    <div className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#7dc38d]">Infos du match</div>
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        <InfoTile label="Stade" value={match.venue || 'a confirmer'} />
                                        <InfoTile label="Date" value={formatMatchDate(match.matchDate)} />
                                        <InfoTile label="Heure" value={formatMatchTime(match.matchDate)} />
                                        <InfoTile label="Competition" value={match.competition || 'World Cup 2026'} />
                                        <InfoTile label="Statut" value={headerStatus} />
                                        <InfoTile label="Buteurs" value={String(match.goals?.length || 0)} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default LiveMatch;
