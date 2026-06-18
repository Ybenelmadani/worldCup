import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import TodayMatches from '../components/TodayMatches';

const StatCard = ({ label, value, accent, note }) => (
    <div className="rounded-[30px] border border-[#d8ead8] bg-white p-6 shadow-[0_30px_90px_-55px_rgba(16,58,31,0.16)]">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#66806d]">{label}</div>
        <div className={`mt-4 font-display text-5xl uppercase leading-none ${accent}`}>{value}</div>
        <div className="mt-3 text-sm text-[#54705c]">{note}</div>
    </div>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#123b1f] px-4 py-10">
            <div className="mx-auto max-w-7xl">
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="overflow-hidden rounded-[38px] border border-[#d8ead8] bg-[linear-gradient(180deg,#f8fcf7,#eef7ee)] px-6 py-8 text-[#103a1f] shadow-[0_40px_120px_-55px_rgba(16,58,31,0.18)] md:px-8 md:py-10"
                >
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                        <div>
                            <div className="inline-flex rounded-full border border-[#bfe2c4] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.32em] text-[#2f8f46]">
                                espace joueur
                            </div>
                            <h1 className="mt-6 font-display text-5xl uppercase leading-[0.9] text-[#103a1f] md:text-6xl">
                                Dashboard
                                <br />
                                de {user.name}
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#54705c]">
                                Ton centre de controle pour suivre tes points, naviguer rapidement vers les pronostics
                                et garder un oeil sur les matchs du jour.
                            </p>

                            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                <Link to="/predict-24h" className="rounded-full border border-[#2f8f46] bg-[#2f8f46] px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#256f38]">
                                    Predire les 24h
                                </Link>
                                <Link to="/my-predictions" className="rounded-full border border-[#bfe2c4] bg-white px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.22em] text-[#2f8f46] transition hover:bg-[#edf8ec]">
                                    Voir mes pronos
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-[28px] border border-[#d8ead8] bg-white p-5 backdrop-blur">
                                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#66806d]">points totaux</div>
                                <div className="mt-3 font-display text-5xl uppercase leading-none text-[#2f8f46]">{user.totalPoints}</div>
                            </div>
                            <div className="rounded-[28px] border border-[#d8ead8] bg-white p-5 backdrop-blur">
                                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#66806d]">scores exacts</div>
                                <div className="mt-3 font-display text-5xl uppercase leading-none text-[#103a1f]">{user.exactScores}</div>
                            </div>
                            <div className="rounded-[28px] border border-[#d8ead8] bg-white p-5 backdrop-blur">
                                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#66806d]">bons resultats</div>
                                <div className="mt-3 font-display text-5xl uppercase leading-none text-[#2f8f46]">{user.correctResults}</div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.08 }}
                    className="mt-8 grid gap-5 md:grid-cols-3"
                >
                    <StatCard
                        label="niveau actuel"
                        value={user.totalPoints >= 20 ? 'elite' : user.totalPoints >= 10 ? 'solide' : 'starter'}
                        accent="text-[#2f8f46]"
                        note="Ce badge depend de tes points cumules."
                    />
                    <StatCard
                        label="precision"
                        value={`${user.exactScores || 0}`}
                        accent="text-[#2f8f46]"
                        note="Nombre de scores exacts trouves jusqu ici."
                    />
                    <StatCard
                        label="lecture du jeu"
                        value={`${user.correctResults || 0}`}
                        accent="text-[#2f8f46]"
                        note="Matches ou tu as trouve le bon resultat."
                    />
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.12 }}
                    className="mt-10"
                >
                    <div className="mb-6 max-w-3xl">
                        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#86a08d]">live room</div>
                        <h2 className="mt-3 font-display text-4xl uppercase leading-none text-[#f4f8f0]">
                            Matchs du jour
                        </h2>
                        <p className="mt-3 text-base leading-7 text-[#b7c9bb]">
                            Ici tu peux voir les rencontres qui se jouent aujourd hui et ouvrir les pronostics deja
                            envoyes par les autres joueurs.
                        </p>
                    </div>

                    <TodayMatches />
                </motion.section>
            </div>
        </div>
    );
};

export default Dashboard;
