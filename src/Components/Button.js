export function Button({ children, onClick, className = '', type = 'button' }) {
	return (
	  <button
		type={type}
		onClick={onClick}
		className={`px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-sm transition-colors ${className}`}
	  >
		{children}
	  </button>
	);
  }