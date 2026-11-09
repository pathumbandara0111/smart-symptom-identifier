import Link from "next/link";
import { HeartPulse } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-line bg-[rgba(17,24,39,.6)]">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 font-display text-lg font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-ink">
              <HeartPulse size={18} />
            </span>
            SmartSymptom
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted">
            AI-assisted symptom guidance, first-aid steps and a doctor locator. Not a replacement for professional medical care.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-ink">Tools</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/symptom-checker">Symptom checker</Link></li>
            <li><Link className="hover:text-ink" href="/image-checker">Photo scan</Link></li>
            <li><Link className="hover:text-ink" href="/first-aid">First aid guide</Link></li>
            <li><Link className="hover:text-ink" href="/doctor-locator">Doctor locator</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-ink">Need help now?</h4>
          <Link href="/emergency" className="btn btn-danger-soft btn-sm">Emergency numbers</Link>
          <p className="mt-3 text-xs text-faint">Sri Lanka ambulance: <a className="font-semibold text-ink" href="tel:1990">1990</a></p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-faint">
        ⚠️ This tool provides general information only and is not a substitute for professional medical advice.
      </div>
    </footer>
  );
}
