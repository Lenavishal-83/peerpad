import { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Key, Trash2, ChevronRight, Moon, Sun } from 'lucide-react';
import './SettingsPage.css';

const Toggle = ({ value, onChange }) => (
  <button
    className={`settings-toggle ${value ? 'on' : ''}`}
    onClick={() => onChange(!value)}
  >
    <span className="settings-toggle-thumb" />
  </button>
);

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState('English');

  const sections = [
    {
      title: 'Account',
      icon: User,
      items: [
        {
          label: 'Profile',
          desc: 'Name, email, avatar',
          action: <ChevronRight size={16} className="settings-chevron" />,
        },
        {
          label: 'Change Password',
          desc: 'Update your password',
          action: <ChevronRight size={16} className="settings-chevron" />,
        },
        {
          label: 'Connected Accounts',
          desc: 'Google, GitHub, etc.',
          action: <ChevronRight size={16} className="settings-chevron" />,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Push Notifications',
          desc: 'Team updates and mentions',
          action: <Toggle value={notifications} onChange={setNotifications} />,
        },
        {
          label: 'Email Updates',
          desc: 'Weekly summaries and invites',
          action: <Toggle value={emailUpdates} onChange={setEmailUpdates} />,
        },
      ],
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          label: 'Dark Mode',
          desc: 'Switch to dark theme',
          action: (
            <div className="settings-dark-toggle">
              <Sun size={14} />
              <Toggle value={darkMode} onChange={setDarkMode} />
              <Moon size={14} />
            </div>
          ),
        },
        {
          label: 'Language',
          desc: 'Display language',
          action: (
            <select
              className="settings-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
          ),
        },
      ],
    },
    {
      title: 'AI & Features',
      icon: Key,
      items: [
        {
          label: 'AI Suggestions',
          desc: 'Smart note summaries and insights',
          action: <Toggle value={aiSuggestions} onChange={setAiSuggestions} />,
        },
        {
          label: 'Auto-Save',
          desc: 'Automatically save notes as you type',
          action: <Toggle value={autoSave} onChange={setAutoSave} />,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Privacy Settings',
          desc: 'Manage data and sharing',
          action: <ChevronRight size={16} className="settings-chevron" />,
        },
        {
          label: 'Two-Factor Authentication',
          desc: 'Add an extra layer of security',
          action: <ChevronRight size={16} className="settings-chevron" />,
        },
        {
          label: 'Sessions',
          desc: 'Manage active sessions',
          action: <ChevronRight size={16} className="settings-chevron" />,
        },
      ],
    },
    {
      title: 'Data',
      icon: Globe,
      items: [
        {
          label: 'Export Notes',
          desc: 'Download all your notes as PDF or ZIP',
          action: <ChevronRight size={16} className="settings-chevron" />,
        },
        {
          label: 'Import',
          desc: 'Import from Notion, Evernote, etc.',
          action: <ChevronRight size={16} className="settings-chevron" />,
        },
      ],
    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-sub">Manage your account, preferences, and app behaviour.</p>
      </div>

      <div className="settings-content">
        {sections.map(section => (
          <div key={section.title} className="settings-section">
            <div className="settings-section-header">
              <section.icon size={16} className="settings-section-icon" />
              <h2 className="settings-section-title">{section.title}</h2>
            </div>
            <div className="settings-section-body">
              {section.items.map((item, i) => (
                <div key={i} className="settings-row">
                  <div className="settings-row-text">
                    <span className="settings-row-label">{item.label}</span>
                    <span className="settings-row-desc">{item.desc}</span>
                  </div>
                  <div className="settings-row-action">{item.action}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div className="settings-section settings-danger-section">
          <div className="settings-section-header">
            <Trash2 size={16} style={{ color: '#ef4444' }} />
            <h2 className="settings-section-title" style={{ color: '#ef4444' }}>Danger Zone</h2>
          </div>
          <div className="settings-section-body">
            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Delete Account</span>
                <span className="settings-row-desc">Permanently delete your account and all data. This cannot be undone.</span>
              </div>
              <button className="settings-danger-btn">Delete Account</button>
            </div>
          </div>
        </div>

        <p className="settings-version">PeerPad v1.0.0 — Academic Sanctuary</p>
      </div>
    </div>
  );
};

export default SettingsPage;