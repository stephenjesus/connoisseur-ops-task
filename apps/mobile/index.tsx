import { registerRootComponent } from "expo";

import App from "./App";
import { ErrorBoundary } from "./src/components/error-boundary";

function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

registerRootComponent(Root);
