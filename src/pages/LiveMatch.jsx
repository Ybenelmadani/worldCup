import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

const WATCH_NOW_URL = import.meta.env.VITE_WATCH_NOW_URL || '';

const formatMatchTime = (date) => new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
});

const formatMatchDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
});

const TeamCrest = ({ src, alt, size = 'lg' }) => {
    const sizeClass = size === 'xl'
        ? 'h-28 w-28 sm:h-32 sm:w-32'
        : size === 'lg'
            ? 'h-20 w-20 sm:h-24 sm:w-24'
            : 'h-14 w-14';

    return (
        <div className={`flex ${sizeClass} items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/95 shadow-[0_18px_40px_-24px_rgba(255,255,255,0.6)]`}>
            {src ? (
                <img src={src} alt={alt} className="h-full w-full object-cover" />
            ) : (
                <div className="h-full w-full bg-slate-200" />
            )}
        </div>
    );
};

const iconClassName = 'h-5 w-5';

const IconBall = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3l3.5 2.5-1.2 4h-4.6l-1.2-4L12 3Zm-5 9 3-2.5 4 3 1.5 4.5-3.5 2.5-4-1.5L7 12Zm10 0 1 5-4 2.5" />
    </svg>
);
const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <circle cx="9" cy="8" r="3" />
        <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" />
        <circle cx="17" cy="10" r="2" />
        <path d="M14.5 19c.4-2 1.9-3.5 4.5-3.5 1 0 1.9.2 2.5.6" />
    </svg>
);
const IconTrophy = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
        <path d="M6 5H4a3 3 0 0 0 3 3" />
        <path d="M18 5h2a3 3 0 0 1-3 3" />
        <path d="M12 11v4" />
        <path d="M9 21h6" />
        <path d="M10 15h4l1 3H9l1-3Z" />
    </svg>
);
const IconLive = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <circle cx="12" cy="12" r="2.5" />
        <path d="M5.5 8.5a8 8 0 0 0 0 7" />
        <path d="M18.5 8.5a8 8 0 0 1 0 7" />
        <path d="M2.5 5.5a12 12 0 0 0 0 13" />
        <path d="M21.5 5.5a12 12 0 0 1 0 13" />
    </svg>
);
const IconCalendar = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
);
const IconStadium = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <path d="M4 10h16" />
        <path d="M5 18V8l7-4 7 4v10" />
        <path d="M3 20h18" />
        <path d="M9 14h6" />
    </svg>
);
const IconWhistle = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
        <circle cx="8" cy="15" r="4" />
        <path d="M12 15h3a3 3 0 0 0 0-6h-1l-2 3" />
        <circle cx="18" cy="7" r="1.5" />
    </svg>
);

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
                scoreline: `${homeScore}-${awayScore}`
            };
        })
        .reverse();
};

const buildHalftimeScore = (goals = [], homeTeam) => {
    let home = 0;
    let away = 0;

    goals
        .filter((goal) => (goal.minute || 0) <= 45)
        .forEach((goal) => {
            const isHomeGoal = (goal.team || '').trim().toLowerCase() === (homeTeam || '').trim().toLowerCase();
            if (isHomeGoal) {
                home += 1;
            } else {
                away += 1;
            }
        });

    return `${home}-${away}`;
};

const StatChip = ({ icon, label, value, highlight = false }) => (
    <div className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 ${highlight ? 'border-[#6e5a1d] bg-[rgba(77,60,12,0.36)] text-[#f2d277]' : 'border-[#1d4127] bg-[rgba(8,22,13,0.72)] text-[#dcecdf]'}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#8ae79c]">{icon}</div>
        <div>
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-sm text-white">{value}</div>
        </div>
    </div>
);

const PlayerCard = ({ player, highlight = false }) => (
    <div className={`rounded-[26px] border p-4 ${highlight ? 'border-[#2f8f46] bg-[linear-gradient(180deg,rgba(16,49,27,0.92),rgba(9,27,16,0.96))]' : 'border-[#1d4127] bg-[rgba(8,22,13,0.82)]'}`}>
        <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/5">
                {player.photo ? <img src={player.photo} alt={player.name} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-2xl font-black text-white">{player.name}</div>
                    <div className={`rounded-full px-3 py-1 text-sm font-black ${highlight ? 'bg-[#f2c54d] text-[#182112]' : 'bg-white/10 text-white'}`}>
                        {player.rating || '--'}
                    </div>
                </div>
                <div className="mt-1 text-lg text-[#9fb6a5]">{player.team}</div>
                {highlight ? <div className="mt-3 inline-flex rounded-full bg-[#1f7a36] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">mvp</div> : null}
            </div>
        </div>
    </div>
);

const MetricTile = ({ label, value, team }) => (
    <div className="rounded-[24px] border border-[#1d4127] bg-[rgba(8,22,13,0.78)] px-5 py-5 text-center">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#6ea97a]">{label}</div>
        <div className="mt-3 text-5xl font-black leading-none text-white">{value}</div>
        <div className="mt-2 text-lg text-[#8faca0]">{team}</div>
    </div>
);

const InfoTile = ({ icon, label, value }) => (
    <div className="rounded-[24px] border border-[#1d4127] bg-[rgba(8,22,13,0.78)] px-5 py-5">
        <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#8ae79c]">{icon}</div>
            <div>
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#6ea97a]">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
            </div>
        </div>
    </div>
);

const VideoPlayer = ({ url }) => {
    const videoRef = useRef(null);
    const [hlsError, setHlsError] = useState('');

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls = null;
        let isDestroyed = false;

        const initPlayer = (HlsClass) => {
            if (isDestroyed) return;

            if (HlsClass.isSupported()) {
                hls = new HlsClass({
                    maxMaxBufferLength: 10,
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                
                hls.on(HlsClass.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            case HlsClass.ErrorTypes.NETWORK_ERROR:
                                console.warn("Fatal network error encountered, trying to recover...");
                                hls.startLoad();
                                break;
                            case HlsClass.ErrorTypes.MEDIA_ERROR:
                                console.warn("Fatal media error encountered, trying to recover...");
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error("Unrecoverable error:", data);
                                setHlsError("Impossible de charger ce flux. Essaie un autre serveur.");
                                break;
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                setHlsError("Ton navigateur ne supporte pas la lecture de flux HLS.");
            }
        };

        const loadScript = () => {
            if (window.Hls) {
                initPlayer(window.Hls);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.8/dist/hls.min.js';
            script.onload = () => {
                if (window.Hls) {
                    initPlayer(window.Hls);
                }
            };
            script.onerror = () => {
                setHlsError("Erreur de chargement du lecteur HLS.");
            };
            document.head.appendChild(script);
        };

        setHlsError('');
        loadScript();

        return () => {
            isDestroyed = true;
            if (hls) {
                hls.destroy();
            }
        };
    }, [url]);

    if (hlsError) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 p-6 text-center text-[#c86464]">
                <p className="text-lg font-bold">{hlsError}</p>
            </div>
        );
    }

    return (
        <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-contain"
        />
    );
};

const LiveMatch = () => {
    const { fixtureId } = useParams();
    const [match, setMatch] = useState(null);
    const [streams, setStreams] = useState([]);
    const [activeStream, setActiveStream] = useState(null);
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
                    
                    if (currentLiveMatch._id) {
                        api.get(`/matches/${currentLiveMatch._id}/streams`)
                            .then(res => {
                                const retrieved = res.data.streams || [];
                                setStreams(retrieved);
                                if (retrieved.length > 0) {
                                    setActiveStream(retrieved[0]);
                                }
                            })
                            .catch(err => console.log('Streams IPTV non disponibles', err));
                    }
                    return;
                }

                const matchesRes = await api.get('/matches').catch(() => ({ data: [] }));
                const fallbackMatch = (matchesRes.data || []).find((item) => String(item.fixtureId) === String(fixtureId));

                if (fallbackMatch) {
                    setMatch(fallbackMatch);
                    setIsFallbackData(true);
                    setError('');
                    
                    if (fallbackMatch._id) {
                        api.get(`/matches/${fallbackMatch._id}/streams`)
                            .then(res => {
                                const retrieved = res.data.streams || [];
                                setStreams(retrieved);
                                if (retrieved.length > 0) {
                                    setActiveStream(retrieved[0]);
                                }
                            })
                            .catch(err => console.log('Streams IPTV non disponibles', err));
                    }
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
    const heroBadge = isLive ? 'LIVE' : (match?.status === 'finished' ? 'TERMINE' : 'RESUME');
    const minuteLabel = isLive
        ? (match?.currentMinute ? `${match.currentMinute}'` : 'LIVE')
        : (match?.status === 'finished' ? 'FT' : 'RESUME');
    const subtitle = isLive
        ? `Match en direct${match?.groupName ? ` � ${match.groupName}` : ''}`
        : `Dernier etat connu${match?.groupName ? ` � ${match.groupName}` : ''}`;
    const halftimeScore = buildHalftimeScore(match?.goals || [], match?.teamHome);
    const matchStats = [
        { label: 'Possession', value: '--', team: 'n/d' },
        { label: 'Tirs', value: String(match?.goals?.length || 0), team: 'Buts' },
        { label: 'Joueurs notes', value: String(match?.topPlayers?.length || 0), team: 'Notes' },
        { label: 'Corners', value: '--', team: 'n/d' }
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_top,rgba(111,219,134,0.12),transparent_24%),linear-gradient(180deg,#092013_0%,#07140c_72%)] px-4 py-6 sm:px-5 sm:py-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {loading ? (
                    <div className="rounded-[32px] border border-[#15331f] bg-[rgba(5,16,10,0.72)] px-6 py-14 text-center text-[#b8cfbf] shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)]">
                        Chargement du direct...
                    </div>
                ) : error ? (
                    <div className="rounded-[32px] border border-[rgba(255,154,154,0.2)] bg-white px-6 py-14 text-center text-[#c86464] shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)]">
                        {error}
                    </div>
                ) : match ? (
                    <>
                        {isFallbackData ? (
                            <div className="rounded-[24px] border border-[#325c3d] bg-[rgba(12,35,20,0.68)] px-4 py-4 text-sm text-[#d9eadc] shadow-[0_20px_50px_-35px_rgba(0,0,0,0.45)]">
                                Le flux live temps reel n est pas disponible pour ce match. Cette page affiche le dernier etat connu enregistre sur le site.
                            </div>
                        ) : null}

                        <section className="overflow-hidden rounded-[34px] border border-[#1a4727] bg-[linear-gradient(180deg,rgba(5,20,11,0.96),rgba(7,20,12,0.98))] shadow-[0_40px_120px_-70px_rgba(0,0,0,0.7)]">
                            <div className="relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_88%,rgba(90,170,85,0.22),transparent_28%),radial-gradient(circle_at_18%_36%,rgba(111,219,134,0.10),transparent_18%),radial-gradient(circle_at_82%_36%,rgba(111,219,134,0.10),transparent_18%)]" />
                                <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent,rgba(32,90,39,0.22)_40%,rgba(25,72,31,0.52))]" />
                                <div className="absolute inset-x-6 bottom-7 h-24 rounded-[999px] border border-[#264e2f]/50 bg-[radial-gradient(circle,rgba(111,219,134,0.18),transparent_72%)] blur-xl" />

                                <div className="relative z-10 flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-[0.34em] text-[#7dc38d]">live center</div>
                                        <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">Suivre maintenant</h1>
                                        <div className="mt-4 text-xl text-[#b4cab8]">{subtitle}</div>
                                    </div>

                                    <div className={`inline-flex items-center gap-3 rounded-full px-5 py-3 text-base font-black uppercase tracking-[0.24em] text-white ${isLive ? 'bg-[linear-gradient(135deg,#ff553f,#ff1435)] shadow-[0_0_34px_rgba(255,59,59,0.38)]' : 'bg-[linear-gradient(135deg,#4f6c58,#304338)]'}`}>
                                        <span className="h-3 w-3 rounded-full bg-white" />
                                        {heroBadge}
                                    </div>
                                </div>

                                <div className="relative z-10 mt-8 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
                                    <div className="text-center lg:text-left">
                                        <div className="mx-auto flex w-fit flex-col items-center gap-5 lg:mx-0 lg:items-start">
                                            <TeamCrest src={match.flagHome} alt={match.teamHome} size="xl" />
                                            <div>
                                                <div className="text-4xl font-black text-white sm:text-5xl">{match.teamHome}</div>
                                                <div className="mt-3 text-sm font-bold uppercase tracking-[0.32em] text-[#7dc38d]">equipe 1</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="mx-auto inline-flex rounded-[20px] border border-[#295437] bg-[rgba(12,35,20,0.88)] px-5 py-3 text-2xl font-black text-[#a8efb6] shadow-[0_16px_40px_-24px_rgba(111,219,134,0.35)]">
                                            {minuteLabel}
                                        </div>
                                        <div className="mt-5 font-display text-[5.5rem] leading-none text-white sm:text-[7.5rem]">
                                            {match.scoreHome ?? 0} - {match.scoreAway ?? 0}
                                        </div>
                                        <div className="mt-4 text-2xl text-[#93b59b]">1MT {halftimeScore}</div>
                                    </div>

                                    <div className="text-center lg:text-right">
                                        <div className="mx-auto flex w-fit flex-col items-center gap-5 lg:ml-auto lg:mr-0 lg:items-end">
                                            <TeamCrest src={match.flagAway} alt={match.teamAway} size="xl" />
                                            <div>
                                                <div className="text-4xl font-black text-white sm:text-5xl">{match.teamAway}</div>
                                                <div className="mt-3 text-sm font-bold uppercase tracking-[0.32em] text-[#7dc38d]">equipe 2</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="grid gap-4 md:grid-cols-3">
                            <StatChip icon={<IconBall />} label="Buteurs" value={match.goals?.length || 0} />
                            <StatChip icon={<IconUser />} label="Joueurs notes" value={match.topPlayers?.length || 0} />
                            <StatChip icon={<IconTrophy />} label="MVP" value={match.manOfTheMatch?.name || 'en attente'} highlight />
                        </div>

                        {/* Embedded HLS Live Stream Player */}
                        {activeStream ? (
                            <section className="overflow-hidden rounded-[34px] border border-[#1a4727] bg-[#05100a] p-5 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.85)]">
                                <div className="mb-4">
                                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#7dc38d]">Lecteur Direct</div>
                                    <h3 className="mt-1 text-2xl font-black text-white">Regarder en direct : {activeStream.name}</h3>
                                </div>
                                <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-black border border-white/5">
                                    <VideoPlayer url={activeStream.url} />
                                </div>
                                <div className="mt-5">
                                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#7dc38d] mb-3">Changer de serveur</div>
                                    <div className="flex flex-wrap gap-2">
                                        {streams.map((stream, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveStream(stream)}
                                                className={`rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                                                    activeStream.url === stream.url
                                                        ? 'bg-[#1f7a36] text-white shadow-lg border border-[#2f8f46]'
                                                        : 'bg-white/5 text-[#a8efb6] border border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                📺 {stream.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        ) : null}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Link
                                to={`/live/${match.fixtureId}`}
                                className="inline-flex items-center justify-center gap-3 rounded-[24px] border border-[#2f8f46] bg-[linear-gradient(135deg,#1f7a36,#1a5f2b)] px-6 py-5 text-2xl font-black text-white shadow-[0_18px_48px_-24px_rgba(47,143,70,0.55)] transition hover:translate-y-[-1px] hover:bg-[linear-gradient(135deg,#24863b,#1f7031)]"
                            >
                                <IconLive />
                                Suivre maintenant
                            </Link>
                            {streams.length > 0 ? (
                                <div className="col-span-1 md:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full">
                                    {streams.map((stream, idx) => (
                                        <a
                                            key={idx}
                                            href={stream.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-[#166099] bg-[rgba(8,22,35,0.72)] px-4 py-4 text-lg font-black text-[#8bbbf2] transition hover:border-[#1a73b8] hover:bg-[rgba(8,22,35,0.92)] shadow-[0_10px_30px_-15px_rgba(22,96,153,0.4)]"
                                        >
                                            Regarder sur {stream.name}
                                        </a>
                                    ))}
                                </div>
                            ) : WATCH_NOW_URL ? (
                                <a
                                    href={WATCH_NOW_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-3 rounded-[24px] border border-[#264b31] bg-[rgba(8,22,13,0.72)] px-6 py-5 text-2xl font-black text-white transition hover:border-[#315d3d] hover:bg-[rgba(8,22,13,0.92)]"
                                >
                                    Regarder sur M6+
                                </a>
                            ) : (
                                <div className="inline-flex items-center justify-center rounded-[24px] border border-[#264b31] bg-[rgba(8,22,13,0.48)] px-6 py-5 text-2xl font-black text-[#89a48f]">
                                    Recherche de flux IPTV...
                                </div>
                            )}
                        </div>

                        <section className="rounded-[32px] border border-[#1c4127] bg-[rgba(8,22,13,0.82)] p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)] sm:p-6">
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

                        <section className="rounded-[32px] border border-[#1c4127] bg-[rgba(8,22,13,0.82)] p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)] sm:p-6">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#7dc38d]">Meilleurs joueurs</div>
                                    <div className="mt-2 text-2xl font-black text-white">Top players</div>
                                </div>
                                <div className="text-sm text-[#a8bcae]">Voir tout</div>
                            </div>

                            {featuredPlayers.length > 0 ? (
                                <div className="grid gap-4 lg:grid-cols-3">
                                    {featuredPlayers.map((player, index) => (
                                        <PlayerCard key={`${player.name}-${index}`} player={player} highlight={index === 0} />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-[24px] border border-dashed border-[#295437] bg-[rgba(7,20,12,0.42)] px-4 py-5 text-[#a7bcae]">
                                    Les notes joueurs du direct ne sont pas encore revenues.
                                </div>
                            )}
                        </section>

                        <section className="rounded-[32px] border border-[#1c4127] bg-[rgba(8,22,13,0.82)] p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)] sm:p-6">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {matchStats.map((item) => (
                                    <MetricTile key={item.label} label={item.label} value={item.value} team={item.team} />
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[32px] border border-[#1c4127] bg-[rgba(8,22,13,0.82)] p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.4)] sm:p-6">
                            <div className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#7dc38d]">Infos du match</div>
                            <div className="grid gap-4 lg:grid-cols-3">
                                <InfoTile icon={<IconStadium />} label="Stade" value={match.venue || 'a confirmer'} />
                                <InfoTile icon={<IconCalendar />} label="Date" value={formatMatchDate(match.matchDate)} />
                                <InfoTile icon={<IconWhistle />} label="Arbitre" value={isLive ? 'En direct' : 'Dernier etat'} />
                            </div>
                        </section>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default LiveMatch;
