import { useState, useEffect } from "react";
import { getGroup, getExpenses, getSettlements, createExpense, addMember, getGroups } from "./api";

function GroupDetailPage({ groupId, onBack }) {
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  async function loadAll() {
    try {
      const [groupData, expenseData, settlementData] = await Promise.all([
        getGroup(groupId),
        getExpenses(groupId),
        getSettlements(groupId),
      ]);
      setGroup(groupData);
      setExpenses(expenseData);
      setSettlements(settlementData);
    } catch (err) {
      setError("Could not load group data.");
    }
  }

  useEffect(() => {
    loadAll();
  }, [groupId]);

  function toggleMember(userId) {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    setError("");

    if (selectedMembers.length === 0) {
      setError("Select at least one person to split with.");
      return;
    }

    const totalAmount = parseFloat(amount);
    const shareAmount = Math.round((totalAmount / selectedMembers.length) * 100) / 100;

    const splits = selectedMembers.map((userId) => ({
      user_id: userId,
      amount_owed: shareAmount,
    }));

    try {
      await createExpense(groupId, totalAmount, description, splits);
      setDescription("");
      setAmount("");
      setSelectedMembers([]);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add expense.");
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setError("");
    try {
      const allGroups = await getGroups();
      let foundUserId = null;
      for (const g of allGroups) {
        const match = g.members.find((m) => m.email === newMemberEmail);
        if (match) {
          foundUserId = match.id;
          break;
        }
      }
      if (!foundUserId) {
        setError("No user found with that email (they may need to sign up first).");
        return;
      }
      await addMember(groupId, foundUserId);
      setNewMemberEmail("");
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add member.");
    }
  }

  function nameFor(userId) {
    const member = group?.members.find((m) => m.id === userId);
    return member ? member.name : userId;
  }

  if (!group) return <div className="page"><p className="muted">Loading...</p></div>;

  return (
    <div className="page">
      <button onClick={onBack}>Back to groups</button>
      <h2>{group.name}</h2>

      {error && <p className="error-text">{error}</p>}

      <h3>Members</h3>
      <ul className="list">
        {group.members.map((m) => (
          <li key={m.id} className="list-row">
            <span>{m.name}</span>
            <span className="muted">{m.email}</span>
          </li>
        ))}
      </ul>
      <form className="inline-form" onSubmit={handleAddMember}>
        <input
          type="email"
          placeholder="Add member by email"
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>

      <h3>Expenses</h3>
      {expenses.length === 0 && <p className="muted">No expenses yet.</p>}
      <ul className="list">
        {expenses.map((exp) => (
          <li key={exp.id} className="list-row">
            <span>{exp.description}</span>
            <span>
              {exp.amount} <span className="muted">paid by {nameFor(exp.paid_by)}</span>
            </span>
          </li>
        ))}
      </ul>

      <h3>Settlement summary</h3>
      {settlements.length === 0 && <p className="muted">Everyone is settled up.</p>}
      <ul className="list">
        {settlements.map((s, i) => (
          <li key={i} className="list-row">
            <span>{nameFor(s.from_user)} → {nameFor(s.to_user)}</span>
            <span>{s.amount}</span>
          </li>
        ))}
      </ul>

      <h3>Add an expense</h3>
      <form onSubmit={handleAddExpense}>
        <div className="field">
          <label>Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="field">
          <label>Total amount</label>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="field">
          <label>Split equally between</label>
          {group.members.map((m) => (
            <div className="checkbox-row" key={m.id}>
              <input
                type="checkbox"
                id={`member-${m.id}`}
                checked={selectedMembers.includes(m.id)}
                onChange={() => toggleMember(m.id)}
              />
              <label htmlFor={`member-${m.id}`}>{m.name}</label>
            </div>
          ))}
        </div>
        <button type="submit" className="primary">Add expense</button>
      </form>
    </div>
  );
}

export default GroupDetailPage;