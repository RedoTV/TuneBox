import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, signInUser } from '../../services/api_service';
import { useAuth } from '../../contexts/AuthContext';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignIn, setIsSignIn] = useState(true);
    const { login } = useAuth(); // Хук для авторизации
    const navigate = useNavigate(); // Хук для навигации

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (isSignIn) {
                // Авторизация
                response = await signInUser(name, password);
            } else {
                // Регистрация
                response = await registerUser(name, email, password);
            }

            const { token, userName, userId } = response;

            // Сохранение данных пользователя в контексте
            login(token, userName, userId);

            // Перенаправление на главную страницу
            navigate('/');
        } catch (error) {
            console.error("Ошибка аутентификации:", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                {/* Заголовок формы */}
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                    {isSignIn ? "Вход" : "Регистрация"}
                </h2>

                {/* Форма ввода данных */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Поле Email (только для регистрации) */}
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

                    {/* Поле Имя */}
                    <input
                        type="text"
                        placeholder="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    {/* Поле Пароль */}
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    {/* Кнопка отправки формы */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        {isSignIn ? "Войти" : "Зарегистрироваться"}
                    </button>
                </form>

                {/* Переключатель между регистрацией и входом */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsSignIn(!isSignIn)}
                        className="text-blue-600 hover:underline"
                    >
                        {isSignIn
                            ? "Нет аккаунта? Зарегистрироваться"
                            : "Уже есть аккаунт? Войти"}
                    </button>
                </div>
            </div>
        </div>
    );
}