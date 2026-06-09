import { Route as rootRouteImport } from "./routes/__root";
import { Route as SearchRouteImport } from "./routes/search";
import { Route as ResetPasswordRouteImport } from "./routes/reset-password";
import { Route as ProfileRouteImport } from "./routes/profile";
import { Route as PrivacyRouteImport } from "./routes/privacy";
import { Route as PrayerRouteImport } from "./routes/prayer";
import { Route as OnboardingRouteImport } from "./routes/onboarding";
import { Route as NativeAuthCallbackRouteImport } from "./routes/native-auth-callback";
import { Route as HomeRouteImport } from "./routes/home";
import { Route as AuthRouteImport } from "./routes/auth";
import { Route as IndexRouteImport } from "./routes/index";
import { Route as ReadIndexRouteImport } from "./routes/read.index";
import { Route as ReadBookRouteImport } from "./routes/read.$book";
import { Route as ReadBookIndexRouteImport } from "./routes/read.$book.index";
import { Route as ReadBookChapterRouteImport } from "./routes/read.$book.$chapter";

const SearchRoute = SearchRouteImport.update({
  id: "/search",
  path: "/search",
  getParentRoute: () => rootRouteImport,
} as any);
const ResetPasswordRoute = ResetPasswordRouteImport.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => rootRouteImport,
} as any);
const ProfileRoute = ProfileRouteImport.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => rootRouteImport,
} as any);
const PrivacyRoute = PrivacyRouteImport.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => rootRouteImport,
} as any);
const PrayerRoute = PrayerRouteImport.update({
  id: "/prayer",
  path: "/prayer",
  getParentRoute: () => rootRouteImport,
} as any);
const OnboardingRoute = OnboardingRouteImport.update({
  id: "/onboarding",
  path: "/onboarding",
  getParentRoute: () => rootRouteImport,
} as any);
const NativeAuthCallbackRoute = NativeAuthCallbackRouteImport.update({
  id: "/native-auth-callback",
  path: "/native-auth-callback",
  getParentRoute: () => rootRouteImport,
} as any);
const HomeRoute = HomeRouteImport.update({
  id: "/home",
  path: "/home",
  getParentRoute: () => rootRouteImport,
} as any);
const AuthRoute = AuthRouteImport.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => rootRouteImport,
} as any);
const IndexRoute = IndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRouteImport,
} as any);
const ReadIndexRoute = ReadIndexRouteImport.update({
  id: "/read/",
  path: "/read/",
  getParentRoute: () => rootRouteImport,
} as any);
const ReadBookRoute = ReadBookRouteImport.update({
  id: "/read/$book",
  path: "/read/$book",
  getParentRoute: () => rootRouteImport,
} as any);
const ReadBookIndexRoute = ReadBookIndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => ReadBookRoute,
} as any);
const ReadBookChapterRoute = ReadBookChapterRouteImport.update({
  id: "/$chapter",
  path: "/$chapter",
  getParentRoute: () => ReadBookRoute,
} as any);

const ReadBookRouteWithChildren = ReadBookRoute._addFileChildren({
  ReadBookChapterRoute,
  ReadBookIndexRoute,
});

export const routeTree = rootRouteImport._addFileChildren({
  IndexRoute,
  AuthRoute,
  HomeRoute,
  NativeAuthCallbackRoute,
  OnboardingRoute,
  PrayerRoute,
  PrivacyRoute,
  ProfileRoute,
  ResetPasswordRoute,
  SearchRoute,
  ReadBookRoute: ReadBookRouteWithChildren,
  ReadIndexRoute,
});
