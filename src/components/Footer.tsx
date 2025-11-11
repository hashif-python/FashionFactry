import { Facebook, Instagram, Twitter, Youtube, CreditCard } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const VisaIcon = () => (
  <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="4" fill="white" />
    <path d="M20.925 21h-3.238l2.023-12h3.238L20.925 21zm11.603-11.672c-.641-.248-1.651-.517-2.908-.517-3.204 0-5.461 1.652-5.479 4.019-.016 1.75 1.613 2.725 2.845 3.307 1.266.596 1.692.977 1.688 1.51-.008.816-1.008 1.19-1.942 1.19-1.297 0-1.986-.184-3.048-.639l-.417-.194-.454 2.725c.758.34 2.16.635 3.615.649 3.406 0 5.617-1.633 5.641-4.16.013-1.387-.852-2.44-2.722-3.307-1.134-.562-1.83-.937-1.822-1.506 0-.505.587-1.045 1.854-1.045.943-.015 1.776.195 2.357.414l.283.137.454-2.583zm8.033 4.913c-.284-.742-.798-1.982-.798-1.982s-.164-.434-.257-.715l-.131.631s-.372 1.745-.452 2.111l1.638-.045zm4.182-5.24h-2.509c-.777 0-1.361.218-1.701.985l-4.829 11.12h3.405s.558-1.496.684-1.826l4.16.005c.097.428.396 1.82.396 1.82h3.006l-2.612-12.104zM11.84 9l-3.167 8.182-.338-1.685C7.751 13.752 6.08 11.72 4.228 10.588L7.13 21h3.431l5.11-12H11.84z" fill="#1434CB" />
    <path d="M6.607 9H.907L.864 9.24c4.063.967 6.752 3.302 7.867 6.108L7.34 10.003C7.147 9.248 6.579 9.03 6.607 9z" fill="#F7B600" />
  </svg>
);

const MastercardIcon = () => (
  <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="4" fill="white" />
    <circle cx="18" cy="16" r="10" fill="#EB001B" />
    <circle cx="30" cy="16" r="10" fill="#F79E1B" />
    <path d="M24 9.333c-1.977 1.667-3.245 4.197-3.245 7.067 0 2.87 1.268 5.4 3.245 7.067 1.977-1.667 3.245-4.197 3.245-7.067 0-2.87-1.268-5.4-3.245-7.067z" fill="#FF5F00" />
  </svg>
);

const RupayIcon = () => (
  <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="4" fill="white" />
    <path d="M10 12h4v8h-4v-8zm6 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4v-8zm10 0h4v2h-4v6h4v-2h-2v-2h4v6h-6v-10zm8 0h6v2h-4v2h4v2h-4v2h4v2h-6v-10z" fill="#097939" />
    <circle cx="12" cy="16" r="1" fill="#00A94F" />
  </svg>
);

const AmexIcon = () => (
  <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
    <rect width="48" height="32" rx="4" fill="#006FCF" />
    <path d="M8 12l2 8h3l-2-8H8zm5 0l1.5 8h2.5l1.5-8H16zm5 0v8h3l2-4v4h3v-8h-3l-2 4v-4h-3zm10 0l-2 8h3l.5-2h2l.5 2h3l-2-8h-5zm1.5 2l.5 2h-1l.5-2z" fill="white" />
  </svg>
);

export const Footer = ({ onNavigate }: FooterProps) => {
  return (
    <footer className="text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#C8A962]">FashionFactry</h3>
            <p className="text-sm text-white/80">
              Premium watches, shoes, and spectacles for the modern lifestyle.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#C8A962]">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-white/80 hover:text-[#C8A962] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-white/80 hover:text-[#C8A962] transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button className="text-white/80 hover:text-[#C8A962] transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button className="text-white/80 hover:text-[#C8A962] transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="text-white/80 hover:text-[#C8A962] transition-colors">
                  Support
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#C8A962]">Follow Us</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#2D5550] flex items-center justify-center hover:bg-[#C8A962] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#2D5550] flex items-center justify-center hover:bg-[#C8A962] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#2D5550] flex items-center justify-center hover:bg-[#C8A962] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#2D5550] flex items-center justify-center hover:bg-[#C8A962] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2D5550] pt-8">
          <div className="mb-6">
            <h5 className="text-sm font-semibold mb-4 text-[#C8A962]">We Accept</h5>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="bg-white p-2 rounded-lg hover:shadow-lg transition-shadow">
                <VisaIcon />
              </div>
              <div className="bg-white p-2 rounded-lg hover:shadow-lg transition-shadow">
                <MastercardIcon />
              </div>
              <div className="bg-white p-2 rounded-lg hover:shadow-lg transition-shadow">
                <RupayIcon />
              </div>
              <div className="bg-white p-2 rounded-lg hover:shadow-lg transition-shadow">
                <AmexIcon />
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#2D5550] rounded-lg border border-[#3D6B64]">
                <CreditCard className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">UPI</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-white/70">
            <p>&copy; {new Date().getFullYear()} FashionFactry. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
