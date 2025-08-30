import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Attendance from "../pages/attendance/page";
import MyPage from "../pages/my/page";
import CreateActivity from "../pages/create-activity/page";
import ActivityDetail from "../pages/activity-detail/page";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/attendance",
    element: <Attendance />,
  },
  {
    path: "/my",
    element: <MyPage />,
  },
  {
    path: "/create-activity",
    element: <CreateActivity />,
  },
  {
    path: "/activity/:id",
    element: <ActivityDetail />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;