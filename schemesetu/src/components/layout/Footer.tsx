import { APP_CONFIG } from '@/config/app';
import { PrototypeBadge } from './PrototypeBadge';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-deep-indigo text-white/80 mt-auto" role="contentinfo">
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="text-white font-semibold text-base mb-3">
              {APP_CONFIG.name}
            </div>
            <p className="text-sm leading-relaxed text-white/60 prose-body">
              {APP_CONFIG.tagline}. Helping beneficiaries discover suitable NSFDC
              schemes and understand real repayment costs.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {APP_CONFIG.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Official sources */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3">
              Official Sources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={APP_CONFIG.urls.nsfdc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  NSFDC Official Website
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={APP_CONFIG.urls.pmSuraj}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  PM-SURAJ Portal
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={APP_CONFIG.urls.nsfdcSchemes}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  NSFDC Scheme Details
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Prototype notice */}
          <div>
            <h3 className="text-white font-medium text-sm mb-3">Notice</h3>
            <p className="text-xs text-white/50 leading-relaxed mb-3">
              {APP_CONFIG.disclaimers.notOfficial}
            </p>
            <PrototypeBadge />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40 text-center sm:text-left">
            {APP_CONFIG.disclaimers.notOfficial}
          </p>
          <p className="text-xs text-white/40">
            Data last verified:{' '}
            <time dateTime={APP_CONFIG.dataSource.lastVerified}>
              {APP_CONFIG.dataSource.lastVerified}
            </time>
          </p>
        </div>
      </div>
    </footer>
  );
}
