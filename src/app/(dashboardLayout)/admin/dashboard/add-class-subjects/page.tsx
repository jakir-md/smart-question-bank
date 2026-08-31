"use client";
// src/app/(dashboardLayout)/admin/add-class-subjects/page.tsx

import React, { useState, useEffect, useTransition } from "react";
import { Loader2, Plus, ArrowRight, BookOpen, GraduationCap, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  fetchClassesAction,
  fetchSubjectsAction,
  createClassAction,
  createSubjectAction,
  createTopicAction,
} from "@/services/classSubject/classSubject.service";

interface ClassItem {
  id: string;
  name: string;
}

interface SubjectItem {
  id: string;
  name: string;
  classId: string;
}

/**
 * AddClassSubjectsPage - Admin workspace to manage classes, subjects, and topics.
 * Synchronizes selectors and allows dynamic inline creation.
 */
export default function AddClassSubjectsPage(): React.ReactNode {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isAddingClass, setIsAddingClass] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>("");

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>("");

  const [newTopicName, setNewTopicName] = useState<string>("");

  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Load all classes on mount
  const loadClasses = async (autoSelectId?: string) => {
    setIsLoadingClasses(true);
    const result = await fetchClassesAction();
    setIsLoadingClasses(false);

    if (result.success && result.data) {
      setClasses(result.data);
      if (autoSelectId) {
        setSelectedClassId(autoSelectId);
      }
    } else {
      toast.error(result.message || "Failed to retrieve classes.");
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Fetch subjects whenever the selected class level changes
  const loadSubjects = async (classId: string, autoSelectId?: string) => {
    if (!classId) {
      setSubjects([]);
      setSelectedSubjectId("");
      return;
    }
    setIsLoadingSubjects(true);
    const result = await fetchSubjectsAction(classId);
    setIsLoadingSubjects(false);

    if (result.success && result.data) {
      setSubjects(result.data);
      if (autoSelectId) {
        setSelectedSubjectId(autoSelectId);
      } else {
        setSelectedSubjectId("");
      }
    } else {
      toast.error(result.message || "Failed to load subjects for this class.");
    }
  };

  useEffect(() => {
    loadSubjects(selectedClassId);
  }, [selectedClassId]);

  // -----------------------------------------------------------------------
  // Class Submit
  // -----------------------------------------------------------------------
  const handleClassSubmit = (): void => {
    if (!newClassName.trim()) {
      toast.error("Please enter a class name.");
      return;
    }

    startTransition(async () => {
      const result = await createClassAction(newClassName.trim());

      if (result.success && result.data) {
        toast.success("Class level added successfully!");
        const newClassId = result.data.id;
        setNewClassName("");
        setIsAddingClass(false);
        // Refresh classes list and auto-select the new one
        await loadClasses(newClassId);
      } else {
        toast.error(result.message || "Failed to create class.");
      }
    });
  };

  // -----------------------------------------------------------------------
  // Subject Submit
  // -----------------------------------------------------------------------
  const handleSubjectSubmit = (): void => {
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name.");
      return;
    }
    if (!selectedClassId) {
      toast.error("Please select a class first.");
      return;
    }

    startTransition(async () => {
      const result = await createSubjectAction(newSubjectName.trim(), selectedClassId);

      if (result.success && result.data) {
        toast.success("Subject added successfully!");
        const newSubjectId = result.data.id;
        setNewSubjectName("");
        setIsAddingSubject(false);
        // Refresh subjects and auto-select the new one
        await loadSubjects(selectedClassId, newSubjectId);
      } else {
        toast.error(result.message || "Failed to create subject.");
      }
    });
  };

  // -----------------------------------------------------------------------
  // Topic Submit
  // -----------------------------------------------------------------------
  const handleTopicSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (!newTopicName.trim()) {
      toast.error("Please enter a topic name.");
      return;
    }
    if (!selectedSubjectId) {
      toast.error("Please select a subject first.");
      return;
    }

    startTransition(async () => {
      const result = await createTopicAction(newTopicName.trim(), selectedSubjectId);

      if (result.success) {
        toast.success("Topic added successfully!");
        setNewTopicName("");
      } else {
        toast.error(result.message || "Failed to create topic.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-3xl font-bold text-on-surface">Manage Curriculum</h1>
        <p className="text-sm text-on-surface-variant">
          Add and synchronize classes, subjects, and exam topics directly into the system.
        </p>
      </div>

      {/* 1. CLASS CONFIGURATION DIV */}
      <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <GraduationCap className="h-5 w-5" />
          <h2>Class Level Configuration</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {isAddingClass ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                className="flex-1 h-11 px-4 rounded-xl border border-outline-variant bg-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-on-surface"
                placeholder="Enter new class level (e.g. Class 9)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                disabled={isPending}
              />
              <button
                type="button"
                className="h-11 px-4 border border-outline text-outline font-semibold rounded-xl hover:bg-surface-container-low transition-all cursor-pointer"
                onClick={() => {
                  setIsAddingClass(false);
                  setNewClassName("");
                }}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-11 px-5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center cursor-pointer"
                onClick={handleClassSubmit}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex gap-2">
              <select
                className="flex-1 h-11 px-4 rounded-xl border border-outline-variant bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-on-surface cursor-pointer"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={isLoadingClasses}
              >
                <option value="">Select Academic Class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="w-11 h-11 bg-primary-light text-primary font-semibold rounded-xl hover:bg-primary/10 transition-all flex items-center justify-center cursor-pointer"
                onClick={() => setIsAddingClass(true)}
                title="Add New Class"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. SUBJECT CONFIGURATION DIV */}
      <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <BookOpen className="h-5 w-5" />
          <h2>Subject Configuration</h2>
        </div>

        {!selectedClassId ? (
          <p className="text-xs text-secondary italic">Please choose a class level from above to configure subjects.</p>
        ) : (
          <div className="flex items-center gap-3">
            {isAddingSubject ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  className="flex-1 h-11 px-4 rounded-xl border border-outline-variant bg-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-on-surface"
                  placeholder="Enter new subject name (e.g. Physics)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="h-11 px-4 border border-outline text-outline font-semibold rounded-xl hover:bg-surface-container-low transition-all cursor-pointer"
                  onClick={() => {
                    setIsAddingSubject(false);
                    setNewSubjectName("");
                  }}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="h-11 px-5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center cursor-pointer"
                  onClick={handleSubjectSubmit}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex gap-2">
                <select
                  className="flex-1 h-11 px-4 rounded-xl border border-outline-variant bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-on-surface cursor-pointer"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  disabled={isLoadingSubjects}
                >
                  <option value="">Select Class Subject...</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="w-11 h-11 bg-primary-light text-primary font-semibold rounded-xl hover:bg-primary/10 transition-all flex items-center justify-center cursor-pointer"
                  onClick={() => setIsAddingSubject(true)}
                  title="Add New Subject"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. TOPIC CONFIGURATION DIV */}
      <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <FileText className="h-5 w-5" />
          <h2>Topic Configuration</h2>
        </div>

        {!selectedSubjectId ? (
          <p className="text-xs text-secondary italic">Please choose a subject from above to configure topics.</p>
        ) : (
          <form onSubmit={handleTopicSubmit} className="flex gap-2">
            <input
              type="text"
              className="flex-1 h-11 px-4 rounded-xl border border-outline-variant bg-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-on-surface"
              placeholder="Enter topic name (e.g. Gravity and Motion)"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              disabled={isPending}
            />
            <button
              type="submit"
              className="h-11 px-5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Add Topic
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
