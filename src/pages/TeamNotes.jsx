import { useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { UserPlus, MoreVertical, FileText, Activity } from 'lucide-react';
import './TeamNotes.css';

const TeamNotes = ({ onOpenNote }) => {
  const { members, pendingInvites, inviteCollaborator } = useTeam();
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInvite = (e) => {
    e.preventDefault();
    if (inviteEmail) {
      inviteCollaborator(inviteEmail);
      setInviteEmail('');
      setShowInviteForm(false);
    }
  };

  return (
    <div className="team-notes-page">
      <div className="page-header">
        <div className="header-badge"><Activity size={12} className="mr-2"/> MEDICAL SCIENCE</div>
        <div className="title-row mt-4">
          <h1 className="text-5xl font-bold">Anatomy Study Group</h1>
          <div className="header-actions">
            <div className="team-avatars">
              {members.map(m => (
                <img key={m.id} src={m.avatar} alt={m.name} title={m.name} />
              ))}
              <div className="avatar-more">+{pendingInvites.length}</div>
              <span className="member-count">{members.length} Active Members</span>
            </div>
          </div>
        </div>

        <div className="action-row mt-6">
          <div className="relative">
            <button className="btn btn-primary" onClick={() => setShowInviteForm(!showInviteForm)}>
              <UserPlus size={18} /> Invite Member
            </button>
            {showInviteForm && (
              <div className="invite-dropdown shadow-lg">
                <form onSubmit={handleInvite}>
                  <input 
                    type="email" 
                    placeholder="teammate@university.edu" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary mt-2 w-full">Send Invite</button>
                </form>
                {pendingInvites.length > 0 && (
                  <div className="pending-list mt-4">
                    <p className="text-xs text-secondary mb-2">Pending Invites</p>
                    {pendingInvites.map(inv => (
                      <div key={inv.id} className="text-sm">{inv.email}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="btn-icon circle ml-4"><MoreVertical size={20}/></button>
        </div>
      </div>

      <div className="content-layout mt-12">
        <div className="notebooks-section">
          <div className="section-header flex-between mb-6">
            <h2 className="text-xl font-bold">Team Notebooks</h2>
            <div className="filter-pills">
              <button className="pill active">All</button>
              <button className="pill">Exam Prep</button>
              <button className="pill">Labs</button>
            </div>
          </div>

          <div className="notebook-grid">
            <div className="notebook-card p-6" onClick={() => onOpenNote({type: 'text', title: 'Nervous System Review'})}>
               <div className="icon-wrapper mb-4"><Activity size={24}/></div>
               <h3 className="text-2xl font-bold mb-2">Nervous System Review</h3>
               <p className="text-secondary text-sm mb-6">Comprehensive breakdown of cranial nerves and central nervous system pathways...</p>
               <div className="card-footer flex-between">
                 <div className="flex items-center gap-2">
                   <img src={members[0].avatar} className="avatar-tiny" alt=""/>
                   <span className="text-xs text-secondary">Edited by {members[0].name}</span>
                 </div>
                 <span className="text-xs font-bold text-secondary uppercase">2H AGO</span>
               </div>
            </div>

             <div className="notebook-card p-6" onClick={() => onOpenNote({type: 'text', title: 'Cardiovascular Pathways'})}>
               <div className="icon-wrapper mb-4"><Activity size={24}/></div>
               <h3 className="text-2xl font-bold mb-2">Cardiovascular Pathways</h3>
               <p className="text-secondary text-sm mb-6">Comparison study of systemic vs pulmonary circulation. Focus on valve malfunctions...</p>
               <div className="card-footer flex-between">
                 <div className="flex items-center gap-2">
                   <img src={members[1].avatar} className="avatar-tiny" alt=""/>
                   <span className="text-xs text-secondary">Edited by {members[1].name}</span>
                 </div>
                 <span className="text-xs font-bold text-secondary uppercase">YESTERDAY</span>
               </div>
            </div>
          </div>

          <div className="highlight-card mt-8 flex cursor-pointer" onClick={() => onOpenNote({type: 'drawing', title: 'Musculoskeletal Midterm Quiz'})}>
             <div className="flex-1 p-8">
               <h3 className="text-2xl font-bold text-white mb-2">Musculoskeletal Midterm Quiz</h3>
               <p className="text-gray-300 text-sm w-3/4">Shared flashcards and practice questions for the upcoming skeletal identification exam...</p>
               <div className="flex items-center mt-8 pt-4 border-t border-gray-700">
                  <div className="avatars-group mr-4">
                    <img src={members[0].avatar} alt=""/>
                    <img src={members[1].avatar} alt=""/>
                  </div>
                  <span className="text-xs text-gray-400">Collaborative Deck</span>
                  <span className="ml-auto text-xs text-white uppercase font-bold tracking-wider">LIVE NOW</span>
               </div>
             </div>
          </div>
        </div>

        <div className="chat-section">
          <div className="chat-header flex-between mb-6">
            <h3 className="font-bold flex items-center gap-2"><div className="dot-green"></div> Live Discussion</h3>
            <span className="text-xs text-secondary font-bold uppercase">{members.length+1} ONLINE</span>
          </div>

          <div className="chat-messages">
            <div className="message pt-4">
              <img src={members[0].avatar} className="avatar-small" alt=""/>
              <div className="message-content">
                <div className="text-xs font-bold mb-1">{members[0].name}</div>
                <div className="message-bubble bg-gray">Has anyone uploaded the photos from today's lab yet?</div>
              </div>
            </div>

            <div className="message pt-4">
              <img src={members[1].avatar} className="avatar-small" alt=""/>
              <div className="message-content">
                <div className="text-xs font-bold mb-1">{members[1].name}</div>
                <div className="message-bubble bg-gray">Working on it! Just resizing them so PeerPad doesn't crash lol.</div>
              </div>
            </div>

            <div className="message pt-4 self">
              <div className="message-content align-right">
                <div className="message-bubble bg-black text-white">Perfect, I'll start linking them to the review sheet once you're done.</div>
              </div>
            </div>
          </div>

          <div className="chat-input-wrapper mt-4">
             <input type="text" placeholder="Send a message..." className="chat-input" />
             <button className="chat-send-btn btn-primary circle"><Activity size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamNotes;
