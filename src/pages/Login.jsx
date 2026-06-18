import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [lampOn, setLampOn] = useState(true);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        }
    };

    return (
        <div
            className={`min-h-[calc(100vh-80px)] px-4 py-10 transition-all duration-500 ${
                lampOn
                    ? 'bg-[radial-gradient(circle_at_50%_24%,rgba(111,219,134,0.16),transparent_24%),linear-gradient(180deg,#0d1f13_0%,#07140c_72%)]'
                    : 'bg-[radial-gradient(circle_at_50%_24%,rgba(111,219,134,0.05),transparent_20%),linear-gradient(180deg,#0a1710_0%,#061109_72%)]'
            }`}
        >
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-7 text-center font-['Georgia'] text-4xl italic font-light tracking-[0.04em] text-[#f2fff0] drop-shadow-[0_0_16px_rgba(111,219,134,0.18)] md:text-5xl">
                    Login Lamp
                </h1>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="relative overflow-hidden rounded-[22px] border border-[#21452d] bg-[linear-gradient(180deg,rgba(12,31,19,0.92),rgba(7,20,12,0.96))] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_45px_rgba(0,0,0,0.35)] sm:px-7 sm:py-8"
                >
                    <div
                        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                            lampOn
                                ? 'opacity-100 bg-[radial-gradient(circle_at_34%_34%,rgba(255,226,132,0.14),transparent_34%),radial-gradient(circle_at_70%_42%,rgba(255,226,132,0.08),transparent_32%)]'
                                : 'opacity-20 bg-[radial-gradient(circle_at_34%_34%,rgba(111,219,134,0.10),transparent_34%),radial-gradient(circle_at_70%_42%,rgba(111,219,134,0.04),transparent_32%)]'
                        }`}
                    />

                    <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_minmax(320px,390px)]">
                        <div className="relative flex min-h-[320px] items-end justify-center">
                            <div
                                className={`pointer-events-none absolute top-14 h-[240px] w-[360px] -translate-y-0 rounded-[50%] blur-[10px] transition-opacity duration-500 ${
                                    lampOn ? 'opacity-100' : 'opacity-10'
                                }`}
                                style={{
                                    clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
                                    background: 'linear-gradient(180deg, rgba(255, 241, 188, 0.82), rgba(255, 226, 132, 0.08))'
                                }}
                            />
                            <div className="pointer-events-none absolute bottom-12 h-14 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,228,141,0.22),transparent_70%)]" />

                            <button
                                type="button"
                                onClick={() => setLampOn((value) => !value)}
                                className="group relative h-[290px] w-[210px] cursor-pointer"
                                aria-label="Allumer ou eteindre la lampe"
                            >
                                <div
                                    className={`absolute left-1/2 top-6 h-[62px] w-[158px] -translate-x-1/2 rounded-[80px_80px_18px_18px] bg-[linear-gradient(180deg,#fffef9_0%,#efe8d7_100%)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:-translate-x-1/2 ${
                                        lampOn
                                            ? 'shadow-[0_0_35px_rgba(255,239,180,0.65),0_0_90px_rgba(255,224,130,0.25)]'
                                            : 'shadow-none'
                                    }`}
                                >
                                    <div className="absolute inset-x-[14px] bottom-[-8px] h-4 rounded-full bg-[rgba(255,251,238,0.85)]" />
                                </div>
                                <div className="absolute left-1/2 top-[86px] h-[138px] w-[18px] -translate-x-1/2 rounded-xl bg-[linear-gradient(180deg,#f6f1e7,#d8d0c2)]" />
                                <div className="absolute bottom-14 left-1/2 h-3 w-[72px] -translate-x-1/2 rounded-xl bg-[linear-gradient(180deg,#f6f1e7,#d8d0c2)]" />
                                <div className="absolute bottom-[34px] left-1/2 h-[14px] w-[108px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#f6f1e7,#d8d0c2)]" />
                                <span className="absolute bottom-12 right-[34px] h-[14px] w-[14px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffe2bb,#c78f5a)] shadow-[0_0_10px_rgba(255,211,160,0.45)]" />
                            </button>
                        </div>

                        <div className="relative rounded-[26px] border border-[#d8ead8] bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.20)] backdrop-blur-[12px] sm:p-7">
                            <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[linear-gradient(180deg,rgba(47,143,70,0.06),rgba(47,143,70,0))]" />
                            <div className="relative">
                                <div className="mb-6 text-center">
                                    <h2 className="text-[1.55rem] font-bold text-[#103a1f]">Connexion</h2>
                                    <p className="mt-1 text-sm text-[#54705c]">
                                        Entre ton email et ton mot de passe.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-4 rounded-2xl border border-[rgba(255,154,154,0.35)] bg-[rgba(255,154,154,0.08)] px-4 py-3 text-sm text-[#ff9a9a]">
                                        {error}
                                    </div>
                                )}

                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="mb-1.5 block text-[0.92rem] text-[#3f5f49]">Email</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="dev@gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-[14px] border border-[#cfe5cf] bg-[#f8fcf7] px-4 py-3 text-[#103a1f] outline-none transition placeholder:text-[#8aa08f] focus:border-[#2f8f46] focus:bg-white focus:shadow-[0_0_0_0.2rem_rgba(47,143,70,0.14)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[0.92rem] text-[#3f5f49]">Mot de passe</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="Votre mot de passe"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-[14px] border border-[#cfe5cf] bg-[#f8fcf7] px-4 py-3 text-[#103a1f] outline-none transition placeholder:text-[#8aa08f] focus:border-[#2f8f46] focus:bg-white focus:shadow-[0_0_0_0.2rem_rgba(47,143,70,0.14)]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full rounded-full border border-[#2f8f46] bg-[#2f8f46] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(47,143,70,0.20)] transition hover:-translate-y-px hover:bg-[#256f38]"
                                    >
                                        login
                                    </button>
                                </form>

                                <div className="mt-5 flex flex-col gap-2 text-[0.92rem] sm:flex-row sm:justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setLampOn((value) => !value)}
                                        className="text-left text-[#2f8f46] transition hover:text-[#256f38]"
                                    >
                                        Changer l ambiance
                                    </button>
                                    <Link to="/register" className="text-[#2f8f46] transition hover:text-[#256f38]">
                                        Creer un compte
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
