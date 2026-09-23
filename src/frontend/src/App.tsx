import { Layout } from "@/components/Layout";
import { CareerTrialPage } from "@/pages/CareerTrialPage";
import { LoginPage } from "@/pages/LoginPage";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: Layout,
});

const careerTrialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CareerTrialPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([careerTrialRoute, loginRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
