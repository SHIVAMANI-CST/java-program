// components/global-components/Shimmer.jsx
export default function Shimmer({ count = 5 }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="h-8 rounded-md bg-gray-200 animate-pulse"
        ></li>
      ))}
    </ul>
  );
}
