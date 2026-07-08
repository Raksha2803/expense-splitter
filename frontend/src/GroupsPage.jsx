import { useState, useEffect } from "react";
import { getGroups, getCurrentUser, createGroup } from "./api";

function GroupsPage({ onLogout, onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  async function loadData() {
    try {
      const [groupData, userData] = await Promise.all([getGroups(), getCurrentUser()]);
      setGroups(groupData);
      setCurrentUser(userData);
    } catch (err) {
      setError("Could not load groups.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    onLogout();
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    setError("");
    try {
      await createGroup(newGroupName, currentUser.id);
      setNewGroupName("");
      await loadData();
    } catch (err) {
      setError("Could not create group.");
    }
  }

  return (
    <div className="page">
      <div className="topbar">
        <h2>Your groups</h2>
        <button onClick={handleLogout}>Log out</button>
      </div>

      {currentUser && <p className="muted">Logged in as {currentUser.name}</p>}
      {error && <p className="error-text">{error}</p>}

      {loading && <p className="muted">Loading...</p>}

      {!loading && !error && groups.length === 0 && (
        <p className="muted">You're not in any groups yet.</p>
      )}

      {groups.map((group) => (
        <div
          key={group.id}
          className="card clickable"
          onClick={() => onSelectGroup(group.id)}
        >
          <div className="card-title">{group.name}</div>
          <div className="card-subtitle">
            {group.members.length} member{group.members.length !== 1 ? "s" : ""}
          </div>
        </div>
      ))}

      <h3>Create a new group</h3>
      <form className="inline-form" onSubmit={handleCreateGroup}>
        <input
          type="text"
          placeholder="Group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          required
        />
        <button type="submit" className="primary">Create</button>
      </form>
    </div>
  );
}

export default GroupsPage;