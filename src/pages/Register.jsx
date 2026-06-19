import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApiErrorMessage } from '../services/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_50%_18%,rgba(111,219,134,0.12),transparent_24%),linear-gradient(180deg,#0d1f13_0%,#07140c_72%)] px-4 py-10">
            <div className="mx-auto flex max-w-2xl items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="w-full rounded-[20px] border border-[#d8ead8] bg-white p-6 shadow-[0_20px_45px_rgba(0,0,0,0.24)] backdrop-blur-[10px] sm:p-7"
                >
                    <h2 className="text-[1.45rem] font-semibold text-[#103a1f]">Creer un compte utilisateur</h2>
                    <p className="mb-5 mt-2 text-[0.95rem] text-[#54705c]">
                        Inscris-toi avec le meme style que la page login, dans une version plus simple et plus directe.
                    </p>

                    {error && (
                        <div className="mb-4 rounded-2xl border border-[rgba(255,154,154,0.35)] bg-[rgba(255,154,154,0.08)] px-4 py-3 text-sm text-[#ff9a9a]">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="mb-1.5 block text-[0.94rem] text-[#3f5f49]">Name</label>
                            <input
                                type="text"
                                required
                                placeholder="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-[14px] border border-[#cfe5cf] bg-[#f8fcf7] px-4 py-3 text-[#103a1f] outline-none transition placeholder:text-[#8aa08f] focus:border-[#2f8f46] focus:bg-white focus:shadow-[0_0_0_0.2rem_rgba(47,143,70,0.14)]"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[0.94rem] text-[#3f5f49]">Email</label>
                            <input
                                type="email"
                                required
                                placeholder="nom@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-[14px] border border-[#cfe5cf] bg-[#f8fcf7] px-4 py-3 text-[#103a1f] outline-none transition placeholder:text-[#8aa08f] focus:border-[#2f8f46] focus:bg-white focus:shadow-[0_0_0_0.2rem_rgba(47,143,70,0.14)]"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[0.94rem] text-[#3f5f49]">Mot de passe</label>
                            <input
                                type="password"
                                required
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-[14px] border border-[#cfe5cf] bg-[#f8fcf7] px-4 py-3 text-[#103a1f] outline-none transition placeholder:text-[#8aa08f] focus:border-[#2f8f46] focus:bg-white focus:shadow-[0_0_0_0.2rem_rgba(47,143,70,0.14)]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-[#2f8f46] bg-[#2f8f46] px-4 py-3 text-[0.93rem] font-semibold text-white shadow-[0_10px_24px_rgba(47,143,70,0.20)] transition hover:-translate-y-px hover:bg-[#256f38]"
                        >
                            Ajouter
                        </button>
                    </form>

                    <div className="mt-5 text-sm text-[#54705c]">
                        Deja un compte ?{' '}
                        <Link to="/login" className="text-[#2f8f46] transition hover:text-[#256f38]">
                            Retour au login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;

