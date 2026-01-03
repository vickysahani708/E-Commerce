import React from 'react'
import '../CSS/Login.css'
import { useState } from 'react'

function Login() {
  const [state, setState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: "",      // changed from username
    email: "",
    password: "",
  });

  const changeHandle = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    console.log("Login request:", formData);

    let responseData;

    await fetch('http://localhost:4000/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, password: formData.password }),
    })
      .then((res) => res.json())
      .then((data) => (responseData = data));

    if (responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.message);
    }
  };

  const signup = async () => {
    console.log("Signup request:", formData);

    let responseData;

    await fetch("http://localhost:4000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => (responseData = data));

    if (responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.message);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h1>{state}</h1>

        <div className="login-fields">
          {state === "Sign Up" && (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={changeHandle}
              placeholder="User Name"
            />
          )}

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={changeHandle}
            placeholder="Email Address"
          />

          <input
            type="password"
            name="password"
            value={formData.password} // FIXED ✔
            onChange={changeHandle}
            placeholder="Password"
          />
        </div>

        <button onClick={() => (state === "Login" ? login() : signup())}>
          Continue
        </button>

        {state === "Sign Up" ? (
          <p className="login-login">
            Already have an account?
            <span onClick={() => setState("Login")}> Login</span>
          </p>
        ) : (
          <p className="login-login">
            Create an account?
            <span onClick={() => setState("Sign Up")}> Click here</span>
          </p>
        )}

        <div className="login-agree">
          <input type="checkbox" />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
