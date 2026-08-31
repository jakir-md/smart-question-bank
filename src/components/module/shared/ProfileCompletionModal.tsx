"use client";
// src/components/module/shared/ProfileCompletionModal.tsx

import React, { useState, useEffect, useTransition } from "react";
import { Loader2, Sparkles, User, GraduationCap, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchClassesAction, completeOnboardingAction } from "@/services/classSubject/classSubject.service";

interface ClassOption {
  id: string;
  name: string;
}

interface ProfileCompletionModalProps {
  isOpen: boolean;
}

/**
 * ProfileCompletionModal - Non-dismissible overlay dialog modal shown to first-time students
 * to gather their name and class level.
 */
export default function ProfileCompletionModal({ isOpen }: ProfileCompletionModalProps): React.ReactNode {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [name, setName] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  // Load class list for selection dropdown
  useEffect(() => {
    if (!isOpen) return;

    const loadClasses = async () => {
      setIsLoadingClasses(true);
      const result = await fetchClassesAction();
      setIsLoadingClasses(false);

      if (result.success && result.data) {
        setClasses(result.data);
      } else {
        toast.error(result.message || "Failed to load classes dropdown options.");
      }
    };

    loadClasses();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!selectedClassId) {
      toast.error("Please select a class.");
      return;
    }

    startTransition(async () => {
      const result = await completeOnboardingAction(name, selectedClassId);

      if (result.success) {
        toast.success("Profile updated successfully!");
        // Refresh page to trigger layout recheck
        window.location.reload();
      } else {
        toast.error(result.message || "Onboarding failed. Try again.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm">
      <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/30 overflow-hidden flex flex-col p-6 relative">
        
        {/* Sparkle accents */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary-container rounded-full blur-2xl opacity-40"></div>

        {/* Modal Header */}
        <div className="text-center mb-6 relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Complete Your Profile</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Just a quick step to customize your learning journey.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          {/* Student Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="student-name" className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Your Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline flex items-center">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                id="student-name"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-on-surface placeholder:text-outline-variant"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Academic Class */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="student-class" className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Select Class
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline flex items-center">
                <GraduationCap className="h-4 w-4" />
              </span>
              <select
                id="student-class"
                className="w-full h-11 pl-10 pr-8 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-on-surface cursor-pointer appearance-none"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={isLoadingClasses || isPending}
              >
                <option value="">Choose Class level...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {/* Custom arrow decoration */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-xs">
                ▼
              </span>
            </div>
            {isLoadingClasses && (
              <span className="text-[10px] text-primary flex items-center gap-1.5 mt-1 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading classes...
              </span>
            )}
          </div>

          {/* Save Action */}
          <button
            type="submit"
            disabled={isPending || isLoadingClasses}
            className="w-full h-11 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98] duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                Save & Continue
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
