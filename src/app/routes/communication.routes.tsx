import { lazy } from "react";
import type { SetupRouteConfig } from "./setup.routes";

const AnnouncementList = lazy(
  () =>
    import("@/app/modules/communication/announcements/pages/announcement-list"),
);
const AnnouncementCompose = lazy(
  () =>
    import("@/app/modules/communication/announcements/pages/announcement-compose"),
);
const AnnouncementReport = lazy(
  () =>
    import("@/app/modules/communication/announcements/pages/announcement-report"),
);

// Children of /communication -- gated on "Announcements:View" through the nav entry at
// /communication/announcements (see getPermissionForPath).
export const communicationRoutes: SetupRouteConfig[] = [
  { path: "announcements", component: AnnouncementList },
  { path: "announcements/create", component: AnnouncementCompose },
  { path: "announcements/$id/edit", component: AnnouncementCompose },
  { path: "announcements/$id", component: AnnouncementReport },
];
