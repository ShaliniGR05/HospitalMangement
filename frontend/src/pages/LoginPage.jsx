import LoginForm from "../components/LoginForm";
import "./LoginPage.css";

function LoginPage({ onLogin, isLoading, error }) {
  return (
    <main className="login-page">
      <section className="login-card">
        <p className="kicker">HMS Access</p>
        <h1>Login</h1>
        <p className="intro">Use your username and password to continue.</p>
        <LoginForm onLogin={onLogin} isLoading={isLoading} error={error} />
      </section>
    </main>
  );
}

export default LoginPage;
