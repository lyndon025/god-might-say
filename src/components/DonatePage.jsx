import React, { useEffect } from 'react';

// Reusable button component (you can keep or remove if unused)
const DonateButton = ({ href, children, bgColor, hoverColor }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center justify-center w-full px-6 py-4 text-lg font-bold text-white rounded-lg transition-transform transform hover:scale-105 ${bgColor} ${hoverColor}`}
  >
    {children}
  </a>
);

// QR Code Component
const QRCode = ({ imgSrc, altText, instructions }) => (
  <div className="text-center">
    <div className="p-4 bg-white rounded-lg inline-block shadow-md">
      <img 
        src={imgSrc} 
        alt={altText} 
        className="w-48 h-48 object-contain object-center" 
      />
    </div>
    <p className="mt-4 text-secondary-text">{instructions}</p>
  </div>
);

const DonatePage = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.onload = () => {
      if (window.kofiWidgetOverlay) {
        window.kofiWidgetOverlay.draw('lyndon025', {
          type: 'floating-chat',
          'floating-chat.donateButton.text': 'Support me',
          'floating-chat.donateButton.background-color': '#00b9fe',
          'floating-chat.donateButton.text-color': '#fff'
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <h2 className="text-4xl font-serif text-primary-text mb-4">Support the Mission</h2>
        
        <p className="text-secondary-text mb-12">
          Your generous support helps run and maintain this app. Leveraging AI technology can get expensive, so every contribution helps keep this space available for reflection and guidance. I am truly grateful for your support.
        </p>

        <div className="space-y-10">


          {/* GCash Section */}
          <div className="p-6 bg-surface rounded-lg">
            <h3 className="text-2xl font-bold text-accent mb-4">GCash</h3>
            <QRCode
              imgSrc="/images/gcash_qr.png"
              altText="GCash QR Code"
              instructions="Scan with your GCash app to donate."
            />
          </div>

          {/* Maya Section */}
          <div className="p-6 bg-surface rounded-lg">
            <h3 className="text-2xl font-bold text-accent mb-4">Maya</h3>
            <QRCode
              imgSrc="/images/maya_qr.png"
              altText="Maya QR Code"
              instructions="Scan with your Maya app to donate."
            />

          </div>
                    {/* Optional Ko-fi Info Box */}
          <div className="p-6 bg-surface rounded-lg">
            <h3 className="text-2xl font-bold text-accent mb-4">Ko-fi</h3>
            <p className="text-secondary-text">Use the floating "Support Me" button in the left corner to donate via Ko-fi. <br/> Thank you!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
