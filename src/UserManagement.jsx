import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css';

const API_URL = "http://localhost:3000/api/user"; // Ensure port matches your Next.js server

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', firstname: '', lastname: ''
    });

    // Load users from MongoDB on startup
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_URL);
            setUsers(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${selectedId}`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            resetForm();
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchUsers();
            } catch (err) {
                alert("Delete failed");
            }
        }
    };

    const startEdit = (user) => {
        setIsEditing(true);
        setSelectedId(user._id);
        setFormData({
            username: user.username,
            email: user.email,
            password: '', // Keep password blank for security during edit
            firstname: user.firstname,
            lastname: user.lastname
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setIsEditing(false);
        setSelectedId(null);
        setFormData({ username: '', email: '', password: '', firstname: '', lastname: '' });
    };

    return (
        <div className="admin-container">
            <div className="glass-panel">
                <header className="admin-header">
                    <h1>User Management Portal</h1>
                    <p>Manage cloud-synced user records from MongoDB Atlas</p>
                </header>

                <section className="form-section">
                    <div className="card">
                        <h2 className="card-title">{isEditing ? "Update User Profile" : "Register New Account"}</h2>
                        <form onSubmit={handleSubmit} className="modern-form">
                            <div className="form-grid">
                                {!isEditing && (
                                    <div className="input-box">
                                        <label>Username</label>
                                        <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="e.g., admin123" required />
                                    </div>
                                )}
                                <div className="input-box">
                                    <label>Email Address</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="user@example.com" required />
                                </div>
                                {!isEditing && (
                                    <div className="input-box">
                                        <label>Password</label>
                                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required />
                                    </div>
                                )}
                                <div className="input-box">
                                    <label>First Name</label>
                                    <input value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} placeholder="John" />
                                </div>
                                <div className="input-box">
                                    <label>Last Name</label>
                                    <input value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} placeholder="Doe" />
                                </div>
                            </div>
                            <div className="form-footer">
                                <button type="submit" className="btn-primary">
                                    {isEditing ? "Save Changes" : "Create User"}
                                </button>
                                {(isEditing || formData.username) && <button type="button" onClick={resetForm} className="btn-ghost">Reset</button>}
                            </div>
                        </form>
                    </div>
                </section>

                <section className="table-section">
                    <div className="table-card">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>User Profile</th>
                                    <th>Contact Info</th>
                                    <th>Status</th>
                                    <th className="center">Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="status-msg">Loading database records...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="4" className="status-msg">No users found in Atlas.</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="user-info">
                                                    <span className="username">@{user.username}</span>
                                                    <span className="fullname">{user.firstname} {user.lastname}</span>
                                                </div>
                                            </td>
                                            <td><span className="email">{user.email}</span></td>
                                            <td><span className="badge-active">ACTIVE</span></td>
                                            <td className="actions-cell">
                                                <button className="edit-btn" onClick={() => startEdit(user)}>Edit</button>
                                                <button className="delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}