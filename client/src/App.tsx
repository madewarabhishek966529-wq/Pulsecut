import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function App() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    api<{ ok: boolean }>("/health")
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="text-5xl font-bold bg-gradient-to-r from-pulse to-pulse-2 bg-clip-text text-transparent"
      >
        Pulsecut
      </motion.h1>
      <p className="text-muted">Edit at the speed of the beat.</p>
      <span className="text-xs text-muted">API: {status}</span>
    </div>
  );
}
