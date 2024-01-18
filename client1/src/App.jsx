import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Link, Route,Routes, useNavigate } from "react-router-dom"; // Import Routes
import UserContext from "./UserContext";
import axios from "axios";
import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import './App.css'

function App() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5500/api/tasks/user", { withCredentials: true })
      .then(response => {
        setEmail(response.data.email);
      });
  }, []);

  function logout() {
    axios.post("http://localhost:5500/api/tasks/logout", {}, { withCredentials: true })
      .then(() => {
        setEmail("");
        navigate("/");
      });
  }

  return (
    <UserContext.Provider value={{ email, setEmail }}>
      <nav>
        <Link to="/">Home</Link>
        {!email ? (
          <>
            <Link to="login">Login</Link>
            <Link to="register">Register</Link>
          </>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </main>
    </UserContext.Provider>
  );
}

export default App
