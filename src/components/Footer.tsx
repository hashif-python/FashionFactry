import { useNavigate } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#1A3A35] text-white pt-16 pb-8 mt-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14">

        {/* BRAND */}
        <div className="space-y-4">
          <img src="/logo_smooth_128.png" className="h-14" />

          <h3 className="text-2xl font-semibold text-[#C8A962] tracking-wide">
            FashionFactory
          </h3>

          <p className="text-white/70 text-sm leading-relaxed">
            Premium fashion essentials — stylish watches, modern shoes, and
            elegant spectacles. Quality and style delivered to your doorstep.
          </p>
        </div>

        {/* SHOP */}
        <div>
          <h4 className="text-lg font-semibold mb-5 text-[#C8A962]">Shop</h4>

          <ul className="space-y-3 text-white/80">
            {[
              { name: "Home", link: "/" },
              { name: "Watches", link: "/watches" },
              { name: "Shoes", link: "/shoes" },
              { name: "Spectacles", link: "/spectacles" },
            ].map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => navigate(item.link)}
                  className="hover:text-[#C8A962] transition-colors duration-200"
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 className="text-lg font-semibold mb-5 text-[#C8A962]">Support</h4>

          <ul className="space-y-3 text-white/80">
            <li>
              <button
                onClick={() => navigate("/about")}
                className="hover:text-[#C8A962] transition-colors duration-200"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/contact")}
                className="hover:text-[#C8A962] transition-colors duration-200"
              >
                Contact Us
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/terms")}
                className="hover:text-[#C8A962] transition-colors duration-200"
              >
                Terms & Conditions
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/privacy")}
                className="hover:text-[#C8A962] transition-colors duration-200"
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h4 className="text-lg font-semibold mb-5 text-[#C8A962]">Contact</h4>

          <ul className="space-y-3 text-white/80 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={17} className="text-[#C8A962]" />
              +91 89214 63109
            </li>

            <li className="flex items-center gap-2">
              <Mail size={17} className="text-[#C8A962]" />
              admin@fashionfactory.in
            </li>


            <li>
              <a
                target="_blank"
                href="https://www.instagram.com/fashionfactry___?igsh=cDFrdG5nbjQ5OWw1&utm_source=qr"
                className="flex items-center gap-2 hover:text-[#C8A962] transition-colors duration-300"
              >
                <Instagram size={20} className="text-[#C8A962]" />
                <span>Instagram</span>
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C8A962]">📍</span>
              <span className="leading-relaxed">
                Fashion Factry,
                Pezhummoodu,
                Poovachal P.O,
                Trivandrum – 695575
              </span>
            </li>


          </ul>


        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="text-center text-white/60 text-sm mt-14 tracking-wide">
        © {new Date().getFullYear()} FashionFactory • All Rights Reserved
      </div>
    </footer>
  );
};
