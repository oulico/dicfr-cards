import { NavLink } from 'react-router-dom';

export function TabBar() {
  return (
    <nav className="tab-bar">
      <NavLink to="/" className="tab-link" end>
        <span className="tab-icon">🏠</span>
        <span className="tab-label">Home</span>
      </NavLink>
      <NavLink to="/study" className="tab-link">
        <span className="tab-icon">📚</span>
        <span className="tab-label">Study</span>
      </NavLink>
      <NavLink to="/analytics" className="tab-link">
        <span className="tab-icon">📊</span>
        <span className="tab-label">Analytics</span>
      </NavLink>
      <NavLink to="/settings" className="tab-link">
        <span className="tab-icon">⚙️</span>
        <span className="tab-label">Settings</span>
      </NavLink>
    </nav>
  );
}
