"use server";
// src/services/classSubject/classSubject.service.ts

import { serverFetch } from "@/lib/server-fetch";

// =========================================================================
// FETCH ACTIONS
// =========================================================================

/**
 * Server action to fetch all academic classes from the backend database.
 *
 * @returns Object with success flag and array of classes or error message.
 */
export const fetchClassesAction = async (): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  message?: string;
}> => {
  try {
    const res = await serverFetch.get("/add-class-subjects/classes");
    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load classes",
      };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message: msg };
  }
};

/**
 * Server action to fetch subjects for a specific class level from the backend.
 *
 * @param classId - UUID of the class level.
 * @returns Object with success flag and array of subjects or error message.
 */
export const fetchSubjectsAction = async (
  classId: string,
): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string; classId: string }>;
  message?: string;
}> => {
  try {
    const res = await serverFetch.get(
      `/add-class-subjects/subjects?classId=${classId}`,
    );
    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load subjects",
      };
    }

    return { success: true, data: result.data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message: msg };
  }
};

// =========================================================================
// ONBOARDING ACTIONS
// =========================================================================

/**
 * Server action to submit student onboarding profile data.
 *
 * @param name    - Student name.
 * @param classId - Chosen class level UUID.
 * @returns Object with success flag and onboarding details or error message.
 */
export const completeOnboardingAction = async (
  name: string,
  classId: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await serverFetch.patch(
      "/add-class-subjects/complete-onboarding",
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, classId }),
      },
    );

    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to submit profile setup.",
      };
    }

    return { success: true, message: result.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message: msg };
  }
};

// =========================================================================
// ADMIN ADDITION ACTIONS
// =========================================================================

/**
 * Server action to create a new class level.
 *
 * @param name - Class name.
 * @returns Object with success flag and new class details or error message.
 */
export const createClassAction = async (
  name: string,
): Promise<{
  success: boolean;
  data?: { id: string; name: string };
  message?: string;
}> => {
  try {
    const res = await serverFetch.post("/add-class-subjects/classes", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to add class.",
      };
    }

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message: msg };
  }
};

/**
 * Server action to create a new subject for a class.
 *
 * @param name    - Subject name.
 * @param classId - Parent class UUID.
 * @returns Object with success flag and new subject details or error message.
 */
export const createSubjectAction = async (
  name: string,
  classId: string,
): Promise<{
  success: boolean;
  data?: { id: string; name: string; classId: string };
  message?: string;
}> => {
  try {
    const res = await serverFetch.post("/add-class-subjects/subjects", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, classId }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to add subject.",
      };
    }

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message: msg };
  }
};

/**
 * Server action to create a new topic under a subject.
 *
 * @param name      - Topic name.
 * @param subjectId - Parent subject UUID.
 * @returns Object with success flag and new topic details or error message.
 */
export const createTopicAction = async (
  name: string,
  subjectId: string,
): Promise<{
  success: boolean;
  data?: { id: string; name: string; subjectId: string };
  message?: string;
}> => {
  try {
    const res = await serverFetch.post("/add-class-subjects/topics", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subjectId }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to add topic.",
      };
    }

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, message: msg };
  }
};
