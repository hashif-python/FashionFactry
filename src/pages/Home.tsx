import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

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

const testimonials = [
  {
    name: 'Priya Sharma',
    rating: 5,
    text: 'Absolutely love my new watch! The quality is exceptional and the delivery was super fast. Highly recommend FashionFactry!',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Rahul Patel',
    rating: 5,
    text: 'Best place to buy spectacles online. Great collection and the customer service is outstanding. Will definitely shop again!',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Ananya Reddy',
    rating: 5,
    text: 'The shoes are incredibly comfortable and stylish. Perfect fit and amazing quality. FashionFactry never disappoints!',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
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
    <div className="min-h-screen">
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-slide-in shadow-2xl">
            <h2 className="text-3xl font-bold text-[#1A3A35] mb-4">Welcome to FashionFactry!</h2>
            <p className="text-xl text-[#C8A962] font-semibold mb-6">
              Get 10% off your first purchase
            </p>
            <p className="text-gray-600 mb-6">
              Use code: <span className="font-bold text-[#1A3A35]">WELCOME10</span>
            </p>
            <button
              onClick={handleWelcomeClose}
              className="bg-[#1A3A35] text-white px-8 py-3 rounded-xl hover:bg-[#C8A962] transition-colors font-semibold"
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
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1A3A35]/60 to-[#1A3A35]/80 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <p className="text-xl md:text-2xl">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white bg-opacity-50'
                }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <button
            onClick={() => onNavigate('watches')}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="h-64 bg-gradient-to-br from-[#2D5550] to-[#1A3A35] flex flex-col items-center justify-center text-white p-8 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-2">Watches</h3>
                <p className="text-white/80 text-lg">Timeless elegance</p>
              </div>
            </div>
          </button>


          <button
            onClick={() => onNavigate('spectacles')}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="h-64 bg-gradient-to-br from-[#C8A962] to-[#b09552] flex flex-col items-center justify-center text-white p-8 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-2">Spectacles</h3>
                <p className="text-white/80 text-lg">See clearly, look sharp</p>
              </div>
            </div>
          </button>


          <button
            onClick={() => onNavigate('shoes')}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="h-64 bg-gradient-to-br from-[#3D6B64] to-[#2D5550] flex flex-col items-center justify-center text-white p-8 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <h3 className="text-4xl font-bold mb-2">Shoes</h3>
                <p className="text-white/90 text-lg">Step in style</p>
              </div>
            </div>
          </button>



        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#C8A962]"
                  />
                  <div>
                    <h4 className="font-semibold text-[#1A3A35] text-lg">{testimonial.name}</h4>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#C8A962] text-[#C8A962]" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Quote className="w-8 h-8 text-[#C8A962]/20 absolute -top-2 -left-2" />
                  <p className="text-gray-700 leading-relaxed pl-6">
                    {testimonial.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
