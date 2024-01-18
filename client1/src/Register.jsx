import  React,{useState, useContext } from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const user = useContext(UserContext);
  const navigate = useNavigate();

  function registerUser(e) {
    e.preventDefault();
    const data = { email, password };
    axios.post('http://localhost:5500/api/tasks/register', data, { withCredentials: true })
      .then(response => {
        user.setEmail(response.data.email);
        setEmail("");
        setPassword("");
        navigate("/");
      });
  }
  return (
    <form action="" onSubmit={e => registerUser(e)}>
      <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button type="submit">register</button>
    </form>
  );

}

export default Register;