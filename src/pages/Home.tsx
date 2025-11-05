import { useState, useEffect } from 'react';
import { Watch, Glasses, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const heroSlides = [
  {
    title: '50% OFF on Premium Watches',
    subtitle: 'Limited time offer',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: '20% OFF on Designer Shoes',
    subtitle: 'Step into style',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: '10% OFF on Spectacles',
    subtitle: 'See the world clearly',
    image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

export const Home = ({ onNavigate }: HomeProps) => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowWelcomePopup(true);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleWelcomeClose = () => {
    localStorage.setItem('hasVisited', 'true');
    setShowWelcomePopup(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center animate-slide-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Fashionfactry!</h2>
            <p className="text-xl text-[#C8A962] font-semibold mb-6">
              Get 10% off your first purchase
            </p>
            <p className="text-gray-600 mb-6">
              Use code: <span className="font-bold text-[#0B1D39]">WELCOME10</span>
            </p>
            <button
              onClick={handleWelcomeClose}
              className="bg-[#0B1D39] text-white px-8 py-3 rounded-lg hover:bg-[#C8A962] transition-colors font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="relative h-96 md:h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <p className="text-xl md:text-2xl">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6 text-gray-900" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button
            onClick={() => onNavigate('watches')}
            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="h-80 bg-gradient-to-br from-[#0B1D39] to-[#1a3a5c] flex flex-col items-center justify-center text-white p-8">
              <Watch className="w-24 h-24 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-3xl font-bold mb-2">Watches</h3>
              <p className="text-gray-300">Timeless elegance</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('shoes')}
            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="h-80 bg-gradient-to-br from-[#C8A962] to-[#b09552] flex flex-col items-center justify-center text-white p-8">
              <ShoppingBag className="w-24 h-24 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-3xl font-bold mb-2">Shoes</h3>
              <p className="text-gray-100">Step in style</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('spectacles')}
            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="h-80 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-white p-8">
              <Glasses className="w-24 h-24 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-3xl font-bold mb-2">Spectacles</h3>
              <p className="text-gray-300">See clearly, look sharp</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
