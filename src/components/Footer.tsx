import { Mail, Phone, MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  return (
    <footer className="bg-[#0B1D39] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#C8A962]">Fashionfactry</h3>
            <p className="text-gray-300 text-sm">
              Premium watches, shoes, and spectacles for the modern lifestyle.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-300 hover:text-[#C8A962] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('watches')}
                  className="text-gray-300 hover:text-[#C8A962] transition-colors"
                >
                  Watches
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shoes')}
                  className="text-gray-300 hover:text-[#C8A962] transition-colors"
                >
                  Shoes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('spectacles')}
                  className="text-gray-300 hover:text-[#C8A962] transition-colors"
                >
                  Spectacles
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +1 234 567 8900</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@fashionfactry.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>Mon-Fri: 9AM - 6PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Fashionfactry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
