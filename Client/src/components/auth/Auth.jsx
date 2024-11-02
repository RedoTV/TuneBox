import { useState } from 'react';
import { registerUser, signInUser } from '../../services/api_service';
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook
import './Auth.css';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignIn, setIsSignIn] = useState(true);
    const { login } = useAuth(); // Get the login function from context

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (isSignIn) {
                response = await signInUser(name, password);
            } else {
                response = await registerUser(name, email, password);
            }

            // Assuming the response structure matches AuthResponseDto
            const { token, userName, userId } = response;

            // Call login with token, user name, and user ID
            login(token, userName, userId);
            console.log("Authenticated with token:", token);
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isSignIn ? "Вход" : "Регистрация"}</h2>
            <form onSubmit={handleSubmit}>
                {!isSignIn && (
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                )}
                <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isSignIn ? "Войти" : "Зарегистрироваться"}</button>
            </form>
            <button onClick={() => setIsSignIn(!isSignIn)}>
                Переключиться на {isSignIn ? "регистрацию" : "вход"}
            </button>
        </div>
    );
}