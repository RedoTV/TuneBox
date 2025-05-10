import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Провайдер контекста для управления аутентификацией
export const AuthProvider = ({ children }) => {
    // Загрузка данных пользователя из localStorage при инициализации
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('userData');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Авторизация пользователя и сохранение в localStorage
    const login = (token, name, userId) => {
        const userData = { token, name, userId };
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
    };

    // Выход из системы и очистка данных
    const logout = () => {
        setUser(null);
        localStorage.removeItem('userData');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук для доступа к контексту аутентификации
export const useAuth = () => {
    return useContext(AuthContext);
};