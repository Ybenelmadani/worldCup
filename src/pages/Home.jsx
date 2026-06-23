import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import TeamBadge from '../components/TeamBadge';

const WATCH_NOW_URL = import.meta.env.VITE_WATCH_NOW_URL || '';

const formatMatchTime = (date) => new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
});

const formatMatchDate = (date) => new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
});

const isMatchStarted = (match) => {
    if (!match || !match.matchDate) return false;
    if (match.status === 'live') return true;
    if (match.status === 'finished') return false;

    const matchTime = new Date(match.matchDate).getTime();
    if (isNaN(matchTime)) return false;

    const now = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    return now >= matchTime && now <= matchTime + threeHours;
};

const getMatchStatusLabel = (match) => {
    if (match.status === 'live') {
        return match.currentMinute ? `live ${match.currentMinute}'` : 'live';
    }

    return match.status === 'upcoming'
        ? `${formatMatchDate(match.matchDate)} ${formatMatchTime(match.matchDate)}`
        : match.status;
};

const getMatchCenterLabel = (match) => {
    if (match.status === 'upcoming') {
        return 'coup d envoi';
    }

    if (match.status === 'live') {
        return match.currentMinute ? `${match.currentMinute}'` : 'live';
    }

    return 'resultat';
};

const getStatsSummary = (match) => {
    if (match.status === 'upcoming') {
        return null;
    }

    if ((match.topPlayers?.length || 0) === 0 && (match.goals?.length || 0) === 0) {
        return match.status === 'live'
            ? 'Le match est en direct, les statistiques detaillees arrivent au fil de la rencontre.'
            : 'Les stats joueurs ne sont pas encore revenues pour cette rencontre.';
    }

    return null;
};

const hasStats = (match) => (
    (match.goals?.length > 0) ||
    (match.topPlayers?.length > 0) ||
    !!match.manOfTheMatch?.name
);

const getStandingsMessage = (footballData, apiUnavailable) => {
    if (apiUnavailable) {
        return 'Le front ne parvient pas a joindre le backend. Verifie VITE_API_URL dans le frontend et FRONTEND_URL dans le backend.';
    }

    if (!footballData.competition) {
        return 'Le backend n a pas encore recu les donnees de classement depuis football-data.org.';
    }

    return 'Aucun groupe ou tableau de classement n a ete renvoye pour le moment par la source de donnees.';
};

const formatStandingLabel = (standing, index) => {
    if (standing.group?.startsWith('GROUP_')) {
        return `Group ${standing.group.replace('GROUP_', '')}`;
    }

    return standing.group || standing.stage || standing.type || `tableau ${index + 1}`;
};

const normalizeTeamName = (value) => (
    (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-zA-Z0-9]+/g, '')
        .toLowerCase()
);

const buildMatchLookupKey = (match) => {
    const date = match.matchDate ? new Date(match.matchDate).toISOString() : '';
    return [normalizeTeamName(match.teamHome), normalizeTeamName(match.teamAway), date].join('__');
};

const mergeMatchCollections = (primaryMatches, localMatches) => {
    const localByFixtureId = new Map(
        (localMatches || [])
            .filter((match) => match.fixtureId)
            .map((match) => [String(match.fixtureId), match])
    );

    const localByMatchKey = new Map(
        (localMatches || []).map((match) => [buildMatchLookupKey(match), match])
    );

    return (primaryMatches || []).map((match) => {
        const localMatch = (match.fixtureId && localByFixtureId.get(String(match.fixtureId)))
            || localByMatchKey.get(buildMatchLookupKey(match));

        if (!localMatch) {
            return match;
        }

        return {
            ...match,
            fixtureId: localMatch.fixtureId || match.fixtureId,
            goals: localMatch.goals?.length ? localMatch.goals : match.goals,
            topPlayers: localMatch.topPlayers?.length ? localMatch.topPlayers : match.topPlayers,
            manOfTheMatch: localMatch.manOfTheMatch?.name ? localMatch.manOfTheMatch : match.manOfTheMatch,
            venue: localMatch.venue || match.venue,
            competition: localMatch.competition || match.competition,
            lastSyncedAt: localMatch.lastSyncedAt || match.lastSyncedAt
        };
    });
};

const SectionHeader = ({ eyebrow, title, subtitle }) => (
    <div className="mb-8 max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.32em] text-[#2f8f46]">{eyebrow}</div>
        <h2 className="mt-3 font-display text-4xl uppercase leading-none text-[#103a1f] md:text-5xl">
            {title}
        </h2>
        {subtitle ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#54705c] md:text-lg">
                {subtitle}
            </p>
        ) : null}
    </div>
);

const PlayerAvatar = ({ src, alt }) => (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#d6e9d6] bg-white shadow-sm">
        {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#dff3df,#f7fcf6)]" />
        )}
    </div>
);

const MatchPill = ({ match }) => (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[26px] border border-[#d8ead8] bg-white p-5 shadow-[0_20px_60px_-40px_rgba(16,58,31,0.28)] backdrop-blur">
        <div className="min-w-0">
            <div className="mb-3 flex items-center gap-3">
                <TeamBadge src={match.flagHome} alt={match.teamHome} />
                <div className="min-w-0">
                    <div className="truncate text-lg font-black text-[#103a1f]">{match.teamHome}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#66806d]">
                        domicile
                    </div>
                </div>
            </div>
        </div>

        <div className="rounded-[22px] bg-[#1f7a36] px-4 py-3 text-center text-white shadow-xl shadow-green-900/20">
            <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#d8f5dc]">
                {match.status === 'upcoming' ? formatMatchDate(match.matchDate) : 'score'}
            </div>
            <div className="mt-2 font-display text-3xl uppercase leading-none">
                {match.status === 'upcoming'
                    ? formatMatchTime(match.matchDate)
                    : `${match.scoreHome ?? 0}-${match.scoreAway ?? 0}`}
            </div>
        </div>

        <div className="min-w-0 text-right">
            <div className="mb-3 flex items-center justify-end gap-3">
                <div className="min-w-0">
                    <div className="truncate text-lg font-black text-[#103a1f]">{match.teamAway}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#66806d]">
                        exterieur
                    </div>
                </div>
                <TeamBadge src={match.flagAway} alt={match.teamAway} />
            </div>
        </div>
    </div>
);

const LiveMatchDetailCard = ({ match, index }) => (
    <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, delay: index * 0.06 }}
        className="overflow-hidden rounded-[34px] border border-[#20482c] bg-[linear-gradient(180deg,rgba(5,18,11,0.96),rgba(7,20,12,0.98))] shadow-[0_35px_110px_-60px_rgba(0,0,0,0.55)]"
    >
        <div className="border-b border-[#20482c] bg-[linear-gradient(120deg,rgba(12,35,20,0.96),rgba(18,56,30,0.9))] px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7dc38d] sm:text-xs sm:tracking-[0.28em]">
                    {match.groupName || match.stage || 'World Cup 2026'}
                </div>
                <div className="rounded-full border border-[#1f7a36] bg-[#1f7a36] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:px-3 sm:text-xs sm:tracking-[0.2em]">
                    {getMatchStatusLabel(match)}
                </div>
            </div>
        </div>

        <div className="relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_95%,rgba(111,219,134,0.18),transparent_32%),radial-gradient(circle_at_20%_40%,rgba(111,219,134,0.08),transparent_18%),radial-gradient(circle_at_80%_40%,rgba(111,219,134,0.08),transparent_18%)]" />
            <div className="absolute inset-x-8 bottom-10 h-24 rounded-[999px] border border-[#264e2f]/50 bg-[radial-gradient(circle,rgba(111,219,134,0.16),transparent_72%)] blur-xl" />

            <div className="relative z-10">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 md:gap-5">
                    <div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <TeamBadge src={match.flagHome} alt={match.teamHome} />
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-[0.85rem] font-black text-white sm:text-xl md:text-2xl">{match.teamHome}</div>
                                <div className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-[#7dc38d] sm:text-xs sm:tracking-[0.22em]">
                                    equipe 1
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[20px] border border-[#295437] bg-[linear-gradient(135deg,#1f7a36,#195b29)] px-2 py-2 text-center text-white shadow-[0_18px_48px_-24px_rgba(47,143,70,0.55)] sm:rounded-[30px] sm:px-5 sm:py-4">
                        <div className="truncate text-[8px] font-bold uppercase tracking-[0.1em] text-[#d8f5dc] sm:text-[10px] sm:tracking-[0.28em]">
                            {getMatchCenterLabel(match)}
                        </div>
                        <div className="mt-1 font-display text-xl uppercase leading-none sm:mt-2 sm:text-4xl">
                            {match.status === 'upcoming'
                                ? formatMatchTime(match.matchDate)
                                : `${match.scoreHome ?? 0} - ${match.scoreAway ?? 0}`}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 sm:gap-4">
                            <div className="min-w-0 flex-1 text-right">
                                <div className="truncate text-[0.85rem] font-black text-white sm:text-xl md:text-2xl">{match.teamAway}</div>
                                <div className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-[#7dc38d] sm:text-xs sm:tracking-[0.22em]">
                                    equipe 2
                                </div>
                            </div>
                            <TeamBadge src={match.flagAway} alt={match.teamAway} />
                        </div>
                    </div>
                </div>

                {hasStats(match) && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        <div className="rounded-full bg-[rgba(111,219,134,0.16)] px-3 py-1 text-[11px] font-bold text-[#9ce8aa] sm:text-xs">
                            Buteurs: {match.goals?.length || 0}
                        </div>
                        <div className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-1 text-[11px] font-bold text-[#d8ead8] sm:text-xs">
                            Joueurs notes: {match.topPlayers?.length || 0}
                        </div>
                        <div className="rounded-full bg-[#f1c85d] px-3 py-1 text-[11px] font-bold text-[#182112] sm:text-xs">
                            MVP: {match.manOfTheMatch?.name || 'en attente'}
                        </div>
                    </div>
                )}

                {match.status === 'live' && match.fixtureId ? (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        <Link
                            to={`/live/${match.fixtureId}`}
                            className="inline-flex items-center rounded-full border border-[#2f8f46] bg-[#1f7a36] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_16px_34px_-18px_rgba(47,143,70,0.8)] transition hover:bg-[#256f38] sm:text-xs"
                        >
                            Suivre maintenant
                        </Link>
                        {WATCH_NOW_URL ? (
                            <a
                                href={WATCH_NOW_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-full border border-[#315d3d] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#4a8a59] hover:bg-[rgba(255,255,255,0.1)] sm:text-xs"
                            >
                                Watch now
                            </a>
                        ) : null}
                    </div>
                ) : null}

                {match.goals?.length > 0 && (
                    <div className="mt-5 rounded-[26px] border border-[#1d4127] bg-[rgba(7,20,12,0.46)] p-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#7dc38d]">
                            Buts du match
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                            {match.goals.map((goal, goalIndex) => (
                                <div key={`${goal.playerName}-${goalIndex}`} className="flex items-center justify-between rounded-2xl border border-[#1d4127] bg-[rgba(6,18,11,0.62)] px-4 py-3 text-sm shadow-sm">
                                    <span className="font-bold text-white">{goal.playerName}</span>
                                    <span className="font-black text-[#2f8f46]">{goal.minute}'</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {match.manOfTheMatch?.name && (
                    <div className="mt-5 rounded-[26px] border border-[#1d4127] bg-[linear-gradient(135deg,rgba(15,45,26,0.95),rgba(10,30,18,0.9))] p-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#f1c85d]">
                            Homme du match
                        </div>
                        <div className="rounded-2xl border border-[#1d4127] bg-[rgba(6,18,11,0.62)] px-4 py-4 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <PlayerAvatar src={match.manOfTheMatch.photo} alt={match.manOfTheMatch.name} />
                                    <div>
                                        <div className="font-black text-white">{match.manOfTheMatch.name}</div>
                                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#7dc38d]">
                                            {match.manOfTheMatch.team}
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-[#1f7a36] px-3 py-2 text-center">
                                    <div className="font-display text-2xl leading-none text-white">
                                        {match.manOfTheMatch.rating}
                                    </div>
                                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d8f5dc]">
                                        motm
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </motion.article>
);

const MatchDetailCard = ({ match, index }) => (
    <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, delay: index * 0.06 }}
        className="overflow-hidden rounded-[34px] border border-[#d8ead8] bg-white shadow-[0_35px_110px_-60px_rgba(16,58,31,0.18)]"
    >
        <div className="border-b border-[#d8ead8] bg-[linear-gradient(120deg,#eef8ee,#f8fcf7)] px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#66806d] sm:text-xs sm:tracking-[0.28em]">
                    {match.groupName || match.stage || 'World Cup 2026'}
                </div>
                <div className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] sm:px-3 sm:text-xs sm:tracking-[0.2em] ${
                    (match.status === 'live' || isMatchStarted(match))
                        ? 'border-[#1f7a36] bg-[#1f7a36] text-white'
                        : 'border-[#cfe5cf] bg-white text-[#3f5f49]'
                }`}>
                    {(match.status === 'live' || isMatchStarted(match)) ? 'live' : getMatchStatusLabel(match)}
                </div>
            </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 md:gap-5">
                <div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <TeamBadge src={match.flagHome} alt={match.teamHome} />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-[0.85rem] font-black text-[#103a1f] sm:text-xl md:text-2xl">{match.teamHome}</div>
                            <div className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-[#66806d] sm:text-xs sm:tracking-[0.22em]">
                                equipe 1
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[20px] bg-[#1f7a36] px-2 py-2 text-center text-white shadow-xl shadow-green-900/20 sm:rounded-[26px] sm:px-5 sm:py-4">
                    <div className="truncate text-[8px] font-bold uppercase tracking-[0.1em] text-[#d8f5dc] sm:text-[10px] sm:tracking-[0.28em]">
                        {getMatchCenterLabel(match)}
                    </div>
                    <div className="mt-1 font-display text-xl uppercase leading-none sm:mt-2 sm:text-4xl">
                        {match.status === 'upcoming'
                            ? formatMatchTime(match.matchDate)
                            : `${match.scoreHome ?? 0} - ${match.scoreAway ?? 0}`}
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1 text-right">
                            <div className="truncate text-[0.85rem] font-black text-[#103a1f] sm:text-xl md:text-2xl">{match.teamAway}</div>
                            <div className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-[#66806d] sm:text-xs sm:tracking-[0.22em]">
                                equipe 2
                            </div>
                        </div>
                        <TeamBadge src={match.flagAway} alt={match.teamAway} />
                    </div>
                </div>
            </div>

            {hasStats(match) && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <div className="rounded-full bg-[#e7f7ea] px-3 py-1 text-[11px] font-bold text-[#1f7a36] sm:text-xs">
                        Buteurs: {match.goals?.length || 0}
                    </div>
                    <div className="rounded-full bg-[#f0f7f0] px-3 py-1 text-[11px] font-bold text-[#3f5f49] sm:text-xs">
                        Joueurs notes: {match.topPlayers?.length || 0}
                    </div>
                    <div className="rounded-full bg-[#103a1f] px-3 py-1 text-[11px] font-bold text-white sm:text-xs">
                        MVP: {match.manOfTheMatch?.name || 'en attente'}
                    </div>
                </div>
            )}

            {(match.status === 'live' || isMatchStarted(match)) && match.fixtureId ? (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Link
                        to={`/live/${match.fixtureId}`}
                        className="inline-flex items-center rounded-full border border-[#1f7a36] bg-[#1f7a36] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#256f38] sm:text-xs"
                    >
                        Suivre maintenant
                    </Link>
                    {WATCH_NOW_URL ? (
                        <a
                            href={WATCH_NOW_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-full border border-[#d8ead8] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#103a1f] transition hover:border-[#1f7a36] hover:text-[#1f7a36] sm:text-xs"
                        >
                            Watch now
                        </a>
                    ) : null}
                </div>
            ) : null}

            {match.goals?.length > 0 && (
                <div className="mt-5 rounded-[26px] bg-[#f4faf4] p-4">
                    <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#66806d]">
                        Buts du match
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                        {match.goals.map((goal, goalIndex) => (
                            <div key={`${goal.playerName}-${goalIndex}`} className="flex items-center justify-between rounded-2xl border border-[#dcecdc] bg-white px-4 py-3 text-sm shadow-sm">
                                <span className="font-bold text-[#103a1f]">{goal.playerName}</span>
                                <span className="font-black text-[#2f8f46]">{goal.minute}'</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {match.manOfTheMatch?.name && (
                <div className="mt-5 rounded-[26px] bg-[linear-gradient(135deg,#f2fbf2,#e4f5e6)] p-4">
                    <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#2f8f46]">
                        Homme du match
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <PlayerAvatar src={match.manOfTheMatch.photo} alt={match.manOfTheMatch.name} />
                                <div>
                                    <div className="font-black text-[#103a1f]">{match.manOfTheMatch.name}</div>
                                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#66806d]">
                                        {match.manOfTheMatch.team}
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl bg-[#1f7a36] px-3 py-2 text-center">
                                <div className="font-display text-2xl leading-none text-white">
                                    {match.manOfTheMatch.rating}
                                </div>
                                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d8f5dc]">
                                    motm
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </motion.article>
);

const StandingsBlock = ({ standing, index }) => (
    <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.01 }}
        transition={{ duration: 0.45, delay: index * 0.06 }}
        className="rounded-[30px] border border-[#d8ead8] bg-white p-6 shadow-[0_30px_80px_-50px_rgba(16,58,31,0.15)] backdrop-blur"
    >
        <div className="mb-5 text-sm font-bold uppercase tracking-[0.24em] text-[#2f8f46]">
            {formatStandingLabel(standing, index)}
        </div>

        <div className="space-y-3">
            {(standing.table || []).map((team) => (
                <div key={team.team.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[22px] border border-[#e0eee0] bg-[#f7fbf6] px-4 py-3 text-[#103a1f]">
                    <div className="font-display text-2xl leading-none text-[#2f8f46]">{team.position}</div>
                    <div className="flex items-center gap-3">
                        <TeamBadge src={team.team.crest} alt={team.team.name} size="sm" />
                        <div>
                            <div className="font-bold">{team.team.name}</div>
                            <div className="text-xs uppercase tracking-[0.16em] text-[#66806d]">
                                {team.playedGames} j | {team.goalDifference >= 0 ? '+' : ''}{team.goalDifference} diff
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl bg-[#1f7a36] px-3 py-2 text-right">
                        <div className="font-display text-2xl leading-none text-white">{team.points}</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d8f5dc]">pts</div>
                    </div>
                </div>
            ))}
        </div>
    </motion.article>
);

const ScorerCard = ({ player, index }) => (
    <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="rounded-[28px] border border-[#d8ead8] bg-white p-5 shadow-[0_30px_80px_-50px_rgba(16,58,31,0.15)]"
    >
        <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f7a36] font-display text-2xl leading-none text-white">
                {index + 1}
            </div>
            <TeamBadge src={player.team?.crest} alt={player.team?.name || player.player?.name} size="sm" />
            <div className="min-w-0 flex-1">
                <div className="truncate font-black text-[#103a1f]">{player.player?.name}</div>
                <div className="truncate text-xs font-bold uppercase tracking-[0.2em] text-[#66806d]">
                    {player.team?.name}
                </div>
            </div>
            <div className="text-right">
                <div className="font-display text-4xl leading-none text-[#2f8f46]">{player.goals}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66806d]">buts</div>
            </div>
        </div>
    </motion.article>
);

const RatingCard = ({ player, index }) => (
    <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="rounded-[28px] border border-[#d8ead8] bg-[linear-gradient(135deg,#ffffff,#f1f8f1)] p-5 shadow-[0_30px_80px_-50px_rgba(16,58,31,0.15)]"
    >
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f7a36] font-display text-2xl leading-none text-white">
                    {index + 1}
                </div>
                <PlayerAvatar src={player.photo} alt={player.name} />
                <div>
                    <div className="font-black text-[#103a1f]">{player.name}</div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#66806d]">
                        {player.team}
                    </div>
                </div>
            </div>
            <div className="rounded-2xl bg-[#1f7a36] px-4 py-3 text-center">
                <div className="font-display text-4xl leading-none text-white">{player.rating}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d8f5dc]">note</div>
            </div>
        </div>
    </motion.article>
);

const Home = () => {
    const [overview, setOverview] = useState({
        rangeDays: 3,
        matches: [],
        manOfTheMatches: [],
        topPlayers: [],
        teamRatings: [],
        generatedAt: null
    });
    const [footballData, setFootballData] = useState({
        competition: null,
        matches: [],
        standings: [],
        scorers: [],
        requestInfo: null
    });
    const [liveCenter, setLiveCenter] = useState({
        generatedAt: null,
        matches: []
    });
    const [apiStatus, setApiStatus] = useState({
        overviewUnavailable: false,
        footballDataUnavailable: false,
        liveUnavailable: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [overviewRes, footballDataRes] = await Promise.all([
                    api.get('/matches/overview').catch((error) => ({ data: null, error })),
                    api.get('/matches/football-data/worldcup').catch((error) => ({ data: null, error }))
                ]);

                setApiStatus((current) => ({
                    ...current,
                    overviewUnavailable: Boolean(overviewRes.error),
                    footballDataUnavailable: Boolean(footballDataRes.error)
                }));

                if (overviewRes.data) {
                    setOverview(overviewRes.data);
                }

                if (footballDataRes.data) {
                    setFootballData(footballDataRes.data);
                }
            } catch (error) {
                console.error('Error fetching home data', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchLiveData = async () => {
            try {
                const liveRes = await api.get('/matches/live').catch((error) => ({ data: null, error }));

                setApiStatus((current) => ({
                    ...current,
                    liveUnavailable: Boolean(liveRes.error)
                }));

                if (liveRes.data) {
                    setLiveCenter(liveRes.data);
                }
            } catch (error) {
                console.error('Error fetching live data', error);
            }
        };

        fetchHomeData();
        fetchLiveData();

        const liveInterval = window.setInterval(fetchLiveData, 30000);

        return () => {
            window.clearInterval(liveInterval);
        };
    }, []);

        const liveMatches = liveCenter.matches || [];
    const matchesToDisplay = (footballData.matches.length > 0
        ? mergeMatchCollections(footballData.matches, overview.matches)
        : overview.matches
    ).filter(match => match.status !== 'live');
    const standingsToDisplay = footballData.standings;
    const topScorers = footballData.scorers.slice(0, 6);
    const rankedPlayers = overview.topPlayers.slice(0, 6);
    const homeApiUnavailable = apiStatus.overviewUnavailable && apiStatus.footballDataUnavailable;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#123b1f]">
            <section className="relative overflow-hidden bg-[linear-gradient(180deg,#123b1f_0%,#10351c_58%,#0d2d17_100%)] pb-6 pt-10 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(111,219,134,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(167,243,173,0.08),transparent_32%),linear-gradient(180deg,rgba(7,20,12,0.12)_0%,rgba(7,20,12,0.28)_100%)]" />
                <div className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-[#6fdb86]/12 blur-3xl" />
                <div className="absolute right-0 top-0 h-[30rem] w-[30rem] rounded-full bg-[#9ce2ac]/8 blur-3xl" />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#3c6f49] to-transparent" />

                <div className="relative w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                        className="w-full"
                    >
                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                className="relative overflow-hidden rounded-[18px] border border-[#3c6f49] shadow-[0_40px_120px_-45px_rgba(0,0,0,0.35)]"
                            >
                                <video
                                    className="h-[28rem] w-full object-cover sm:h-[34rem]"
                                    src="/001 - World_Cup_2026_-_Official_Intro.f398.mp4"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,12,0.22),rgba(7,20,12,0.58))]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(111,219,134,0.16),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.10),transparent_18%)]" />
                                <motion.a
                                    href="#matches-section"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: [0, 8, 0] }}
                                    transition={{ opacity: { duration: 0.5, delay: 0.35 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
                                    className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-[rgba(7,20,12,0.48)] px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white backdrop-blur-md transition hover:bg-[rgba(7,20,12,0.68)]"
                                >
                                    <span>Voir plus</span>
                                    <span className="text-lg leading-none">v</span>
                                </motion.a>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section id="matches-section" className="mx-auto max-w-7xl py-8">
                {loading ? (
                    <div className="rounded-[32px] border border-[#d8ead8] bg-white px-8 py-16 text-center text-[#54705c] shadow-[0_30px_90px_-60px_rgba(16,58,31,0.16)]">
                        Chargement du resume Coupe du Monde...
                    </div>
                ) : (
                    <div className="space-y-20">
                        {liveMatches.length > 0 && (
                            <section>
                                <h1 className="mb-8 font-display text-4xl uppercase leading-none text-white md:text-5xl">Matchs en direct</h1>

                                <div className="grid gap-6">
                                    {liveMatches.map((match, index) => (
                                        <LiveMatchDetailCard key={`live-${match.fixtureId || `${match.teamHome}-${match.teamAway}-${index}`}`} match={match} index={index} />
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <SectionHeader
                                eyebrow="01"
                                title="Matches et scores"
                            />

                            {matchesToDisplay.length === 0 ? (
                                <div className="rounded-[32px] border border-[#d8ead8] bg-white px-8 py-16 text-[#54705c] shadow-[0_30px_90px_-60px_rgba(16,58,31,0.16)]">
                                    {homeApiUnavailable
                                        ? 'Connexion au backend impossible pour charger les matchs.'
                                        : `Aucun match programme sur les ${overview.rangeDays || 3} prochains jours.`}
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {matchesToDisplay.map((match, index) => (
                                        match.status === 'finished' ? (
                                            <LiveMatchDetailCard
                                                key={match.fixtureId || match._id || `${match.teamHome}-${match.teamAway}-${index}`}
                                                match={match}
                                                index={index}
                                            />
                                        ) : (
                                            <MatchDetailCard
                                                key={match.fixtureId || match._id || `${match.teamHome}-${match.teamAway}-${index}`}
                                                match={match}
                                                index={index}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </section>

        <section className="overflow-hidden rounded-[38px] border border-[#d8ead8] bg-[linear-gradient(180deg,#f8fcf7,#eef7ee)] px-6 py-10 text-[#103a1f] shadow-[0_40px_120px_-60px_rgba(16,58,31,0.18)] md:px-8">
                            <SectionHeader
                                eyebrow="02"
                                title="Classement du tournoi"
                                subtitle="Le scroll descend maintenant vers les groupes pour garder une lecture naturelle: d abord le terrain, ensuite la hierarchie."
                            />
                            <div className="grid gap-5">
                                {standingsToDisplay.length === 0 ? (
                                    <div className="rounded-[28px] border border-[#d8ead8] bg-white p-8 text-[#3f5f49] lg:col-span-3">
                                        <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#2f8f46]">
                                            aucun classement charge
                                        </div>
                                        <div className="mt-3 text-base leading-7 text-[#54705c]">
                                            {getStandingsMessage(footballData, apiStatus.footballDataUnavailable)}
                                        </div>
                                    </div>
                                ) : (
                                    standingsToDisplay.map((standing, index) => (
                                        <StandingsBlock
                                            key={`${standing.group || standing.stage}-${index}`}
                                            standing={standing}
                                            index={index}
                                        />
                                    ))
                                )}
                            </div>
                        </section>

                        <section>
                            <SectionHeader
                                eyebrow="03"
                                title="Meilleurs buteurs"
                                subtitle="Les buteurs arrivent apres le classement pour raconter la competition du collectif vers l individuel."
                            />

                            {topScorers.length === 0 ? (
                                <div className="rounded-[32px] border border-[#d8ead8] bg-white px-8 py-16 text-[#54705c] shadow-[0_30px_90px_-60px_rgba(16,58,31,0.16)]">
                                    {apiStatus.footballDataUnavailable
                                        ? 'Les meilleurs buteurs sont indisponibles car le backend ne repond pas.'
                                        : 'Meilleurs buteurs indisponibles pour le moment.'}
                                </div>
                            ) : (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {topScorers.map((player, index) => (
                                        <ScorerCard
                                            key={`${player.player?.id || player.player?.name}-${index}`}
                                            player={player}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <SectionHeader
                                eyebrow="04"
                                title="Top players"
                                subtitle="Cette derniere partie garde tes notes locales et les met dans une presentation plus nette pour finir la landing en douceur."
                            />

                            {rankedPlayers.length === 0 ? (
                                <div className="rounded-[32px] border border-[#d8ead8] bg-white px-8 py-16 text-[#54705c] shadow-[0_30px_90px_-60px_rgba(16,58,31,0.16)]">
                                    {apiStatus.overviewUnavailable
                                        ? 'Les notes joueurs sont indisponibles car le backend ne repond pas.'
                                        : 'Les notes joueurs apparaitront des que le backend recoit plus de statistiques.'}
                                </div>
                            ) : (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {rankedPlayers.map((player, index) => (
                                        <RatingCard key={`${player.name}-${index}`} player={player} index={index} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;

















