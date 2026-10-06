import { useEffect } from "react";
import { useRouter } from "next/router";

export default function VisionIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/vision/home");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center text-slate-400 font-mono text-xs">
      Redirecting to Command Center...
    </div>
  );
}
