export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionError<T = never>(error: string): ActionResult<T> {
  return { success: false, error };
}
