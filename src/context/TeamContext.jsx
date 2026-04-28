import { createContext, useContext, useState, useCallback } from 'react';

const TeamContext = createContext();

export const useTeam = () => {
  return useContext(TeamContext);
};

export const TeamProvider = ({ children }) => {
  const [members, setMembers] = useState([
    { id: 1, name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex', active: true },
    { id: 2, name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah', active: true },
    { id: 3, name: 'Dr. Julian', avatar: 'https://i.pravatar.cc/150?u=julian', active: true },
  ]);
  const [pendingInvites, setPendingInvites] = useState([]);

  const inviteCollaborator = useCallback((email) => {
    const invite = {
      id: Date.now().toString(),
      email,
      status: 'pending',
      invitedAt: new Date().toISOString()
    };
    setPendingInvites(prev => [...prev, invite]);
    return invite;
  }, []);

  const generateInviteLink = useCallback(() => {
    return `${window.location.origin}/invite/${Date.now().toString(36)}`;
  }, []);

  const acceptInvite = useCallback((inviteId, user) => {
    setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
    setMembers(prev => [...prev, { id: Date.now(), name: user.name, avatar: user.avatar, active: true }]);
  }, []);

  return (
    <TeamContext.Provider value={{ members, pendingInvites, inviteCollaborator, generateInviteLink, acceptInvite }}>
      {children}
    </TeamContext.Provider>
  );
};
