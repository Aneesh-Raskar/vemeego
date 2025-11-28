
import React from 'react';
import { Bell, Lock, User, Video, Volume2, Moon, LucideIcon } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const SettingsSection = ({ title, icon: Icon, children }: SettingsSectionProps) => (
  <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-4 md:p-6 mb-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
        <Icon size={20} />
      </div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

interface ToggleProps {
  label: string;
  description: string;
  defaultChecked?: boolean;
}

const Toggle = ({ label, description, defaultChecked }: ToggleProps) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="font-medium text-slate-700">{label}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);

const Settings = () => {
  return (
    <div className="h-full p-4 md:p-8 overflow-y-auto max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Settings</h1>

      <SettingsSection title="Profile & Account" icon={User}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-4">
          <img 
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjQyMjAwNTB8MA&ixlib=rb-4.1.0&q=85" 
            alt="Profile" 
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div>
            <button className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-colors">
              Change Avatar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" defaultValue="Alex Morgan" className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" defaultValue="alex.morgan@lumina.com" className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200" />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Audio & Video" icon={Video}>
        <Toggle label="HD Video Quality" description="Use high definition video when available" defaultChecked />
        <Toggle label="Noise Cancellation" description="Filter out background noise" defaultChecked />
        <div className="pt-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Default Camera</label>
          <select className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200">
            <option>FaceTime HD Camera</option>
            <option>External Webcam</option>
          </select>
        </div>
      </SettingsSection>

      <SettingsSection title="Notifications" icon={Bell}>
        <Toggle label="Meeting Reminders" description="Notify me 5 minutes before meetings" defaultChecked />
        <Toggle label="Chat Messages" description="Show desktop notifications for new messages" defaultChecked />
        <Toggle label="Email Summaries" description="Send daily meeting summaries via email" />
      </SettingsSection>

      <SettingsSection title="Appearance" icon={Moon}>
        <Toggle label="Dark Mode" description="Use dark theme across the application" />
        <Toggle label="Reduced Motion" description="Minimize animations for better accessibility" />
      </SettingsSection>
    </div>
  );
};

export default Settings;
