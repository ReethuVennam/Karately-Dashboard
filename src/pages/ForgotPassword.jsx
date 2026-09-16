import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';

const RANDOM_PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789#$!%&';

/** Client-side convenience suggestion for the "Generate Password" button —
 *  the admin can still edit it (or type their own from scratch) before
 *  Save Changes actually submits it. Guarantees a letter + a digit so it
 *  passes the backend's password policy without relying on pure chance. */
function suggestPassword() {
  const pick = () => RANDOM_PASSWORD_CHARS[Math.floor(Math.random() * RANDOM_PASSWORD_CHARS.length)];
  const chars = ['A', '7', ...Array.from({ length: 8 }, pick)];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [existingPassword, setExistingPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleGenerateSuggestion = () => {
    const suggestion = suggestPassword();
    setNewPassword(suggestion);
    setConfirmPassword(suggestion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    setSubmitting(true);
    try {
      const data = await forgotPassword(identifier.trim(), existingPassword, newPassword, confirmPassword);
      setNewPassword(data.generatedPassword || newPassword);
      setConfirmPassword(data.generatedPassword || newPassword);
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Admin account not found or inactive');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordFieldType = showPasswords ? 'text' : 'password';

  return (
    <div className="login-wrap">
      <div className="auth-page-card">
        <div className="breadcrumb">
          <Link to="/login">Home</Link> / Forgot Password
        </div>
        <div className="auth-page-title">Forgot Password</div>

        {error ? <div className="login-err">{error}</div> : null}
        {done ? <div className="login-hint">Password updated — use it to sign in.</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fp-identifier">Mobile Number</label>
            <input
              id="fp-identifier"
              type="text"
              required
              disabled={done}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="fp-existing">Existing Password</label>
            <input
              id="fp-existing"
              type={passwordFieldType}
              autoComplete="current-password"
              required
              disabled={done}
              value={existingPassword}
              onChange={(e) => setExistingPassword(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="fp-new">New Password</label>
            <input
              id="fp-new"
              type={passwordFieldType}
              autoComplete="new-password"
              required
              minLength={8}
              disabled={done}
              placeholder="Type your own, or click Generate Password below"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="tip-box">
            <b>ⓘ Tips for a Secure Password</b>
            Use both uppercase and lowercase characters.
            <br />
            Include at least one symbol (for example, #, $, !, %, or &amp;).
            <br />
            Do not use dictionary words.
            <br />
            Passwords can contain up to 64 characters.
          </div>

          {!done ? (
            <button type="button" className="btn btn-block" onClick={handleGenerateSuggestion}>
              Generate Password
            </button>
          ) : null}

          <div className="field">
            <label htmlFor="fp-confirm">Confirm New Password</label>
            <input
              id="fp-confirm"
              type={passwordFieldType}
              autoComplete="new-password"
              required
              disabled={done}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="fp-show"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
            />
            <label htmlFor="fp-show">Show passwords</label>
          </div>

          <hr className="auth-divider" />

          <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
            {!done ? (
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => navigate('/login', { replace: true })}>
                Back to sign in
              </button>
            )}
            <button type="button" className="btn" onClick={() => navigate('/login')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
