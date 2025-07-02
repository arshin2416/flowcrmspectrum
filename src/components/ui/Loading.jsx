import React from 'react';

const Loading = ({ type = 'default' }) => {
  if (type === 'table') {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full shimmer"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded shimmer"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4 shimmer"></div>
            </div>
            <div className="w-20 h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded shimmer"></div>
                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-2/3 shimmer"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded shimmer"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-4/5 shimmer"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/5 shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'pipeline') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4 shimmer"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 shimmer"></div>
                  <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4 shimmer"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="h-4 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded shimmer"></div>
      </div>
    </div>
  );
};

export default Loading;