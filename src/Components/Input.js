export default function Input({ value, onChange, placeholder = '', className = '', ...props }) {
	return (
	  <input
		type="text"
		value={value}
		onChange={onChange}
		placeholder={placeholder}
		className={`px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
		{...props}
	  />
	);
  }
  