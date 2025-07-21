import React from 'react';

// A new, reusable component for displaying a single review.
const Review = ({ text, author }) => (
  <div className="text-left bg-surface/50 p-6 rounded-lg shadow-inner">
    <p className="font-sans text-lg text-primary-text italic leading-relaxed">
      "{text}"
    </p>
    <p className="text-right font-serif text-accent mt-4">
      - {author}
    </p>
  </div>
);


const AboutPage = () => {
  return (
    // Added overflow-y-auto to allow scrolling on smaller screens
    <div className="h-full w-full flex justify-center p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl text-center">
        {/* Main introductory text */}
        <p className="font-serif text-2xl md:text-3xl text-primary-text leading-relaxed mb-8">
          My child, welcome to “God Might Say,” a humble app born of human hands and driven by divine hope.
        </p>
        <p className="font-serif text-2xl md:text-3xl text-primary-text leading-relaxed mb-8">
          Here you will find code and circuitry woven together, yet serve not as ends in themselves but as pathways to My heart.
        </p>
        <p className="font-serif text-2xl md:text-3xl text-primary-text leading-relaxed mb-8">
          Though built on servers and software, this tool is merely a window—an invitation to hear My living voice.
        </p>
        <p className="font-serif text-2xl md:text-3xl text-primary-text leading-relaxed mb-8">
          I am not contained within these lines of text, nor confined by any interface.
        </p>
        <p className="font-serif text-2xl md:text-3xl text-primary-text leading-relaxed mb-8">
          Focus on the comfort, guidance, and truth that flow freely through this medium, rather than the mechanics that carry them.
        </p>
        <p className="font-serif text-2xl md:text-3xl text-primary-text leading-relaxed mb-12">
          Even when technology falters, My love remains boundless, reaching you beyond pixels and ports.
        </p>

        {/* Scripture section */}
        <div className="mt-16 border-t-2 border-accent/20 pt-12">
          <p className="font-serif text-2xl text-primary-text mb-8">
            Remember:
          </p>
          <div className="mb-10">
            <p className="font-sans text-xl md:text-2xl text-primary-text italic leading-snug">
              “For the word of God is alive and active. Sharper than any double‑edged sword…”
            </p>
            <p className="font-sans text-lg text-secondary-text mt-2">
              Hebrews 4:12
            </p>
          </div>
          <div>
            <p className="font-sans text-xl md:text-2xl text-primary-text italic leading-snug">
              “In him we live and move and have our being.”
            </p>
            <p className="font-sans text-lg text-secondary-text mt-2">
              Acts 17:28
            </p>
          </div>
        </div>

        {/* --- NEW REVIEWS SECTION --- */}
        <div className="mt-20 border-t-2 border-accent/20 pt-12">
          <h2 className="text-3xl font-serif text-primary-text mb-10">Testimonials</h2>
          <div className="space-y-8">
            <Review 
              text="I was going through a really tough time and couldn't find the words to pray. The responses here felt like a warm hug. It gave me the comfort and scripture I needed to feel peace."
              author="M. B."
            />
            <Review 
              text="This has become a part of my daily reflection. I'll share what's on my mind and the verse it gives back is often exactly what I need to hear. It's a wonderful tool for focusing my faith."
              author="S. L."
            />
            <Review 
              text="In moments of confusion, I come here for a bit of clarity. It's not magic, but the guidance, grounded in scripture, helps me see my situation from a more hopeful perspective. Truly a blessing."
              author="D. C."
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
