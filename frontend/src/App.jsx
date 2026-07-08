import { useState } from "react";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import GroupsPage from "./GroupsPage";
import GroupDetailPage from "./GroupDetailPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [showSignup, setShowSignup] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <SignupPage
          onSignupSuccess={() => setShowSignup(false)}
          onSwitchToLogin={() => setShowSignup(false)}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={() => setIsLoggedIn(true)}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  if (selectedGroupId) {
    return (
      <GroupDetailPage groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />
    );
  }

  return (
    <GroupsPage
      onLogout={() => setIsLoggedIn(false)}
      onSelectGroup={(groupId) => setSelectedGroupId(groupId)}
    />
  );
}

export default App;