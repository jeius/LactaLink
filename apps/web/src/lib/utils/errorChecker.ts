export function isAbortErrorStatus(status: number): status is 499 {
  return status === 499;
}
