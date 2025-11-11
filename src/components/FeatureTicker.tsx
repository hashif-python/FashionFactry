import { ChevronRight } from 'lucide-react';

export const FeatureTicker = () => {
  const features = [
    "Smart Straps Launching Soon",
    "AI Lens Preview Technology",
    "Vegan Leather Shoes Collection",
    "Winter Edition Spectacles",
  ];

  return (
    <div className="bg-white text-black py-2 overflow-hidden border-y border-black/10">
      <div className="relative flex">
        <div className="flex items-center gap-8 animate-scroll whitespace-nowrap">
          {[...features, ...features].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 px-4">
              <span className="font-medium text-sm tracking-wide">
                {feature}
              </span>
              <ChevronRight className="w-4 h-4 text-black/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
