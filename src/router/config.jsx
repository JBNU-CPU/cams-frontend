import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Attendance from "../pages/attendance/page";
import MyPage from "../pages/my/page";
import CreateActivity from "../pages/create-activity/page";
import ActivityDetail from "../pages/activity-detail/page";
import LoginPage from "../pages/login/page";
import SignupPage from "../pages/signup/page";
import OnboardingPage from "../pages/onboarding/page";
import FindPasswordPage from "../pages/find-password/page";

const routes = [
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/home",
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
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/onboarding",
    element: <OnboardingPage />
  },
  {
    path: "/find-password",
    element: <FindPasswordPage />
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;