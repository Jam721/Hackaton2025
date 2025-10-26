import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export function Header() {
  const [user, setUser] = useState(null);

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
    { name: "Все исследования", to: "/all" },
    { name: "Мои исследования", to: "/mine" },
    { name: "Список комет", to: "/comets" },
  ];

  return (
    <nav style={styles.navContainer}>
      <div style={{ display: "flex", gap: "2rem" }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            {item.name}
          </NavLink>
        ))}
      </div>
      <div style={styles.userSection}>
        {user ? (
          <>
            <span style={styles.username}>{user.userName}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Выйти
            </button>
          </>
        ) : (
          <Link to="/login" style={styles.loginLink}>Войти</Link>
        )}
      </div>
    </nav>
  );
}


const styles = {
  navContainer: {
    display: "flex",
    gap: "2rem",
    background: "#020818",
    padding: "1rem",
    justifyContent: "space-between",
    alignItems: "center",
  },
  link: {
    color: "#aaa",
    textDecoration: "none",
    fontSize: "1.1rem",
  },
  activeLink: {
    color: "#63b3ed",
    fontWeight: "bold",
    borderBottom: "2px solid #63b3ed",
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  username: {
    color: '#63b3ed',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    marginRight: '1rem',
  },
  loginLink: {
    color: '#63b3ed',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    border: '1px solid #63b3ed',
    borderRadius: '4px',
    padding: '0.2rem 1.1rem',
    background: 'transparent',
    transition: 'background 0.2s',
  },
  logoutButton: {
    background: 'none',
    color: '#aaa',
    border: '1px solid #aaa',
    borderRadius: 4,
    padding: '0.2rem 1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1.05rem',
    transition: 'background 0.2s,color 0.2s',
  }
};
