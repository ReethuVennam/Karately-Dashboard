import { useCallback, useEffect, useState } from 'react';
import { changePassword, createAdmin, listAdmins, resetPassword } from '../api/authApi';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';

const emptyCreateForm = { name: '', phone: '', email: '', pass: '', super: false };

export default function AdminManagement() {
  const showToast = useToast();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(null); // null | 'create' | 'reset' | 'change'
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [resetForm, setResetForm] = useState({ phone: '', pass: '' });
  const [changeForm, setChangeForm] = useState({ current: '', next: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listAdmins();
      setAdmins(list);
    } catch (err) {
      showToast(err?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const closeAll = () => {
    setOpenModal(null);
    setCreateForm(emptyCreateForm);
    setResetForm({ phone: '', pass: '' });
    setChangeForm({ current: '', next: '' });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAdmin({
        fullName: createForm.name.trim(),
        phoneNumber: createForm.phone.trim(),
        email: createForm.email.trim(),
        password: createForm.pass,
        isSuperAdmin: createForm.super,
      });
      closeAll();
      showToast('Admin account created');
      fetchAdmins();
    } catch (err) {
      showToast(err?.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const phone = resetForm.phone.trim();
    setSubmitting(true);
    try {
      await resetPassword(phone, resetForm.pass);
      closeAll();
      showToast('Password reset for ' + phone);
    } catch (err) {
      showToast(err?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await changePassword(changeForm.current, changeForm.next);
      closeAll();
      showToast('Password updated');
    } catch (err) {
      showToast(err?.message || 'Current password is incorrect');
    } finally {
      setSubmitting(false);
    }
  };

  const openResetFor = (phone) => {
    setResetForm({ phone, pass: '' });
    setOpenModal('reset');
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Admin management</h2>
          <div className="desc">Create admin accounts and reset passwords — super admin only</div>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-sm" type="button" onClick={() => setOpenModal('change')}>
            Change my password
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpenModal('create')}>
            + Create admin
          </button>
        </div>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id ?? a.phoneNumber} style={{ cursor: 'default' }}>
                  <td>{a.fullName}</td>
                  <td className="mono">{a.phoneNumber}</td>
                  <td className="dim">{a.email}</td>
                  <td>{a.isSuperAdmin ? <Badge variant="info">Super admin</Badge> : <Badge variant="muted">Admin</Badge>}</td>
                  <td className="dim">{a.createdAt}</td>
                  <td>
                    <button className="btn btn-sm" type="button" onClick={() => openResetFor(a.phoneNumber)}>
                      Reset password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && admins.length === 0 ? <div className="empty-note">No admin accounts found.</div> : null}
      </div>

      {openModal === 'create' ? (
        <Modal title="Create admin" onClose={closeAll}>
          <form onSubmit={handleCreateAdmin}>
            <div className="field">
              <label>Full name</label>
              <input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Phone number</label>
              <input type="tel" required value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required value={createForm.pass} onChange={(e) => setCreateForm({ ...createForm, pass: e.target.value })} />
            </div>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="ca-super"
                checked={createForm.super}
                onChange={(e) => setCreateForm({ ...createForm, super: e.target.checked })}
              />
              <label htmlFor="ca-super">Grant super admin access</label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={closeAll}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                Create admin
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {openModal === 'reset' ? (
        <Modal title="Reset password" onClose={closeAll}>
          <form onSubmit={handleResetPassword}>
            <div className="field">
              <label>Phone number</label>
              <input type="tel" required value={resetForm.phone} onChange={(e) => setResetForm({ ...resetForm, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" required value={resetForm.pass} onChange={(e) => setResetForm({ ...resetForm, pass: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={closeAll}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                Reset password
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {openModal === 'change' ? (
        <Modal title="Change my password" onClose={closeAll}>
          <form onSubmit={handleChangePassword}>
            <div className="field">
              <label>Current password</label>
              <input
                type="password"
                required
                value={changeForm.current}
                onChange={(e) => setChangeForm({ ...changeForm, current: e.target.value })}
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input type="password" required value={changeForm.next} onChange={(e) => setChangeForm({ ...changeForm, next: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={closeAll}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                Change password
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}
