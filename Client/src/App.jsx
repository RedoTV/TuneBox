import './App.css';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext'; // Import useAuth hook

function App() {
  const { user, logout } = useAuth(); // Get user from context
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown menu
  const navigate = useNavigate(); // Initialize useNavigate hook

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false); // Close dropdown on logout
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => navigate('/')} >
          TuneBox
        </h1> {/* Clickable header */}
        <nav>
          <ul>
            <li><a href="/playlists">Плейлисты</a></li>
            <li><a href="/music">Библиотека песен</a></li> {/* New navigation button */}
            {user ? (
              <div className="user-menu">
                <div className="user-avatar" onClick={toggleDropdown}>
                  {user.name.charAt(0)} {/* Display first letter of username */}
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-item" onClick={() => navigate('/user/playlists')}>
                      Мои Плейлисты
                    </div>
                    <div className="dropdown-item" onClick={handleLogout}>
                      Выйти
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <li><a href="/auth">Вход/Регистрация</a></li>
            )}
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
