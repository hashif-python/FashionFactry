import { ChevronRight } from 'lucide-react';

export const FeatureTicker = () => {
  const features = [
    "Smart Straps Launching Soon",
    "AI Lens Preview Technology",
    "Vegan Leather Shoes Collection",
    "Winter Edition Spectacles",
  ];

  return (
    <div className="bg-[#2D5550] text-white py-2 overflow-hidden">
      <div className="relative flex">
        <div className="flex items-center gap-8 animate-scroll whitespace-nowrap">
          {[...features, ...features].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 px-4">
              <span className="font-medium text-sm tracking-wide">
                {feature}
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
