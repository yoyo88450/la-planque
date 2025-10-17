interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, setSelectedCategory }: CategoryFilterProps) {
  const categoryFilters = ['all', ...categories];

  return (
    <div className="flex justify-center mb-12">
      <div className="flex space-x-3">
        {categoryFilters.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
            }`}
          >
            {category === 'all' ? 'Tous' : category}
          </button>
        ))}
      </div>
    </div>
  );
}
