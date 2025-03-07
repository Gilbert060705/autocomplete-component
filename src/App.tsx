import React, { useState } from 'react';
import { Autocomplete } from './Autocomplete';


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
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Basic String Options - Non Debounced</h2>
      <Autocomplete
        options={options}
        value={value}
        onChange={setValue}
        label="Select a fruit"
        placeholder="Search fruits..."
        description="Simple autocomplete with string options"
      />
      
      <div className="mt-4">
        <p>Selected value: {value ? String(value) : 'None'}</p>
      </div>
    </div>
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
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Multiple Selection - Non Debounced </h2>
      <Autocomplete
        options={options}
        value={value}
        onChange={(newValue) =>setValue(newValue as string[])}
        multiple={true}
        label="Select frameworks"
        placeholder="Search frameworks..."
        description="Select multiple items from the list"
      />
      
      <div className="mt-4">
        <p>Selected values: {value.length > 0 ? value.join(', ') : 'None'}</p>
      </div>
    </div>
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
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Object Options - Non Debounced</h2>
      <Autocomplete
        options={options}
        value={value || {}}
        onChange={(val) => setValue(val as User)}
        label="Select a user"
        placeholder="Search users..."
        description="Autocomplete with object options"
        getOptionLabel={(option) => `${(option as User).name} (${(option as User).email})`}
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
      
      <div className="mt-4">
        <p>Selected user: {value ? `${value.name} (${value.email})` : 'None'}</p>
      </div>
    </div>
  );
};

const Debounce = () => {
  const [options, setOptions] = useState<string[]>([
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
  ]);
  
  const [value, setValue] = useState<string | string[]>('');
  const [loading, setLoading] = useState(false);
  
  // Simulating an API call
  const handleInputChange = (inputValue: string) => {
    if (inputValue.length > 0) {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const filteredOptions = [
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
        ].filter(opt => opt.toLowerCase().includes(inputValue.toLowerCase()));
        
        setOptions(filteredOptions);
        setLoading(false);
      }, 500);
    } else {
      setOptions([
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
      ]);
    }
  };
  
  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Debounced Search</h2>
      <Autocomplete
        options={options}
        value={value}
        onChange={setValue}
        label="Select a programming language"
        placeholder="Search languages..."
        description="Search with 300ms debounce time"
        loading={loading}
        onInputChange={handleInputChange}
        debounceTime={300}
      />
      
      <div className="mt-4">
        <p>Selected value: {value ? String(value) : 'None'}</p>
      </div>
    </div>
  );
};

export const AutocompleteExamples = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Autocomplete Component Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StringOnly/>
        <MoreThanOne/>
        <OptionWithDesc/>
        <Debounce/>
      </div>
    </div>
  );
};

export default AutocompleteExamples;