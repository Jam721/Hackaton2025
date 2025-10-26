import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import styles from './Header.module.css';

export function Header() {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        fetch("http://172.20.10.2:5075/api/user/me", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => data && setUser(data))
            .catch(() => setUser(null));
    }, []);

    function handleLogout() {
        fetch("http://172.20.10.2:5075/api/user/logout", {
            method: "POST",
            credentials: "include",
        }).finally(() => {
            window.location.href = "/login";
        });
    }

    const navItems = [
        { name: "Главная", to: "/" },
        { name: "Исследования", to: "/observations" },
        { name: "  Кометы", to: "/comets" },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Логотип и бренд */}
                <div className={styles.brand}>
                    <Link to="/" className={styles.logo}>
                        🌌 Kosmos
                    </Link>
                    <span className={styles.subtitle}>Астрономические исследования</span>
                </div>

                {/* Навигация для десктопа */}
                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Пользовательская секция */}
                <div className={styles.userSection}>
                    {user ? (
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                {user.userName ? user.userName[0].toUpperCase() : 'U'}
                            </div>
                            <span className={styles.username}>{user.userName}</span>
                            <button
                                onClick={handleLogout}
                                className={styles.logoutButton}
                                title="Выйти из системы"
                            >
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className={styles.loginButton}>
                             Войти
                        </Link>
                    )}
                </div>

                {/* Мобильное меню */}
                <button
                    className={styles.menuToggle}
                    onClick={toggleMenu}
                    aria-label="Открыть меню"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Мобильная навигация */}
                <div className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}>
                    <div className={styles.mobileNavContent}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </NavLink>
                        ))}

                        <div className={styles.mobileUserSection}>
                            {user ? (
                                <>
                                    <div className={styles.mobileUserInfo}>
                                        <div className={styles.mobileUserAvatar}>
                                            {user.userName ? user.userName[0].toUpperCase() : 'U'}
                                        </div>
                                        <span className={styles.mobileUsername}>{user.userName}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className={styles.mobileLogoutButton}
                                    >
                                        🚪 Выйти
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className={styles.mobileLoginButton}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    🔑 Войти в систему
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overlay для мобильного меню */}
                {isMenuOpen && (
                    <div
                        className={styles.overlay}
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}
            </div>
        </header>
    );
}