import "server-only";

import type { ActionResult } from "@/lib/action-result";

export class PublicActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicActionError";
  }
}

export async function runAction<T>(
  actionName: string,
  operation: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await operation() };
  } catch (error) {
    if (error instanceof PublicActionError) {
      return { success: false, error: error.message };
    }

    console.error(`Server action "${actionName}" failed.`, error);
    return {
      success: false,
      error: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    };
  }
}

export function zodMessage(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "البيانات المدخلة غير صالحة.";
}
