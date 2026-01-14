export type ProfileRole = "traveler" | "guide" | "admin";

export function getRedirectPathForRole(role: string | null | undefined): string {
  switch (role) {
    case "guide":
      return "/guide/dashboard";
    case "traveler":
      return "/traveler/bookings";
    case "admin":
      return "/admin";
    default:
      return "/account";
  }
}
