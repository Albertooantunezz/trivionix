
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Juego from './pages/Juego';
import Categorias from './pages/Categorias';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Header from './components/Header';
import AdminPanel from "./components/AdminPanel";
import { IdiomaProvider } from './context/IdiomaContext';
import './App.css';
import './index.css'; // Importa tu archivo CSS global


function App() {
  return (
    <IdiomaProvider>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/juego/:categoriaID" element={<Juego />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
    </IdiomaProvider>
  );
}

export default App;
