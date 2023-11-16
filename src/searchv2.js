function MyComponent() {
    const [inputValue, setInputValue] = React.useState('');
    const [domainData, setDomainData] = React.useState({});
    const [fetchingStatus, setFetchingStatus] = React.useState({});
    const [selectedDomain, setSelectedDomain] = React.useState(null);
    const [minRecordsFilter, setMinRecordsFilter] = React.useState(0);
  
    const handleInputChange = (event) => {
      setInputValue(event.target.value);
    };
  
    const handleMinRecordsChange = (event) => {
      setMinRecordsFilter(parseInt(event.target.value, 10));
    };
  
    const handleFetchData = () => {
      const domains = inputValue.split(',').map(d => d.trim());
      setDomainData({});
      setFetchingStatus(domains.reduce((acc, domain) => ({ ...acc, [domain]: true }), {}));
      
      domains.forEach(domain => {
        if (!domain) return;
        
        fetch(`https://dns.google/resolve?name=${domain}&type=ALL`)
          .then(response => response.json())
          .then(data => {
            setDomainData(prev => ({ ...prev, [domain]: data }));
          })
          .finally(() => {
            setFetchingStatus(prev => ({ ...prev, [domain]: false }));
          });
      });
    };
  
    const handleCardClick = (domain) => {
      const domainInfo = domainData[domain];
      if (domainInfo && domainInfo.Answer?.length >= minRecordsFilter) {
        setSelectedDomain(domainInfo);
      }
    };
  
    return (
      <div>
        <div className="mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter domains, separated by commas"
            className="border p-2 mr-2"
          />
          <button onClick={handleFetchData} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Fetch DNS Data
          </button>
          <input type="number" value={minRecordsFilter} onChange={handleMinRecordsChange} placeholder="Min records" className="border p-2 ml-2" />
        </div>
        <div className="grid grid-cols-3 gap-4 my-4">
          {Object.keys(fetchingStatus).map((domain) => (
            <div
              key={domain}
              className={`card p-4 rounded shadow ${fetchingStatus[domain] ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'}`}
              onClick={() => handleCardClick(domain)}
            >
              <div className="font-bold">
                {domain}
                {domainData[domain]?.Answer && <span> ({domainData[domain].Answer.length})</span>}
              </div>
              {fetchingStatus[domain] && <div className="spinner mt-2">Loading...</div>}
            </div>
          )).filter((_, domain) => {
            const answerCount = domainData[domain]?.Answer?.length || 0;
            return answerCount >= minRecordsFilter;
          })}
        </div>
        {selectedDomain && (
          <div className="popup fixed inset-0 bg-gray-600 bg-opacity-50 z-50" onClick={() => setSelectedDomain(null)}>
            <div className="popup-inner bg-white p-4 border rounded shadow-lg fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <button onClick={() => setSelectedDomain(null)} className="close-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full float-right">
                Close
              </button>
              <h3 className="text-lg font-bold mb-4">
                {selectedDomain.Question[0].name} ({selectedDomain.Answer?.length || 0} records)
              </h3>
              <dl className="text-sm">
                {selectedDomain.Answer && selectedDomain.Answer.map((answer, index) => (
                  <React.Fragment key={index}>
                    <dt className="font-semibold">{answer.name} ({answer.type})</dt>
                    <dd className="mb-2">{answer.data}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          </div>
        )}
      </div>
    );
  }