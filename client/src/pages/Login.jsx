// Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CoinContext } from "../context/CoinContext";

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const { setUser }             = useContext(CoinContext);
  const navigate              = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
  
      // Save the token in localStorage for subsequent requests
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Welcome Back</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={styles.button}>Login</button>
        </form>

        <p style={styles.signupText}>
          Don't have an account? <a href="/register" style={styles.signupLink}>Sign Up</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #1a1a2e, #16213e)",
  },
  formContainer: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "15px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  signupText: {
    fontSize: "14px",
    marginTop: "15px",
    color: "#666",
  },
  signupLink: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Login;
