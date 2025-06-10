// pages/500.tsx

/**
 * Custom 500 Server Error page component.
 * This component is displayed when a server-side error occurs.
 */
const Custom500: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-center">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-400 mb-4">
          500
        </h1>
        <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-6">
          Server Error
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          We're sorry, but something went wrong on our server. Please try again later.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default Custom500;
