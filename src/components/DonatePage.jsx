import React from 'react';

const DonatePage = () => {
  return (
<div className="flex-1 w-full overflow-y-auto flex flex-col items-center justify-start p-6 pb-24 space-y-10">
      <div className="max-w-2xl w-full text-center">
        <h2 className="text-4xl font-serif text-primary-text mb-4">Support the Mission</h2>

        <p className="text-secondary-text mb-12">
          Your generous support helps run and maintain this app. Leveraging AI technology can get expensive, so every contribution helps keep this space available for reflection and guidance. I am truly grateful for your support.
        </p>

        {/* GCash Section */}
        <div className="p-6 bg-surface rounded-lg">
          <h3 className="text-2xl font-bold text-accent mb-4">GCash</h3>
          <img src="/images/gcash_qr.png" alt="GCash QR Code" className="w-48 h-48 mx-auto object-contain" />
          <p className="mt-4 text-secondary-text">Scan with your GCash app to donate.</p>
        </div>

        {/* Maya Section */}
        <div className="p-6 bg-surface rounded-lg">
          <h3 className="text-2xl font-bold text-accent mb-4">Maya</h3>
          <img src="/images/maya_qr.png" alt="Maya QR Code" className="w-48 h-48 mx-auto object-contain" />
          <p className="mt-4 text-secondary-text">Scan with your Maya app to donate.</p>
        </div>
      </div>

      {/* ✅ Ko-fi iframe donation panel at the bottom */}
      <div className="w-full flex flex-col items-center justify-center mt-12 mb-24 space-y-4 px-4">
        <h3 className="text-2xl font-bold text-accent text-center">
          Donate via PayPal or Card using Ko-fi
        </h3>
        <div className="w-full max-w-2xl" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
  <iframe
    id="kofiframe"
    src="https://ko-fi.com/lyndon025/?hidefeed=true&widget=true&embed=true&preview=true&theme=dark"
    title="Ko-fi Donation Panel"
    style={{
      border: 'none',
      width: '100%',
      height: '600px',
      padding: '4px',
      background: '#05122dff',
      borderRadius: '0.5rem',
      boxShadow: '0 0 10px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
    }}
  />
</div>

      </div>
    </div>
  );
};



export default DonatePage;
