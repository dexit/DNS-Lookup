import React from 'react';

export default function MyComponent() {
  const [inputValue, setInputValue] = React.useState('');
  const [domainData, setDomainData] = React.useState({});
  const [fetchingStatus, setFetchingStatus] = React.useState({});
  const [selectedDomain, setSelectedDomain] = React.useState('');
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleFetchData = () => {
    const domains = inputValue.split(',').map((d) => d.trim());
    domains.forEach((domain) => {
      if (!domain) return;

      setFetchingStatus((prev) => ({ ...prev, [domain]: true }));

      fetch(`https://dns.google/resolve?name=${domain}&type=ALL`)
        .then((response) => response.json())
        .then((data) => {
          setDomainData((prev) => ({ ...prev, [domain]: data }));
        })
        .catch((error) => {
          console.error('Fetching error for domain', domain, error);
        })
        .finally(() => {
          setFetchingStatus((prev) => ({ ...prev, [domain]: false }));
        });
    });
  };

  const handleCardClick = (domain) => {
    setSelectedDomain(domainData[domain]);

  };

  return (
    <>
      <div>
        <div className="mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter domains, separated by commas"
            className="border p-2 mr-2"
          />
          <button
            onClick={handleFetchData}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Fetch DNS Data
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 my-4">
          {Object.keys(fetchingStatus).map((domain) => (
            <div
              key={domain}
              className={`card p-4 rounded shadow ${
                fetchingStatus[domain]
                  ? 'bg-red-600 text-white text-center'
                  : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer text-center'
              }`}
              onClick={() => !fetchingStatus[domain] && handleCardClick(domain)}
            >
              <div className="font-bold">{domain}</div>
              {fetchingStatus[domain] && <div className="spinner mt-2"></div>}
            </div>
          ))}
        </div>
        {selectedDomain && (
          <div className="popup bg-white p-4 border rounded shadow-lg">
            <button
              onClick={() => setSelectedDomain('')}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
            >
              Close
            </button>
            <dl className="mt-4">
            
              {Object.entries(selectedDomain.Answer || {}).map(
                ([key, value]) => (
                  <React.Fragment key={key}>
                    <dt className="font-bold">{value.name}</dt>
                    <dd>{value.data}</dd>
                  </React.Fragment>
                )
              )}
            </dl>
          </div>
        )}
      </div>
    </>
  );
}
