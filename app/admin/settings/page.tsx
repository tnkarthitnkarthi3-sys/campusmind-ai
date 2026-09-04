"use client";

import { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Bell,
  Database,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowStudentRegistration: true,
    allowFacultyRegistration: false,
    emailNotifications: true,
    announcementNotifications: true,
    auditLogging: true,
  });

  function saveSettings() {
    localStorage.setItem(
      "campusmind_admin_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            System
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure CampusMind AI administrative preferences.
          </p>
        </div>

        {saved && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Settings saved successfully.
          </div>
        )}

        <div className="space-y-5">
          <SettingSection
            icon={<Settings size={19} />}
            title="General"
            description="Core application behavior."
          >
            <Toggle
              label="Maintenance Mode"
              description="Temporarily restrict normal application access."
              checked={settings.maintenanceMode}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  maintenanceMode: value,
                })
              }
            />

            <Toggle
              label="Allow Student Registration"
              description="Allow new student accounts to be registered."
              checked={settings.allowStudentRegistration}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  allowStudentRegistration: value,
                })
              }
            />

            <Toggle
              label="Allow Faculty Registration"
              description="Faculty accounts should normally be created by administrators."
              checked={settings.allowFacultyRegistration}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  allowFacultyRegistration: value,
                })
              }
            />
          </SettingSection>

          <SettingSection
            icon={<Bell size={19} />}
            title="Notifications"
            description="Control administrative notification preferences."
          >
            <Toggle
              label="Email Notifications"
              description="Enable system email notifications."
              checked={settings.emailNotifications}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  emailNotifications: value,
                })
              }
            />

            <Toggle
              label="Announcement Notifications"
              description="Notify users when important announcements are published."
              checked={settings.announcementNotifications}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  announcementNotifications: value,
                })
              }
            />
          </SettingSection>

          <SettingSection
            icon={<ShieldCheck size={19} />}
            title="Security"
            description="Security and administrative audit controls."
          >
            <Toggle
              label="Audit Logging"
              description="Track important administrative actions."
              checked={settings.auditLogging}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  auditLogging: value,
                })
              }
            />
          </SettingSection>

          <SettingSection
            icon={<Database size={19} />}
            title="Database"
            description="Application database information."
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                PostgreSQL
              </p>

              <p className="mt-1 text-xs text-slate-500">
                CampusMind AI is connected to the configured PostgreSQL
                database through Prisma.
              </p>
            </div>
          </SettingSection>

          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Save size={17} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function SettingSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <div>
          <h2 className="font-bold text-slate-900">
            {title}
          </h2>

          <p className="text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {children}
      </div>
    </section>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </label>
  );
}