import React,{ useState, useContext } from 'react';
import axios from 'axios';
import UserContext from './UserContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const user = useContext(UserContext);
  const navigate = useNavigate();

  function loginUser(e) {
    e.preventDefault();
    const data = { email, password };
    axios
      .post("http://localhost:5500/api/tasks/login", data, { withCredentials: true })
      .then((response) => {
        user.setEmail(response.data.email);
        setEmail("");
        setPassword("");
        setLoginError(false);
        navigate("/");
      })
      .catch(() => {
        setLoginError(true);
      });
  }
  return (
    <form action="" onSubmit={(e) => loginUser(e)}>
      {loginError && <div>LOGIN ERROR! WRONG EMAIL OR PASSWORD!</div>}
      <input
        type="email"
        placeholder='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button type='submit'>log in </button>
    </form>
  );
}

export default Login;