import { useEffect, useState } from 'react';
import api from '../services/api';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/leaderboard');
                setUsers(res.data);
            } catch (error) {
                console.error('Error fetching leaderboard', error);
            }
            setLoading(false);
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="mt-10 text-center text-[#b7c9bb]">Chargement...</div>;
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="mb-8 text-center text-3xl font-bold text-[#f4f8f0]">Classement General</h1>

            <div className="overflow-hidden rounded-lg border border-[#d8ead8] bg-white shadow-md shadow-green-950/10">
                <table className="min-w-full divide-y divide-[#d8ead8]">
                    <thead className="bg-[#1f7a36] text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Joueur</th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Points</th>
                            <th className="hidden px-6 py-3 text-center text-xs font-medium uppercase tracking-wider sm:table-cell">Scores exacts</th>
                            <th className="hidden px-6 py-3 text-center text-xs font-medium uppercase tracking-wider sm:table-cell">Bons resultats</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8ead8] bg-white">
                        {users.map((user, index) => (
                            <tr key={user._id} className={index === 0 ? 'bg-[#f3fbf1]' : index % 2 === 0 ? 'bg-white' : 'bg-[#f8fcf7]'}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#103a1f]">
                                    {index + 1}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#103a1f]">
                                    {user.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-[#2f8f46]">
                                    {user.totalPoints}
                                </td>
                                <td className="hidden whitespace-nowrap px-6 py-4 text-center text-sm text-[#54705c] sm:table-cell">
                                    {user.exactScores}
                                </td>
                                <td className="hidden whitespace-nowrap px-6 py-4 text-center text-sm text-[#54705c] sm:table-cell">
                                    {user.correctResults}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
