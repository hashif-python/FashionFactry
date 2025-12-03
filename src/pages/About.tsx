export const About = () => {
    return (
        <div className="min-h-screen py-10 px-6 flex justify-center">
            <div className="max-w-3xl bg-white/10 backdrop-blur p-8 rounded-xl text-white">

                <h1 className="text-4xl font-bold mb-4 text-[#C8A962]">About Us</h1>

                <p className="text-white/80 mb-4 leading-relaxed">
                    Welcome to <span className="text-[#C8A962] font-semibold">FashionFactory</span>,
                    your trusted destination for premium curated Watches, Shoes, and Spectacles.
                    Our mission is simple — deliver stylish, high-quality products at the best price,
                    ensuring you enjoy a smooth and reliable shopping experience.
                </p>

                <p className="text-white/80 mb-4 leading-relaxed">
                    Every product listed on our platform undergoes strict quality checks,
                    and we work with verified vendors to ensure authenticity and comfort.
                    Whether you're upgrading your wardrobe or buying a thoughtful gift,
                    FashionFactory offers premium choices tailored to your taste.
                </p>

                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">Why Choose Us?</h2>

                <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Premium curated collection of Watches, Shoes & Spectacles</li>
                    <li>100% secure payments</li>
                    <li>Fast shipping and hassle-free returns</li>
                    <li>Top-notch customer support</li>
                    <li>Best offers and exclusive deals</li>
                </ul>

                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">Our Vision</h2>

                <p className="text-white/80 leading-relaxed">
                    To become India’s most trusted fashion destination by
                    combining quality, affordability, and convenience — all in one place.
                </p>
            </div>
        </div>
    );
};
