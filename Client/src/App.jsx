import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { FaBars } from 'react-icons/fa';

function App() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Переключение выпадающего меню пользователя
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Переключение мобильного меню
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Обработчик выхода из системы
  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <div>
      <header className="relative flex items-center justify-between bg-white py-2 text-neutral-500 shadow-md hover:text-neutral-700 focus:text-neutral-700 lg:flex-nowrap lg:justify-end lg:py-4">
        <div className="flex w-full lg:max-w-[1000px] lg:mx-auto flex-wrap items-center justify-between px-10">
          {/* Блок с логотипом */}
          <div className="ms-2">
            <h1
              className="text-xl text-black cursor-pointer hover:text-indigo-600 transition"
              onClick={() => navigate('/')}
            >
              TuneBox
            </h1>
          </div>

          {/* Кнопка гамбургер-меню для мобильных устройств */}
          <button
            className="block border-0 bg-transparent px-2 text-black/50 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 lg:hidden"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded={menuOpen ? 'true' : 'false'}
            aria-label="Toggle navigation"
            onClick={toggleMenu}
          >
            <FaBars className="w-7 h-7 text-black/50" />
          </button>

          {/* Основное навигационное меню */}
          <div
            className={`!visible mt-2 flex-grow basis-[100%] items-center lg:mt-0 lg:!flex lg:basis-auto ${menuOpen ? 'block' : 'hidden'}`}
            id="navbarSupportedContent"
          >
            <ul className="list-style-none flex flex-col items-center lg:flex-row lg:space-x-4 lg:ml-auto lg:mr-4">
              {/* Ссылка на плейлисты */}
              <li className="flex items-center my-4 ps-2 lg:my-0 lg:ps-2">
                <a
                  href="/playlists"
                  className="text-gray-800 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-2 rounded transition"
                >
                  Плейлисты
                </a>
              </li>

              {/* Ссылка на библиотеку песен */}
              <li className="flex items-center mb-4 ps-2 lg:mb-0 lg:ps-2">
                <a
                  href="/music"
                  className="text-gray-800 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-2 rounded transition"
                >
                  Библиотека песен
                </a>
              </li>

              {/* Блок авторизованного пользователя */}
              {user ? (
                <div className="relative flex items-center">
                  {/* Аватар пользователя с инициалом */}
                  <div
                    className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold cursor-pointer hover:bg-indigo-300 transition"
                    onClick={toggleDropdown}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Выпадающее меню пользователя */}
                  {dropdownOpen && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full bg-white text-gray-800 border border-gray-300 rounded-md shadow-lg min-w-[150px] z-10 mt-2">
                      {/* Ссылка на личные плейлисты */}
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition text-center"
                        onClick={() => navigate('/user/playlists')}
                      >
                        Мои Плейлисты
                      </div>
                      {/* Кнопка выхода */}
                      <div
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition text-center"
                        onClick={handleLogout}
                      >
                        Выйти
                      </div>
                    </div>
                  )}
                </div>

              ) : (
                // Ссылка на авторизацию для неавторизованных пользователей
                <li className="flex items-center">
                  <a
                    href="/auth"
                    className="text-gray-800 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-2 rounded transition"
                  >
                    Вход/Регистрация
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </header>

      {/* Основной контент страницы */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;