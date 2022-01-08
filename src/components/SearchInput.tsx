import { FunctionComponent } from "react";

interface Props {
  value: string;
  placeholder?: string;
  onInput?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

const SearchInput: FunctionComponent<Props> = ({
  value,
  placeholder,
  onInput = () => {},
  onSubmit = () => {},
}) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      className="block py-2 pr-12 pl-3 mt-1 w-full text-base placeholder-gray-400 bg-white rounded-md border border-gray-300 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500"
      onInput={(e) => {
        onInput(e.currentTarget.value);
      }}
      onSubmit={(e) => {
        onSubmit(e.currentTarget.value);
      }}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          onSubmit(e.currentTarget.value);
        }
      }}
    />
    <span className="absolute top-0 right-1 p-2 mt-2 h-10 cursor-pointer group">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        className="text-gray-500 stroke-current stroke-2 group-hover:text-gray-700"
      >
        <path
          d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
          stroke="currentColor"
          fill="none"
          fillRule="evenodd"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    </span>
  </div>
);

export default SearchInput;
