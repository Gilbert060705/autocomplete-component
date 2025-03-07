import React, { useState } from 'react';
import { Autocomplete } from './Autocomplete';

const ExampleCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const StringOnly = () => {
  const options = [
    'Apple',
    'Banana',
    'Cherry',
    'Durian',
    'Elderberry',
    'Fig',
    'Grape',
    'Honeydew',
    'Kiwi',
    'Lemon',
    'Mango',
    'Orange',
    'Papaya'
  ];
  
  const [value, setValue] = useState<string | string[]>('');
  
  return (
    <ExampleCard title="Basic String Options">
      <Autocomplete
        options={options}
        value={value}
        onChange={setValue}
        label="Select a fruit"
        placeholder="Search fruits..."
        description="Simple autocomplete with string options"
      />
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Selected value: <span className="text-gray-500">{value ? String(value) : 'None'}</span>
        </p>
      </div>
    </ExampleCard>
  );
};

const MoreThanOne = () => {
  const options = [
    'React',
    'Vue',
    'Angular',
    'Svelte',
    'Next.js',
    'Nuxt.js',
    'Ember',
    'Preact',
    'Alpine',
    'Solid',
    'Qwik'
  ];
  
  const [value, setValue] = useState<string[]>([]);
  
  return (
    <ExampleCard title="Multiple Selection">
      <Autocomplete
        options={options}
        value={value}
        onChange={(newValue) => setValue(newValue as string[])}
        multiple={true}
        label="Select frameworks"
        placeholder="Search frameworks..."
        description="Select multiple items from the list"
      />
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Selected values: 
          {value.length > 0 ? (
            <span className="font-medium text-gray-800"> {value.join(', ')}</span>
          ) : (
            <span className="text-gray-500"> None</span>
          )}
        </p>
      </div>
    </ExampleCard>
  );
};

interface User {
  id: number;
  name: string;
  email: string;
}

const OptionWithDesc = () => {
  const options: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Carol Williams', email: 'carol@example.com' },
    { id: 4, name: 'Dave Brown', email: 'dave@example.com' },
    { id: 5, name: 'Eve Davis', email: 'eve@example.com' },
    { id: 6, name: 'Frank Miller', email: 'frank@example.com' },
    { id: 7, name: 'Grace Wilson', email: 'grace@example.com' },
    { id: 8, name: 'Henry Moore', email: 'henry@example.com' }
  ];
  
  const [value, setValue] = useState<User | null>(null);
  
  return (
    <ExampleCard title="Object Options with Custom Rendering">
      <Autocomplete
        options={options}
        value={value || {}}
        onChange={(val) => setValue(val as User)}
        label="Select a user"
        placeholder="Search users..."
        description="Search by name or email address"
        getOptionLabel={(option) => `${(option as User).name}`}
        renderOption={(option, isSelected) => (
          <div className="flex flex-col">
            <span className="font-medium">{(option as User).name}</span>
            <span className="text-sm text-gray-500">{(option as User).email}</span>
          </div>
        )}
        filterOptions={(options, inputValue) => {
          return options.filter(option => {
            const user = option as User;
            const searchValue = inputValue.toLowerCase();
            return (
              user.name.toLowerCase().includes(searchValue) ||
              user.email.toLowerCase().includes(searchValue)
            );
          });
        }}
      />
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Selected user: 
          {value ? (
            <span className="font-medium text-gray-800"> {value.name} <span className="text-gray-500">({value.email})</span></span>
          ) : (
            <span className="text-gray-500"> None</span>
          )}
        </p>
      </div>
    </ExampleCard>
  );
};

const Debounce = () => {
  const languages = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    'C++',
    'PHP',
    'Ruby',
    'Go',
    'Rust',
    'Swift',
    'Kotlin'
  ];
  
  const [options, setOptions] = useState<string[]>(languages);
  const [value, setValue] = useState<string | string[]>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (inputValue: string) => {
    if (inputValue.length > 0) {
      setLoading(true);
      setTimeout(() => {
        const filteredOptions = languages.filter(
          opt => opt.toLowerCase().includes(inputValue.toLowerCase())
        );
        
        setOptions(filteredOptions);
        setLoading(false);
      }, 500);
    } else {
      setOptions(languages);
    }
  };
  
  return (
    <ExampleCard title="Debounced Search with Loading State">
      <Autocomplete
        options={options}
        value={value}
        onChange={setValue}
        label="Select a programming language"
        placeholder="Search languages..."
        description="Type to search (300ms debounce)"
        loading={loading}
        onInputChange={handleInputChange}
        debounceTime={300}
      />
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Selected value: 
          {value ? (
            <span className="font-medium text-gray-800"> {String(value)}</span>
          ) : (
            <span className="text-gray-500"> None</span>
          )}
        </p>
      </div>
    </ExampleCard>
  );
};

export const AutocompleteExamples = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Autocomplete Component</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            With this website, I tried to simulate non-debounced and debounced searching system. For the non-debounced feature, I used three examples - Single choice for string only and object, and Multiple Choice
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <StringOnly />
          <MoreThanOne />
          <OptionWithDesc />
          <Debounce />
        </div>
      </div>
    </div>
  );
};

export default AutocompleteExamples;