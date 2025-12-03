export const Privacy = () => {
    return (
        <div className="min-h-screen py-10 px-6 flex justify-center">
            <div className="max-w-3xl bg-white/10 backdrop-blur p-8 rounded-xl text-white">

                <h1 className="text-4xl font-bold mb-4 text-[#C8A962]">
                    Privacy Policy
                </h1>

                <p className="text-white/80 mb-4 leading-relaxed">
                    At <span className="text-[#C8A962] font-semibold">FashionFactory</span>,
                    we respect your privacy and are committed to protecting your personal data.
                    This Privacy Policy describes how we collect, use, store, and safeguard your information.
                </p>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    1. Information We Collect
                </h2>

                <p className="text-white/80 mb-2 leading-relaxed">
                    We may collect the following information when you interact with our platform:
                </p>

                <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Name, email address, and mobile number</li>
                    <li>Delivery address and payment information</li>
                    <li>Order history and wishlist details</li>
                    <li>Device information & IP address</li>
                    <li>Cookies that improve your browsing experience</li>
                </ul>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    2. How We Use Your Information
                </h2>

                <p className="text-white/80 mb-2 leading-relaxed">
                    Your information helps us provide better service. We use it to:
                </p>

                <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Process and deliver your orders</li>
                    <li>Provide customer support</li>
                    <li>Send order notifications and updates</li>
                    <li>Improve our products, services, and website experience</li>
                    <li>Offer personalized recommendations and promotions</li>
                </ul>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    3. Payment & Security
                </h2>

                <p className="text-white/80 leading-relaxed">
                    All payments are processed securely through our trusted payment partners
                    such as Razorpay. Your card details are encrypted and never stored on our servers.
                </p>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    4. Cookies & Tracking
                </h2>

                <p className="text-white/80 leading-relaxed">
                    We use cookies to remember your preferences, improve your shopping experience,
                    and analyze website performance. You may disable cookies anytime from your browser settings.
                </p>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    5. Sharing Your Information
                </h2>

                <p className="text-white/80 mb-2 leading-relaxed">
                    We do <span className="text-[#C8A962] font-semibold">not</span> sell or trade your personal information.
                    We only share information with:
                </p>

                <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Delivery partners to ship your orders</li>
                    <li>Payment providers to complete secure transactions</li>
                    <li>Service providers for analytics and improvements</li>
                </ul>

                <p className="text-white/80 leading-relaxed">
                    All partners follow strict data protection standards.
                </p>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    6. Your Rights
                </h2>

                <p className="text-white/80 mb-2 leading-relaxed">
                    You have full control over your personal information. You can:
                </p>

                <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>View the information we store about you</li>
                    <li>Update or correct your details from your account</li>
                    <li>Request deletion of your account</li>
                    <li>Opt-out of marketing messages anytime</li>
                </ul>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    7. Data Protection
                </h2>

                <p className="text-white/80 leading-relaxed">
                    We use advanced encryption and security systems
                    to keep your data safe and protected at all times.
                </p>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    8. Changes to This Policy
                </h2>

                <p className="text-white/80 leading-relaxed">
                    We may update this Privacy Policy occasionally. Any changes will be posted
                    on this page with an updated revision date.
                </p>

                {/* ------------------------------------------------------------- */}
                <h2 className="text-2xl font-semibold text-[#C8A962] mt-8 mb-3">
                    9. Contact Us
                </h2>

                <p className="text-white/80 leading-relaxed">
                    For queries or concerns regarding privacy, please contact us at
                    <span className="text-[#C8A962]"> support@fashionfactory.in</span>.
                </p>

            </div>
        </div>
    );
};
