import React from 'react';

const LoadingIndicator = () => (
  <div className="flex items-end gap-3 justify-start">
    <div className="bg-gray-700 rounded-2xl rounded-bl-lg px-4 py-3 shadow-md flex items-center space-x-2">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
    </div>
  </div>
);

export default LoadingIndicator;
