import { Suspense } from "react";
import PlatformApp from "../../src/App";

function PlatformLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-sm text-muted-foreground">
      Loading SynoSys Platform...
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<PlatformLoadingState />}>
      <PlatformApp />
    </Suspense>
  );
}
