import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Spinner, Center } from "@chakra-ui/react";
import { Topbar } from "./components/Topbar";
import { Footer } from "./components/Footer";
import { RequireAuth, RequireAdmin } from "./auth/RouteGuards";

// Route-level code splitting: the Zoom/Chakra/Firebase-heavy bundle was
// >500kB as a single chunk (NFR-004 targets a fast first load), so each
// page loads on demand instead of all up front.
const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Teachers = lazy(() => import("./pages/Teachers").then((m) => ({ default: m.Teachers })));
const TeacherDetail = lazy(() => import("./pages/TeacherDetail").then((m) => ({ default: m.TeacherDetail })));
const CurriculumList = lazy(() => import("./pages/CurriculumList").then((m) => ({ default: m.CurriculumList })));
const CurriculumDetail = lazy(() => import("./pages/CurriculumDetail").then((m) => ({ default: m.CurriculumDetail })));
const Community = lazy(() => import("./pages/Community").then((m) => ({ default: m.Community })));
const MyPage = lazy(() => import("./pages/MyPage").then((m) => ({ default: m.MyPage })));
const Payment = lazy(() => import("./pages/Payment").then((m) => ({ default: m.Payment })));
const PaymentResult = lazy(() => import("./pages/PaymentResult").then((m) => ({ default: m.PaymentResult })));
const Classroom = lazy(() => import("./pages/Classroom").then((m) => ({ default: m.Classroom })));
const LessonPlayer = lazy(() => import("./pages/LessonPlayer").then((m) => ({ default: m.LessonPlayer })));
const Login = lazy(() => import("./pages/account/Login").then((m) => ({ default: m.Login })));
const SignUp = lazy(() => import("./pages/account/SignUp").then((m) => ({ default: m.SignUp })));
const SignOut = lazy(() => import("./pages/account/SignOut").then((m) => ({ default: m.SignOut })));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const Dashboard = lazy(() => import("./pages/admin/Dashboard").then((m) => ({ default: m.Dashboard })));

function PageFallback() {
  return (
    <Center h="50vh">
      <Spinner />
    </Center>
  );
}

export function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* AD (admin) — no Topbar/Footer, separate auth context (FR-009) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <Dashboard />
            </RequireAdmin>
          }
        />

        {/* CS (customer) */}
        <Route
          path="/*"
          element={
            <>
              <Topbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/teachers/:id" element={<TeacherDetail />} />
                <Route path="/curriculum" element={<CurriculumList />} />
                <Route path="/curriculum/:id" element={<CurriculumDetail />} />
                <Route
                  path="/curriculum/:curriculumId/lessons"
                  element={
                    <RequireAuth>
                      <LessonPlayer />
                    </RequireAuth>
                  }
                />
                <Route path="/community" element={<Community />} />
                <Route path="/signin" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signout" element={<SignOut />} />
                <Route
                  path="/mypage"
                  element={
                    <RequireAuth>
                      <MyPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/payment/:productId"
                  element={
                    <RequireAuth>
                      <Payment />
                    </RequireAuth>
                  }
                />
                <Route path="/payment/result" element={<PaymentResult />} />
                <Route
                  path="/classroom/:curriculumId"
                  element={
                    <RequireAuth>
                      <Classroom />
                    </RequireAuth>
                  }
                />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </Suspense>
  );
}
