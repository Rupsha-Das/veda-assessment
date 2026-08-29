"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Camera,
  ChevronDown,
  Check,
} from "lucide-react";
import AppPage from "@/components/app/AppPage";
import { Button } from "@/components/ui/button";

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[#ff633d]" : "bg-[#e5e5e5]"
        }`}
      >
        <span
          className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[--color-border] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[--color-border] px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#fff1ec] text-[#ff633d]">
          {icon}
        </span>
        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="px-4 py-1.5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-2.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="h-9 rounded-lg border border-[--color-border] bg-background px-3 text-sm text-foreground outline-none focus:border-[#ff633d] focus:ring-2 focus:ring-[#ff633d]/20"
      />
    </div>
  );
}

export default function SettingsPage() {
  const [receiveAlerts, setReceiveAlerts] = useState(true);
  const [gradeDigest, setGradeDigest] = useState(true);
  const [autoCheck, setAutoCheck] = useState(false);

  return (
    <AppPage title="Settings" icon={Settings}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-3 sm:p-5 lg:p-6">
        <section className="animate-rise-in">
          <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            <span className="text-[#ff633d]">Settings</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your profile, preferences, and notifications
          </p>
        </section>

        {/* Profile */}
        <SectionCard
          icon={<User className="size-4" />}
          title="Profile"
          desc="Your personal and account details"
        >
          <div className="flex items-center gap-4 py-3">
            <div className="relative">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#292929] text-lg font-bold text-white">
                MR
              </span>
              <button
                className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#ff633d] text-white shadow"
                aria-label="Change photo"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Madhur Rastogi
              </p>
              <p className="text-xs text-muted-foreground">
                Science Teacher · Delhi Public School
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <Field label="Full name" value="Madhur Rastogi" />
            <Field label="Email" value="madhur.rastogi@dps.edu" />
            <Field label="School" value="Delhi Public School" />
            <Field label="Subject" value="Science" />
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={<Bell className="size-4" />}
          title="Notifications"
          desc="Choose what you want to be notified about"
        >
          <div className="divide-y divide-[--color-border]">
            <Toggle
              checked={receiveAlerts}
              onChange={() => setReceiveAlerts((v) => !v)}
              label="Submission alerts"
              hint="When a student submits an assignment"
            />
            <Toggle
              checked={gradeDigest}
              onChange={() => setGradeDigest((v) => !v)}
              label="Grading digest"
              hint="A weekly summary of grading activity"
            />
            <Toggle
              checked={autoCheck}
              onChange={() => setAutoCheck((v) => !v)}
              label="Automatic checks"
              hint="Run AI checks on new uploads automatically"
            />
          </div>
        </SectionCard>

        {/* Appearance */}
        <SectionCard
          icon={<Palette className="size-4" />}
          title="Appearance"
          desc="Customise how VedaAI looks"
        >
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-medium text-foreground sm:w-32">
              Theme
            </label>
            <div className="relative flex-1">
              <select className="h-10 w-full appearance-none rounded-lg border border-[--color-border] bg-background px-3 pr-10 text-sm text-foreground outline-none focus:border-[#ff633d] focus:ring-2 focus:ring-[#ff633d]/20">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard
          icon={<Shield className="size-4" />}
          title="Security"
          desc="Manage account access"
        >
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-medium text-foreground sm:w-32">
              Two-factor auth
            </label>
            <button
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[--color-border] bg-white px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-gray-50"
            >
              <Check className="size-4 text-[#16a34a]" />
              Enabled
            </button>
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Button className="bg-[#ff633d] text-white hover:bg-[#ff633d]/80">
            <Save className="size-4" />
            Save changes
          </Button>
        </div>
      </div>
    </AppPage>
  );
}
