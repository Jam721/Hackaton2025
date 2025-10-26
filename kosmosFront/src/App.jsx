import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { CookiesProvider } from 'react-cookie';

import { Main } from "./pages/main/main"
import { Header } from "./components/header/header"

import { Login } from "./pages/auth/login"
import { Register } from "./pages/auth/register"
import { AllComets } from "./pages/comet/comets"

import { Home } from "./pages/Home/Home"
import CometDetail from "./pages/CometDetail/CometDetail"

function isAuthenticated() {
  return Boolean(localStorage.getItem('authToken'));
}

function App() {
  
  return ( 
  <CookiesProvider>
  <Router>
      <Header />
      

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all" element={<Main />} />
        <Route
          path="/mine"
          element={
            isAuthenticated()
              ? <Main />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="/comets" element={<AllComets />} />
        <Route path="/comet/:id" element={<CometDetail />} />

        <Route
          path="/login"
          element={
            isAuthenticated()
              ? <Navigate to="/" replace />
              : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated()
              ? <Navigate to="/" replace />
              : <Register />
          }
        />


      </Routes>
  </Router>
  </CookiesProvider>
  )
}

export default App;