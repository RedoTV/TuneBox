import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { registerUser, signInUser } from '../../services/api_service';
import { useAuth } from '../../contexts/AuthContext';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignIn, setIsSignIn] = useState(true);
    const { login } = useAuth(); // Get the login function from context
    const navigate = useNavigate(); // Initialize navigate hook

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (isSignIn) {
                response = await signInUser(name, password);
            } else {
                response = await registerUser(name, email, password);
            }

            const { token, userName, userId } = response;

            // Call login with token, user name, and user ID
            login(token, userName, userId);

            // Redirect to home page
            navigate('/');
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                    {isSignIn ? "Вход" : "Регистрация"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isSignIn && (
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    )}
                    <input
                        type="text"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        {isSignIn ? "Войти" : "Зарегистрироваться"}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsSignIn(!isSignIn)}
                        className="text-blue-600 hover:underline"
                    >
                        Переключиться на {isSignIn ? "регистрацию" : "вход"}
                    </button>
                </div>
            </div>
        </div>
    );
}
